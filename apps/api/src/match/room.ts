import type { FastifyBaseLogger } from "fastify";
import type {
  ClientMessage,
  MatchPhase,
  MatchStatus,
  PublicPlayer,
  PublicQuestion,
  ServerMessage,
} from "@quizelo/protocol";
import type { WebSocket } from "ws";
import { MATCH_CONFIG } from "./config";
import {
  consumeQuickQuotaForUsers,
  flushAnswers,
  persistMatchEnd,
  persistMatchStatus,
  persistPlayerRemove,
  persistPlayerUpdates,
} from "./persistence";
import {
  computeLobbyEloAvg,
  filterPoolBySeen,
  narrowPoolByElo,
} from "./questions";
import { rngFromSeed } from "./random";
import { registry } from "./registry";
import { scorePhase1, scorePhase2 } from "./scoring";
import { makeShadow, shadowAnswer } from "./shadow";
import type {
  AnswerRecord,
  DbQuestion,
  MatchPlayer,
  MatchState,
} from "./types";

interface Connection {
  socket: WebSocket;
  userId: string;
}

/**
 * Floor for the time elapsed between a question reveal and a real
 * human's answer. Anything faster has to be a bot or a tampered
 * client — the fastest documented fair-play reaction time on a
 * read+choose task is around 250 ms; we drop to 200 ms to leave a
 * margin for network jitter on the ack of `question_start`.
 */
const MIN_HUMAN_RESPONSE_MS = 200;

/**
 * MatchRoom owns one match's lifecycle:
 *   - WS broadcast bus
 *   - timer-driven phase progression
 *   - server-authoritative scoring + elimination
 *   - DB persistence at boundaries
 */
export class MatchRoom {
  state: MatchState;
  private readonly conns = new Map<string, Connection>();
  private readonly log: FastifyBaseLogger;
  private timer: NodeJS.Timeout | null = null;
  private rand: () => number;
  private cleanups: Array<() => void> = [];

  constructor(state: MatchState, log: FastifyBaseLogger) {
    this.state = state;
    this.log = log.child({ matchId: state.matchId });
    this.rand = rngFromSeed(state.seed);
  }

  // ─── WS ───────────────────────────────────────────────────────
  attach(userId: string, socket: WebSocket): void {
    const player = this.state.players.find((p) => p.userId === userId);
    if (!player) {
      this.send(socket, { type: "error", code: "NOT_IN_MATCH" });
      socket.close(4002, "not in match");
      return;
    }

    // Replace existing connection (e.g. tab refresh)
    const prev = this.conns.get(userId);
    if (prev) {
      try {
        prev.socket.close(4003, "superseded");
      } catch {
        /* noop */
      }
    }

    this.conns.set(userId, { socket, userId });
    this.log.info({ userId }, "ws attached");

    socket.on("close", () => {
      if (this.conns.get(userId)?.socket === socket) {
        this.conns.delete(userId);
      }
    });
    socket.on("message", (raw) => this.onMessage(userId, raw.toString()));

    // Initial snapshot
    this.send(socket, {
      type: "hello",
      matchId: this.state.matchId,
      selfId: userId,
      status: this.state.status,
      mode: this.state.mode,
      serverTime: Date.now(),
      players: this.publicPlayers(userId),
    });

    if (this.state.status === "lobby") {
      this.broadcastLobby();
    } else {
      // Re-emit current question if any so reconnect mid-question works.
      const q = this.publicQuestionFor(userId);
      if (q) this.send(socket, { type: "question", question: q });
    }
  }

  // ─── Locale lookup helpers ────────────────────────────────────
  /** DbQuestion for a stem in the requested locale, with fallback. */
  private dbqFor(stem: string, locale: string): DbQuestion | null {
    const variants = this.state.questionsByStem.get(stem);
    if (!variants) return null;
    return (
      variants.get(locale) ??
      variants.get(this.state.locale) ??
      variants.values().next().value ??
      null
    );
  }

  /** DbQuestion picked for a specific player (uses player.locale). */
  private dbqForPlayer(stem: string, userId: string): DbQuestion | null {
    const p = this.state.players.find((x) => x.userId === userId);
    return this.dbqFor(stem, p?.locale ?? this.state.locale);
  }

  private onMessage(userId: string, raw: string) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      this.sendTo(userId, { type: "error", code: "BAD_PAYLOAD" });
      return;
    }

    switch (msg.type) {
      case "ping":
        this.sendTo(userId, { type: "pong", ts: Date.now() });
        return;
      case "ready":
        // Client just (re)connected and finished its handshake — push
        // the state slices it would otherwise be missing after a
        // network drop: lobby roster, current question, transition
        // countdown, or final podium depending on where we are.
        this.sendResyncTo(userId);
        return;
      case "answer":
        if (this.state.currentPhase === "phase2") {
          this.phase2HandleAnswer(userId, msg.questionIndex, msg.choiceId);
        } else {
          this.recordAnswer(userId, msg.questionIndex, msg.choiceId);
        }
        return;
      case "pass":
        this.phase2HandlePass(userId, msg.questionIndex);
        return;
      case "leave":
        this.markLeft(userId);
        return;
    }
  }

  // ─── Lobby ────────────────────────────────────────────────────
  startLobby(): void {
    this.clearTimer();
    // Shadows trickle in over `silentFillMs` to feel like real users joining,
    // rather than landing all at once. The user-visible 5s countdown only
    // kicks in once the lobby reaches 10 players.
    this.scheduleNextShadow(Date.now() + MATCH_CONFIG.lobby.silentFillMs);

    // Start a low-frequency presence loop so connecting clients see updated rosters.
    this.startLobbyTicker();
  }

  /**
   * Plan the arrival of the next shadow. Spreads them stochastically across
   * the remaining lobby window. Re-evaluates after each arrival so a real
   * player joining mid-fill doesn't break the cadence.
   */
  private scheduleNextShadow(deadlineAt: number): void {
    if (this.state.status !== "lobby") return;

    if (this.state.players.length >= MATCH_CONFIG.size) {
      this.armStartCountdown();
      return;
    }

    const now = Date.now();
    const remainingTime = deadlineAt - now;
    const remainingSlots = MATCH_CONFIG.size - this.state.players.length;

    // Past the lobby window — top up immediately so we don't keep folks
    // waiting beyond their patience budget.
    if (remainingTime <= 0) {
      this.fillWithShadows();
      this.broadcastLobby();
      this.armStartCountdown();
      return;
    }

    const avgInterval = remainingTime / remainingSlots;
    // 0.5× to 1.5× of the average — keeps it spaced but unpredictable.
    const jitter = 0.5 + this.rand();
    const delay = Math.max(200, Math.round(avgInterval * jitter));

    this.clearTimer();
    this.timer = setTimeout(() => {
      if (this.state.status !== "lobby") return;
      if (this.state.players.length < MATCH_CONFIG.size) {
        const seat = this.state.players.length;
        this.state.players.push(makeShadow(seat, this.rand, this.state.locale));
        this.broadcastLobby();
      }
      if (this.state.players.length >= MATCH_CONFIG.size) {
        this.armStartCountdown();
      } else {
        this.scheduleNextShadow(deadlineAt);
      }
    }, delay);
  }

  /** Schedule the visible 5s "starting" countdown then phase 1. */
  private armStartCountdown(): void {
    if (this.state.lobbyStartsAt !== null) return;
    this.state.lobbyStartsAt = Date.now() + MATCH_CONFIG.lobby.startCountdownMs;
    this.broadcastLobby();
    this.clearTimer();
    this.timer = setTimeout(
      () => void this.startPhase("phase1"),
      MATCH_CONFIG.lobby.startCountdownMs,
    );
  }

  private startLobbyTicker(): void {
    const id = setInterval(() => {
      if (this.state.status !== "lobby") {
        clearInterval(id);
        return;
      }
      this.broadcastLobby();
    }, MATCH_CONFIG.lobby.tickMs);
    this.cleanups.push(() => clearInterval(id));
  }

  private fillWithShadows(): void {
    const missing = MATCH_CONFIG.size - this.state.players.length;
    for (let i = 0; i < missing; i++) {
      const seat = this.state.players.length;
      this.state.players.push(makeShadow(seat, this.rand, this.state.locale));
    }
  }

  /** Called by the matchmaker when a real player joins. */
  onPlayerJoined(): void {
    if (this.state.status !== "lobby") return;
    this.broadcastLobby();
    if (this.state.players.length >= MATCH_CONFIG.size) {
      this.armStartCountdown();
    }
  }

  // ─── Phase orchestration ──────────────────────────────────────
  private async startPhase(phase: MatchPhase): Promise<void> {
    const wasInLobby = this.state.status === "lobby";
    this.state.status = phase;
    this.state.currentPhase = phase;
    this.state.lobbyStartsAt = null;
    // Transition is over — if a client reconnects from here on it
    // should get phase_start, not the stale phase_end.
    this.state.transitionEndsAt = undefined;

    // Consume each non-shadow player's daily quota at the moment the match
    // *actually* starts (lobby → phase 1, quick mode only). Players who
    // quit during the lobby are filtered out — their `markLeft` removed
    // them from `state.players`. Premium users are filtered server-side.
    if (
      wasInLobby &&
      phase === "phase1" &&
      this.state.mode === "quick"
    ) {
      const userIds = this.state.players
        .filter((p) => !p.isShadow && p.status !== "left")
        .map((p) => p.userId);
      if (userIds.length > 0) {
        await consumeQuickQuotaForUsers(userIds).catch((err) =>
          this.log.error(err, "consumeQuickQuotaForUsers failed"),
        );
      }
    }

    // Trim then narrow the question pool when phase 1 actually starts.
    // Order matters:
    //   1. filterPoolBySeen → drop questions any lobby player saw in the
    //      last 14 days, so repeats stay extremely rare across matches.
    //   2. narrowPoolByElo  → keep the questions whose ELO target lies
    //      closest to the lobby's average ELO.
    if (wasInLobby && phase === "phase1") {
      const realIds = this.state.players
        .filter((p) => !p.isShadow && p.status !== "left")
        .map((p) => p.userId);
      try {
        const beforeSeen = this.state.questionPool.length;
        await filterPoolBySeen(this.state, realIds);
        const afterSeen = this.state.questionPool.length;
        const eloAvg = await computeLobbyEloAvg(realIds);
        narrowPoolByElo(this.state, eloAvg);
        this.log.info(
          {
            matchId: this.state.matchId,
            eloAvg,
            poolSizeBeforeSeen: beforeSeen,
            poolSizeAfterSeen: afterSeen,
            poolSizeFinal: this.state.questionPool.length,
          },
          "filtered seen + narrowed question pool",
        );
      } catch (err) {
        this.log.error(err, "filter/narrow pool failed (using wide pool)");
      }
    }

    // Phase 3: reset lives for the 3 finalists.
    if (phase === "phase3") {
      for (const p of this.state.players) {
        if (p.status === "finalist") {
          p.lives = MATCH_CONFIG.phase3.startingLives;
          p.status = "active";
        }
      }
    }

    if (phase === "phase2") {
      // Each player progresses independently through the question pool,
      // starting where phase 1 stopped so phase 2 questions don't repeat
      // anything already asked in phase 1.
      const startIdx = this.state.poolCursor;
      for (const p of this.state.players) {
        if (p.status === "active") {
          p.score = 0;
          p.streak = 0;
          p.phase2Index = startIdx;
          p.lastScoreReachedAt = Date.now();
        }
      }
      this.state.phase2EndsAt = Date.now() + MATCH_CONFIG.phase2.totalMs;
    }

    await persistMatchStatus(this.state.matchId, phase).catch((err) =>
      this.log.error(err, "persistMatchStatus failed"),
    );

    this.broadcast({
      type: "phase_start",
      phase,
      players: this.publicPlayers(),
      ...(phase === "phase2" ? { phaseEndsAt: this.state.phase2EndsAt } : {}),
    });

    if (phase === "phase2") {
      // Send each player their first question privately + start shadow loops.
      setTimeout(() => this.startPhase2Loops(), 600);
      // Global 60s timer ends the phase regardless of progress.
      this.clearTimer();
      this.timer = setTimeout(
        () => void this.endPhase("phase2"),
        MATCH_CONFIG.phase2.totalMs,
      );
      // Periodic roster broadcast for the live leaderboard.
      const rosterTick = setInterval(() => {
        if (this.state.currentPhase !== "phase2") {
          clearInterval(rosterTick);
          return;
        }
        this.broadcastRoster();
      }, 1_000);
      this.cleanups.push(() => clearInterval(rosterTick));
      return;
    }

    setTimeout(() => this.nextQuestion(), 800);
  }

  // ─── Phase 2 — per-player independent flow ────────────────────
  private startPhase2Loops(): void {
    if (this.state.currentPhase !== "phase2") return;
    for (const p of this.state.players) {
      if (p.status !== "active") continue;
      this.sendPhase2Question(p.userId);
      if (p.isShadow) this.scheduleShadowPhase2Step(p.userId);
    }
  }

  private sendPhase2Question(userId: string): void {
    if (this.state.currentPhase !== "phase2") return;
    const p = this.state.players.find((x) => x.userId === userId);
    if (!p || p.status !== "active") return;

    const idx = p.phase2Index;
    if (idx >= this.state.questionPool.length) return;

    const stem = this.state.questionPool[idx]!;
    const dbq = this.dbqFor(stem, p.locale);
    if (!dbq) return;

    if (p.isShadow) return; // shadows don't need WS payloads

    this.sendTo(userId, {
      type: "question",
      question: {
        index: idx,
        phase: "phase2",
        category: dbq.category,
        prompt: dbq.prompt,
        choices: dbq.choices.map(({ id, label }) => ({ id, label })),
        // Phase 2 has no per-question deadline — the global timer covers it.
        // We still need a number; use the phase deadline so client clamps fine.
        deadline: this.state.phase2EndsAt ?? Date.now() + 60_000,
      },
    });
  }

  private phase2HandleAnswer(
    userId: string,
    questionIndex: number,
    choiceId: string,
  ): void {
    if (this.state.currentPhase !== "phase2") return;
    const p = this.state.players.find((x) => x.userId === userId);
    if (!p || p.status !== "active") return;
    if (p.phase2Index !== questionIndex) return; // stale answer

    const stem = this.state.questionPool[p.phase2Index]!;
    const dbq = this.dbqFor(stem, p.locale);
    if (!dbq) return;
    const isCorrect = choiceId === dbq.correctChoiceId;
    const delta = isCorrect ? MATCH_CONFIG.score.phase2Correct : MATCH_CONFIG.score.phase2Wrong;

    p.score += delta;
    if (p.score > p.peakScore) p.peakScore = p.score;
    p.lastScoreReachedAt = Date.now();

    this.state.answersBuffer.push({
      userId,
      // Log the locale-specific id the player actually answered.
      questionId: dbq.id,
      questionIndex: p.phase2Index,
      phase: "phase2",
      chosenChoiceId: choiceId,
      isCorrect,
      responseMs: null,
      scoreDelta: delta,
      answeredAt: new Date(),
    });

    // Private reveal so the user sees the result of their click.
    if (!p.isShadow) {
      this.sendTo(userId, {
        type: "reveal",
        questionIndex: p.phase2Index,
        correctChoiceId: dbq.correctChoiceId,
        outcomes: [
          {
            userId,
            chosenChoiceId: choiceId,
            isCorrect,
            skipped: false,
            responseMs: null,
            scoreDelta: delta,
            score: p.score,
            livesDelta: 0,
            lives: p.lives,
            shieldUsed: false,
          },
        ],
      });
    }

    // Advance + ship next question after a brief reveal pause.
    p.phase2Index += 1;
    const delay = p.isShadow ? 0 : MATCH_CONFIG.phase2.revealMs;
    setTimeout(() => {
      if (this.state.currentPhase !== "phase2") return;
      this.sendPhase2Question(userId);
    }, delay);
  }

  private phase2HandlePass(userId: string, questionIndex: number): void {
    if (this.state.currentPhase !== "phase2") return;
    const p = this.state.players.find((x) => x.userId === userId);
    if (!p || p.status !== "active") return;
    if (p.phase2Index !== questionIndex) return;

    p.phase2Index += 1;
    this.sendPhase2Question(userId);
  }

  private scheduleShadowPhase2Step(userId: string): void {
    if (this.state.currentPhase !== "phase2") return;
    const p = this.state.players.find((x) => x.userId === userId);
    if (!p || p.status !== "active" || !p.isShadow) return;

    // Shadow profile: 2-5s per question, accuracy from existing profile.
    const delay = 2000 + Math.floor(this.rand() * 3000);
    const t = setTimeout(() => {
      if (this.state.currentPhase !== "phase2") return;
      const player = this.state.players.find((x) => x.userId === userId);
      if (!player || player.status !== "active") return;

      const idx = player.phase2Index;
      if (idx >= this.state.questionPool.length) return;
      const stem = this.state.questionPool[idx]!;
      const dbq = this.dbqFor(stem, player.locale);
      if (!dbq) return;
      const correctIdx = dbq.choices.findIndex((c) => c.id === dbq.correctChoiceId);
      // Reuse phase-1 shadow profile for accuracy.
      const accuracy = 0.55 + (player.seat % 5) * 0.06;
      const correct = this.rand() < accuracy;
      const choiceIdx = correct
        ? correctIdx
        : pickWrongIdx(correctIdx, dbq.choices.length, this.rand);
      const choiceId = dbq.choices[choiceIdx]!.id;

      this.phase2HandleAnswer(userId, idx, choiceId);
      // Schedule next shadow step.
      this.scheduleShadowPhase2Step(userId);
    }, delay);
    this.cleanups.push(() => clearTimeout(t));
  }

  private broadcastRoster(): void {
    this.broadcast({ type: "roster", players: this.publicPlayers() });
  }

  private nextQuestion(): void {
    const phase = this.state.currentPhase;
    if (!phase) return;

    // Phase 2 — bail out if the global timer is up.
    if (phase === "phase2" && this.state.phase2EndsAt && Date.now() >= this.state.phase2EndsAt) {
      void this.endPhase(phase);
      return;
    }

    // Use the global cursor so phase 1 / 3 always pick a fresh slot. The
    // cursor is bumped after phase 2 to skip past every index any player
    // consumed during phase 2.
    const next = this.state.poolCursor;

    if (next >= this.state.questionPool.length) {
      // Pool depleted — end the match.
      void this.endPhase(phase);
      return;
    }

    this.state.currentQuestionIndex = next;
    this.state.poolCursor = next + 1;
    this.state.currentAnswers.clear();
    for (const p of this.state.players) {
      p.skipped = false;
    }

    const stem = this.state.questionPool[next]!;
    const timeLimitMs = phaseQuestionMs(phase);
    const now = Date.now();
    this.state.currentQuestionStartedAt = now;
    this.state.currentQuestionDeadline = now + timeLimitMs;

    // Per-player rendering — each connected player gets the variant
    // matching their `MatchPlayer.locale` (FR or EN). Choice ids
    // differ across locales so the server's correctness check has to
    // also key on the player's locale (see recordAnswer).
    for (const [, conn] of this.conns) {
      const dbq = this.dbqForPlayer(stem, conn.userId);
      if (!dbq) continue;
      const publicQ: PublicQuestion = {
        index: next,
        phase,
        category: dbq.category,
        prompt: dbq.prompt,
        choices: dbq.choices.map(({ id, label }) => ({ id, label })),
        deadline: this.state.currentQuestionDeadline,
      };
      this.send(conn.socket, { type: "question", question: publicQ });
    }

    this.scheduleShadowAnswers(stem, timeLimitMs);
    this.clearTimer();
    this.timer = setTimeout(() => this.closeQuestion(next), timeLimitMs);
  }

  private scheduleShadowAnswers(stem: string, timeLimitMs: number): void {
    for (const p of this.state.players) {
      if (!p.isShadow || p.status !== "active") continue;
      // Each shadow scores against its own locale variant — the
      // correct choice id and choice index are locale-specific.
      const q = this.dbqFor(stem, p.locale);
      if (!q) continue;
      const correctIdx = q.choices.findIndex((c) => c.id === q.correctChoiceId);
      const choiceIds = q.choices.map((c) => c.id);
      const { choiceId, responseMs } = shadowAnswer(
        p,
        choiceIds,
        correctIdx,
        timeLimitMs,
        this.rand,
      );
      const t = setTimeout(() => {
        if (this.state.currentQuestionIndex !== undefined) {
          this.recordAnswer(p.userId, this.state.currentQuestionIndex, choiceId, true, responseMs);
        }
      }, responseMs);
      this.cleanups.push(() => clearTimeout(t));
    }
  }

  private recordAnswer(
    userId: string,
    questionIndex: number,
    choiceId: string,
    fromShadow = false,
    overrideResponseMs?: number,
  ): void {
    if (this.state.currentQuestionIndex !== questionIndex) {
      if (!fromShadow)
        this.log.warn(
          { userId, expected: this.state.currentQuestionIndex, got: questionIndex },
          "answer rejected: question index mismatch",
        );
      return;
    }
    const player = this.state.players.find((p) => p.userId === userId);
    if (!player || player.status !== "active") {
      if (!fromShadow)
        this.log.warn(
          { userId, status: player?.status },
          "answer rejected: player not active",
        );
      return;
    }
    if (player.skipped) {
      if (!fromShadow) this.log.warn({ userId }, "answer rejected: already skipped");
      return;
    }
    if (this.state.currentAnswers.has(userId)) {
      if (!fromShadow) this.log.warn({ userId }, "answer rejected: duplicate");
      return;
    }

    const startedAt = this.state.currentQuestionStartedAt!;
    const responseMs = overrideResponseMs ?? Math.max(0, Date.now() - startedAt);

    // Anti-cheat: reject answers that arrive faster than a human could
    // read + click. 200 ms covers the fastest known fair-play reaction
    // time minus generous network jitter; anything below has to be a
    // bot or a tampered client. We don't lock the player out — just
    // refuse this answer so the timer carries them to a timeout, same
    // outcome as not clicking at all.
    //
    // Shadow players bypass the check (they're driven by the server
    // and may legitimately fire with responseMs in the low hundreds).
    if (!fromShadow && responseMs < MIN_HUMAN_RESPONSE_MS) {
      this.log.warn(
        { userId, responseMs, questionIndex },
        "answer rejected: too fast (anti-cheat)",
      );
      // Send the same `answer_ack` we'd send on success so the client
      // locks the UI without revealing that the server discarded the
      // payload — makes scripted clients harder to feedback-loop on.
      this.sendTo(userId, {
        type: "answer_ack",
        questionIndex,
        locked: true,
      });
      return;
    }
    this.state.currentAnswers.set(userId, {
      choiceId,
      responseMs,
      receivedAt: Date.now(),
    });
    if (!fromShadow) {
      const stem = this.state.questionPool[questionIndex]!;
      const dbq = this.dbqForPlayer(stem, userId)!;
      this.log.info(
        {
          userId,
          questionIndex,
          chosen: choiceId,
          correct: dbq.correctChoiceId,
          isCorrect: choiceId === dbq.correctChoiceId,
          responseMs,
        },
        "answer recorded",
      );
    }

    if (!fromShadow) {
      this.sendTo(userId, {
        type: "answer_ack",
        questionIndex,
        locked: true,
      });
    }

    // Cut short if all alive players have replied (or skipped).
    const alive = this.state.players.filter((p) => p.status === "active");
    const repliedCount =
      this.state.currentAnswers.size + alive.filter((p) => p.skipped).length;
    if (repliedCount >= alive.length) {
      this.clearTimer();
      this.closeQuestion(questionIndex);
    }
  }

  private closeQuestion(questionIndex: number): void {
    if (this.state.currentQuestionIndex !== questionIndex) return;
    const phase = this.state.currentPhase!;
    const stem = this.state.questionPool[questionIndex]!;

    // Score each player against THEIR locale's variant. The fact is
    // shared but the correct choice id and answer position differ
    // between FR and EN.
    const outcomes = this.state.players
      .filter((p) => p.status === "active")
      .map((p) => {
        const dbq = this.dbqFor(stem, p.locale)!;
        return this.scorePlayerAtClose(p, dbq, questionIndex, phase);
      });

    // Phase 3 special rule: all-correct → slowest correct loses 1 life.
    if (phase === "phase3") {
      this.applyPhase3LifeRules(outcomes);
    }

    // Apply life deltas (cap at 0) and elimination after rules above.
    for (const o of outcomes) {
      const p = this.state.players.find((x) => x.userId === o.userId)!;
      if (o.livesDelta !== 0) {
        p.lives = Math.max(0, p.lives + o.livesDelta);
      }
      if (p.lives <= 0 && (phase === "phase1" || phase === "phase3")) {
        p.status = phase === "phase1" ? "eliminated_p1" : "eliminated_p3";
        // Stamp the moment of death so we can rank by elimination order
        // at match end (later death = higher placement).
        if (p.eliminatedAt === null) p.eliminatedAt = Date.now();
      }
    }

    // Per-player reveal — `correctChoiceId` is the choice id from
    // the player's own locale variant so the client can highlight
    // the right row in its rendered question. Outcomes themselves
    // are shared (only `isCorrect` matters for the live row, the
    // choiceId strings are opaque to other clients).
    for (const [, conn] of this.conns) {
      const dbq = this.dbqForPlayer(stem, conn.userId);
      if (!dbq) continue;
      this.send(conn.socket, {
        type: "reveal",
        questionIndex,
        correctChoiceId: dbq.correctChoiceId,
        outcomes,
      });
    }

    // Decide what to do next.
    const revealMs = phaseRevealMs(phase);
    this.clearTimer();

    if (phase === "phase1") {
      // Phase 1 = fixed-length qualifier. End after the configured count.
      const askedSoFar = (this.state.currentQuestionIndex ?? 0) + 1;
      if (askedSoFar >= MATCH_CONFIG.phase1.questionCount) {
        this.timer = setTimeout(() => void this.endPhase(phase), revealMs);
        return;
      }
    } else if (phase === "phase3") {
      const aliveCount = this.state.players.filter((p) => p.status === "active").length;
      if (aliveCount <= 1) {
        this.timer = setTimeout(() => void this.endPhase(phase), revealMs);
        return;
      }
    }

    this.timer = setTimeout(() => this.nextQuestion(), revealMs);
  }

  private scorePlayerAtClose(
    p: MatchPlayer,
    dbq: DbQuestion,
    questionIndex: number,
    phase: MatchPhase,
  ) {
    const ans = this.state.currentAnswers.get(p.userId);
    const skipped = p.skipped;
    const hasAnswer = !!ans && !skipped;
    const isCorrect = hasAnswer && ans!.choiceId === dbq.correctChoiceId;
    const responseMs = ans?.responseMs ?? null;

    if (!p.isShadow) {
      this.log.info(
        {
          userId: p.userId,
          questionIndex,
          phase,
          hasAnswer,
          skipped,
          chosen: ans?.choiceId ?? null,
          correct: dbq.correctChoiceId,
          isCorrect,
          livesBefore: p.lives,
        },
        "scoring close",
      );
    }

    let scoreDelta = 0;
    let livesDelta = 0;
    let shieldUsed = false;

    if (skipped) {
      // No score, no life change.
    } else if (phase === "phase1") {
      const r = scorePhase1({
        isCorrect,
        responseMs,
        timeLimitMs: phaseQuestionMs(phase),
        prevStreak: p.streak,
      });
      scoreDelta = r.delta;
      p.streak = r.newStreak;
      // Phase 1 no longer has lives — pure score qualification round.
      // Top 5 advance at the end. Speed bonus already breaks ties via score.
    } else if (phase === "phase2") {
      const r = scorePhase2({ isCorrect, hasAnswer });
      scoreDelta = r.delta;
    } else {
      // phase3 — no score points; lives handled in applyPhase3LifeRules.
    }

    p.score += scoreDelta;
    if (p.score > p.peakScore) p.peakScore = p.score;
    if (scoreDelta !== 0) p.lastScoreReachedAt = Date.now();

    // `dbq` here is the player's locale variant (closeQuestion picks
    // it that way), so `dbq.id` is the locale-specific question id
    // we want to log against `match_answers.questionId`.
    this.state.answersBuffer.push({
      userId: p.userId,
      questionId: dbq.id,
      questionIndex,
      phase,
      chosenChoiceId: hasAnswer ? ans!.choiceId : null,
      isCorrect,
      responseMs,
      scoreDelta,
      answeredAt: new Date(),
    });

    return {
      userId: p.userId,
      chosenChoiceId: hasAnswer ? ans!.choiceId : null,
      isCorrect,
      skipped,
      responseMs,
      scoreDelta,
      score: p.score,
      livesDelta,
      lives: Math.max(0, p.lives + livesDelta),
      shieldUsed,
    };
  }

  /**
   * Phase 3 life rules (applied AFTER per-player scoring above produced
   * livesDelta = 0 for everyone):
   *   - all wrong → no -1 life
   *   - 1+ wrong → those players lose 1 life
   *   - all correct → slowest of the correct loses 1 life
   */
  private applyPhase3LifeRules(
    outcomes: ReturnType<MatchRoom["scorePlayerAtClose"]>[],
  ): void {
    if (outcomes.length === 0) return;

    const corrects = outcomes.filter((o) => o.isCorrect);
    const wrongs = outcomes.filter(
      (o) => !o.isCorrect && !o.skipped && o.chosenChoiceId !== null,
    );
    const noAnswer = outcomes.filter(
      (o) => o.chosenChoiceId === null && !o.skipped,
    );

    // No-answer also counts as wrong for the elimination rule.
    const losers = [...wrongs, ...noAnswer];

    let mode: "all_correct" | "all_wrong" | "mixed";
    if (corrects.length === outcomes.length) {
      mode = "all_correct";
      // All correct → slowest loses one.
      let slowest = corrects[0]!;
      for (const o of corrects) {
        if ((o.responseMs ?? 0) > (slowest.responseMs ?? 0)) slowest = o;
      }
      this.applyLifeLoss(slowest);
    } else if (losers.length === outcomes.length) {
      mode = "all_wrong";
      // All wrong → no one loses a life.
      // (intentionally no-op)
    } else {
      mode = "mixed";
      // Mixed — losers each lose one life.
      for (const o of losers) {
        this.applyLifeLoss(o);
      }
    }

    this.log.info(
      {
        mode,
        corrects: corrects.length,
        wrongs: wrongs.length,
        noAnswer: noAnswer.length,
        losers: losers.length,
        outcomes: outcomes.length,
        livesDeltas: outcomes.map((o) => ({ userId: o.userId, livesDelta: o.livesDelta })),
      },
      "phase3 life rules",
    );
  }

  private applyLifeLoss(o: ReturnType<MatchRoom["scorePlayerAtClose"]>): void {
    const player = this.state.players.find((p) => p.userId === o.userId);
    if (!player) return;
    o.livesDelta = -1;
    o.lives = Math.max(0, player.lives - 1);
  }

  private maybeCloseEarly(): void {
    const alive = this.state.players.filter((p) => p.status === "active");
    const repliedCount =
      this.state.currentAnswers.size + alive.filter((p) => p.skipped).length;
    if (repliedCount >= alive.length) {
      const idx = this.state.currentQuestionIndex;
      if (idx !== undefined) {
        this.clearTimer();
        this.closeQuestion(idx);
      }
    }
  }

  // ─── Phase end ────────────────────────────────────────────────
  private async endPhase(phase: MatchPhase): Promise<void> {
    this.clearTimer();
    this.state.currentQuestionIndex = undefined;
    this.state.currentQuestionStartedAt = undefined;
    this.state.currentQuestionDeadline = undefined;

    const buffered = this.state.answersBuffer.splice(0, this.state.answersBuffer.length);
    await flushAnswers(this.state, buffered).catch((err) =>
      this.log.error(err, "flushAnswers failed"),
    );

    let survivors: MatchPlayer[];
    let eliminated: MatchPlayer[];
    let nextStatus: MatchStatus;

    if (phase === "phase1") {
      // Top N by peak score advance; the rest are eliminated.
      const elimAt = Date.now();
      const ranked = this.state.players
        .filter((p) => p.status === "active")
        .slice()
        .sort((a, b) => {
          if (b.peakScore !== a.peakScore) return b.peakScore - a.peakScore;
          // Tie on score → earlier reach wins (rewarding speed).
          return a.lastScoreReachedAt - b.lastScoreReachedAt;
        });
      const advancing = ranked.slice(0, MATCH_CONFIG.phase1.advancing);
      const dropped = ranked.slice(MATCH_CONFIG.phase1.advancing);
      for (const p of dropped) {
        p.status = "eliminated_p1";
        p.eliminatedAt = elimAt;
      }
      survivors = advancing;
      eliminated = dropped;
      nextStatus = "transition_p1_p2";
    } else if (phase === "phase2") {
      // Advance the global cursor past every index any player consumed
      // during phase 2 — phase 3 will pick up *after* the last phase 2
      // question, never reusing one.
      const maxConsumed = this.state.players.reduce(
        (m, p) => Math.max(m, p.phase2Index),
        this.state.poolCursor,
      );
      this.state.poolCursor = maxConsumed;

      // Sort by score (desc), tiebreak: earlier lastScoreReachedAt wins.
      const ranked = this.state.players
        .filter((p) => p.status === "active")
        .slice()
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.lastScoreReachedAt - b.lastScoreReachedAt;
        });
      const finalists = ranked.slice(0, MATCH_CONFIG.phase2.finalists);
      const out = ranked.slice(MATCH_CONFIG.phase2.finalists);
      for (const p of finalists) p.status = "finalist";
      const elimAt = Date.now();
      for (const p of out) {
        p.status = "eliminated_p2";
        p.eliminatedAt = elimAt;
      }
      survivors = finalists;
      eliminated = out;
      nextStatus = "transition_p2_p3";
    } else {
      // phase3 → results
      return this.endMatch();
    }

    this.state.status = nextStatus;
    await persistMatchStatus(this.state.matchId, nextStatus).catch(() => {});
    await persistPlayerUpdates(this.state.matchId, this.state.players).catch(
      (err) => this.log.error(err, "persistPlayerUpdates failed"),
    );

    const nextPhaseAt = Date.now() + MATCH_CONFIG.transitionMs;
    // Remember the transition deadline so a client reconnecting
    // mid-transition can be re-served the same `phase_end` payload
    // with a still-accurate `nextPhaseAt`.
    this.state.transitionEndsAt = nextPhaseAt;
    this.broadcast({
      type: "phase_end",
      phase,
      survivors: survivors.map((p) => p.userId),
      eliminated: eliminated.map((p) => p.userId),
      nextStatus,
      nextPhaseAt,
    });

    this.timer = setTimeout(
      () => void this.startPhase(phase === "phase1" ? "phase2" : "phase3"),
      MATCH_CONFIG.transitionMs,
    );
  }

  private async endMatch(): Promise<void> {
    // Final ranking — best (rank 1) to worst:
    //   1. Whoever still has lives in phase 3 = winner
    //   2. Phase 3 eliminated — later death = higher placement; peak score
    //      only as tiebreaker for simultaneous deaths.
    //   3. Phase 2 eliminated — all share an eliminatedAt at phase end so
    //      this collapses to a peak-score tiebreak.
    //   4. Phase 1 eliminated — same rule.
    const byDeathThenScore = (a: MatchPlayer, b: MatchPlayer) => {
      const ta = a.eliminatedAt ?? 0;
      const tb = b.eliminatedAt ?? 0;
      if (ta !== tb) return tb - ta;
      return b.peakScore - a.peakScore;
    };

    const phase3Active = this.state.players.filter((p) => p.status === "active");
    const phase3Out = this.state.players
      .filter((p) => p.status === "eliminated_p3")
      .slice()
      .sort(byDeathThenScore);
    const phase2Out = this.state.players
      .filter((p) => p.status === "eliminated_p2")
      .slice()
      .sort(byDeathThenScore);
    const phase1Out = this.state.players
      .filter((p) => p.status === "eliminated_p1")
      .slice()
      .sort(byDeathThenScore);
    // Mid-match quitters — placed below every elimination so a forfeit
    // is strictly worse than playing out the match. The shield boost
    // is intentionally bypassed for these (see podium loop) so a
    // rage-quit can't be cushioned by an active card.
    const forfeited = this.state.players
      .filter((p) => p.status === "left")
      .slice()
      .sort(byDeathThenScore);

    if (phase3Active[0]) phase3Active[0].status = "winner";

    const ordered: MatchPlayer[] = [
      ...phase3Active,
      ...phase3Out,
      ...phase2Out,
      ...phase1Out,
      ...forfeited,
    ];
    const isRanked = this.state.mode === "ranked";
    const podium = ordered.map((p, i) => {
      // Quick matches broadcast a delta of 0 so the result screen shows
      // no ELO movement and matches what the DB will (not) write.
      let eloDelta = isRanked ? eloDeltaForRank(i + 1) : 0;
      const isForfeit = p.status === "left";
      // Apply the player's pre-match boost (if any). Boosts only ever
      // help the player — they never compound a loss into a bigger one.
      // Forfeiters lose their shield: you don't get to rage-quit AND
      // keep the protection, the boost charge is already gone too.
      if (isRanked && p.activeBoost === "double-elo" && eloDelta > 0) {
        eloDelta *= 2;
      }
      if (
        isRanked &&
        p.activeBoost === "shield" &&
        eloDelta < 0 &&
        !isForfeit
      ) {
        eloDelta = 0;
      }
      return {
        userId: p.userId,
        rank: i + 1,
        score: p.score,
        eloDelta,
      };
    });

    this.state.status = "results";
    // Snapshot the final result so clients reconnecting before GC see
    // the same podium everyone else got at end-of-match.
    this.state.lastPodium = podium;
    this.broadcast({ type: "match_end", podium });

    await persistMatchEnd(this.state.matchId, this.state.mode, podium).catch(
      (err) => this.log.error(err, "persistMatchEnd failed"),
    );

    setTimeout(() => registry.delete(this.state.matchId, this.log), 30_000);
  }

  private markLeft(userId: string): void {
    const p = this.state.players.find((x) => x.userId === userId);
    if (!p) return;

    if (this.state.status === "lobby") {
      // Free the seat entirely so re-clicking "Play" doesn't drop the user
      // back into this exact lobby. Drop the DB row too — the unique
      // constraint on (matchId, seat) would otherwise block re-allocation.
      this.state.players = this.state.players.filter((x) => x.userId !== userId);
      void persistPlayerRemove(this.state.matchId, userId).catch((err) =>
        this.log.warn(err, "persistPlayerRemove failed"),
      );
      // If we were already counting down to phase 1, abort — the room is
      // no longer full. Resume the shadow trickle so the lobby can refill.
      if (
        this.state.lobbyStartsAt !== null &&
        this.state.players.length < MATCH_CONFIG.size
      ) {
        this.state.lobbyStartsAt = null;
        this.clearTimer();
        this.scheduleNextShadow(Date.now() + MATCH_CONFIG.lobby.silentFillMs);
      }
      this.broadcastLobby();
    } else if (p.status === "active" || p.status === "finalist") {
      // Mid-game leaver — keep their record so we can compute final ranks
      // at match end. Status flips to "left" and `eliminatedAt` is
      // stamped now so the audit log + the byDeathThenScore comparator
      // both see the right timestamp; in `endMatch` they're routed to
      // the bottom-of-podium `forfeited` group with no shield mercy.
      p.status = "left";
      p.eliminatedAt = Date.now();
    }

    const conn = this.conns.get(userId);
    if (conn) {
      try {
        conn.socket.close(1000, "leave");
      } catch {
        /* noop */
      }
      this.conns.delete(userId);
    }
  }

  // ─── Broadcast helpers ────────────────────────────────────────
  private broadcastLobby(): void {
    this.broadcast({
      type: "lobby",
      players: this.publicPlayers(),
      startsAt: this.state.lobbyStartsAt,
    });
  }

  private broadcastPlayers(): void {
    if (this.state.status === "lobby") {
      this.broadcastLobby();
    } else {
      // Reuse phase_start as a fresh roster snapshot — clients only update player rows.
      const phase = this.state.currentPhase;
      if (!phase) return;
      this.broadcast({
        type: "phase_start",
        phase,
        players: this.publicPlayers(),
        ...(phase === "phase2" && this.state.phase2EndsAt
          ? { phaseEndsAt: this.state.phase2EndsAt }
          : {}),
      });
    }
  }

  private broadcast(msg: ServerMessage): void {
    for (const [, conn] of this.conns) this.send(conn.socket, msg);
  }

  private send(socket: WebSocket, msg: ServerMessage): void {
    try {
      socket.send(JSON.stringify(msg));
    } catch (err) {
      this.log.warn({ err }, "ws send failed");
    }
  }

  private sendTo(userId: string, msg: ServerMessage): void {
    const conn = this.conns.get(userId);
    if (conn) this.send(conn.socket, msg);
  }

  /**
   * Re-emit enough state to a single user so their client can pick up
   * exactly where it left off after a network drop. Triggered by a
   * `ready` message — the client sends it on every (re)connect.
   *
   * We do not try to replay history. The reducer is structured so each
   * of these snapshots is sufficient to repaint the right screen:
   *   - `hello`        : roster + selfId + status
   *   - `lobby`        : lobby presence + countdown
   *   - `phase_start`  : switches the screen to the right phase
   *   - `question`     : current question with the original deadline
   *   - `phase_end`    : transition screen with countdown
   *   - `match_end`    : podium
   *
   * Server-side anti-replay (currentQuestionIndex check, dedup of
   * answers via currentAnswers Set) makes it safe for the client to
   * also flush its outbox of in-flight answers immediately after.
   */
  private sendResyncTo(userId: string): void {
    const conn = this.conns.get(userId);
    if (!conn) return;
    const socket = conn.socket;

    // Always start with a fresh hello — the roster, self status, and
    // server time may all have shifted since the original connect.
    this.send(socket, {
      type: "hello",
      matchId: this.state.matchId,
      selfId: userId,
      status: this.state.status,
      mode: this.state.mode,
      serverTime: Date.now(),
      players: this.publicPlayers(userId),
    });

    switch (this.state.status) {
      case "lobby": {
        this.send(socket, {
          type: "lobby",
          players: this.publicPlayers(),
          startsAt: this.state.lobbyStartsAt,
        });
        return;
      }

      case "phase1":
      case "phase3": {
        const phase = this.state.currentPhase;
        if (!phase) return;
        this.send(socket, {
          type: "phase_start",
          phase,
          players: this.publicPlayers(),
        });
        // If a question is currently in flight, re-send it with the
        // original deadline so the client clock keeps the same target.
        // Per-player rendering — pick the variant matching this user's
        // locale, not the room default.
        const q = this.publicQuestionFor(userId);
        if (q) this.send(socket, { type: "question", question: q });
        return;
      }

      case "phase2": {
        this.send(socket, {
          type: "phase_start",
          phase: "phase2",
          players: this.publicPlayers(),
          ...(this.state.phase2EndsAt
            ? { phaseEndsAt: this.state.phase2EndsAt }
            : {}),
        });
        // Phase 2 is per-player — re-send THIS user's pending question.
        const p = this.state.players.find((x) => x.userId === userId);
        if (p && p.status === "active") {
          const idx = p.phase2Index;
          if (idx < this.state.questionPool.length) {
            const stem = this.state.questionPool[idx]!;
            const dbq = this.dbqFor(stem, p.locale);
            if (dbq) {
              this.send(socket, {
                type: "question",
                question: {
                  index: idx,
                  phase: "phase2",
                  category: dbq.category,
                  prompt: dbq.prompt,
                  choices: dbq.choices.map(({ id, label }) => ({ id, label })),
                  deadline:
                    this.state.phase2EndsAt ?? Date.now() + 60_000,
                },
              });
            }
          }
        }
        return;
      }

      case "transition_p1_p2":
      case "transition_p2_p3": {
        const fromPhase: MatchPhase =
          this.state.status === "transition_p1_p2" ? "phase1" : "phase2";
        // Survivors are players still active (p1→p2) or finalists
        // (p2→p3); the eliminated bucket is the matching status set
        // by endPhase.
        const survivors = this.state.players
          .filter((p) =>
            this.state.status === "transition_p1_p2"
              ? p.status === "active"
              : p.status === "finalist",
          )
          .map((p) => p.userId);
        const eliminatedStatus =
          this.state.status === "transition_p1_p2"
            ? "eliminated_p1"
            : "eliminated_p2";
        const eliminated = this.state.players
          .filter((p) => p.status === eliminatedStatus)
          .map((p) => p.userId);
        this.send(socket, {
          type: "phase_end",
          phase: fromPhase,
          survivors,
          eliminated,
          nextStatus: this.state.status,
          // Fall back to "now" if we somehow missed snapshotting — the
          // transition screen will simply skip straight to the next
          // phase_start, which the timer is already racing to fire.
          nextPhaseAt: this.state.transitionEndsAt ?? Date.now(),
        });
        return;
      }

      case "results": {
        if (this.state.lastPodium) {
          this.send(socket, {
            type: "match_end",
            podium: this.state.lastPodium,
          });
        }
        return;
      }

      case "abandoned":
        // No further state to push — `hello` is enough for the client
        // to render the appropriate end-of-match fallback.
        return;
    }
  }

  private publicPlayers(selfId?: string): PublicPlayer[] {
    return this.state.players.map((p) => ({
      userId: p.userId,
      seat: p.seat,
      name: p.name,
      handle: p.handle,
      avatarId: p.avatarId,
      status: p.status,
      score: p.score,
      streak: p.streak,
      lives: p.lives,
      isShadow: p.isShadow,
      isSelf: selfId ? p.userId === selfId : undefined,
    }));
  }

  private publicQuestionFor(userId: string): PublicQuestion | null {
    if (
      this.state.currentQuestionIndex === undefined ||
      !this.state.currentPhase ||
      !this.state.currentQuestionDeadline
    )
      return null;
    const stem = this.state.questionPool[this.state.currentQuestionIndex];
    if (!stem) return null;
    const dbq = this.dbqForPlayer(stem, userId);
    if (!dbq) return null;
    return {
      index: this.state.currentQuestionIndex,
      phase: this.state.currentPhase,
      category: dbq.category,
      prompt: dbq.prompt,
      choices: dbq.choices.map(({ id, label }) => ({ id, label })),
      deadline: this.state.currentQuestionDeadline,
    };
  }

  // ─── Cleanup ──────────────────────────────────────────────────
  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  dispose(): void {
    this.clearTimer();
    for (const cb of this.cleanups) cb();
    this.cleanups = [];
    for (const [, conn] of this.conns) {
      try {
        conn.socket.close(1000, "match ended");
      } catch {
        /* noop */
      }
    }
    this.conns.clear();
  }
}

// ─── Helpers ──────────────────────────────────────────────────────
function phaseQuestionMs(phase: MatchPhase): number {
  switch (phase) {
    case "phase1":
      return MATCH_CONFIG.phase1.questionMs;
    case "phase2":
      return MATCH_CONFIG.phase2.questionMs;
    case "phase3":
      return MATCH_CONFIG.phase3.questionMs;
  }
}
function phaseRevealMs(phase: MatchPhase): number {
  switch (phase) {
    case "phase1":
      return MATCH_CONFIG.phase1.revealMs;
    case "phase2":
      return MATCH_CONFIG.phase2.revealMs;
    case "phase3":
      return MATCH_CONFIG.phase3.revealMs;
  }
}
function eloDeltaForRank(rank: number): number {
  if (rank === 1) return MATCH_CONFIG.elo.rank1;
  if (rank === 2) return MATCH_CONFIG.elo.rank2;
  if (rank === 3) return MATCH_CONFIG.elo.rank3;
  if (rank <= 5) return MATCH_CONFIG.elo.eliminatedP2;
  return MATCH_CONFIG.elo.eliminatedP1;
}

function pickWrongIdx(correctIdx: number, total: number, rand: () => number): number {
  if (total <= 1) return correctIdx;
  let idx = Math.floor(rand() * (total - 1));
  if (idx >= correctIdx) idx += 1;
  return idx;
}
