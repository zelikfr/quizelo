import { db, matchPlayers, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import type { FastifyBaseLogger } from "fastify";
import { randomUUID } from "node:crypto";
import type { MatchMode } from "@quizelo/protocol";
import { MATCH_CONFIG } from "./config";
import { persistMatchCreate } from "./persistence";
import { pickQuestionsForMatch } from "./questions";
import { rngFromSeed } from "./random";
import { registry } from "./registry";
import { MatchRoom } from "./room";
import type { MatchPlayer, MatchState } from "./types";

interface PendingLobby {
  matchId: string;
  locale: string;
  mode: MatchMode;
  room: MatchRoom;
}

/** Quick + ranked don't share lobbies — bucket pending rooms by both. */
const lobbyKey = (locale: string, mode: MatchMode) => `${mode}:${locale}`;

class Matchmaker {
  private pendingByKey = new Map<string, PendingLobby>();

  async enqueue(opts: {
    userId: string;
    locale: string;
    mode: MatchMode;
    log: FastifyBaseLogger;
  }): Promise<{ matchId: string }> {
    const { userId, locale, mode, log } = opts;
    const key = lobbyKey(locale, mode);

    // Resume only if the user is actually still playing (hasn't been
    // eliminated, hasn't left). Eliminated rows stay in the room so we
    // can compute final ranks at match end, but they shouldn't trap
    // the user in their lost match.
    for (const room of registry.list()) {
      const ongoing = room.state.players.some(
        (p) =>
          p.userId === userId &&
          (p.status === "active" || p.status === "finalist"),
      );
      if (ongoing) {
        return { matchId: room.state.matchId };
      }
    }

    let pending = this.pendingByKey.get(key);

    // Discard ghost lobbies — rooms whose only inhabitants left or are shadows.
    if (pending) {
      const realActive = pending.room.state.players.filter(
        (p) => !p.isShadow && p.status !== "left",
      ).length;
      if (realActive === 0) {
        registry.delete(pending.matchId, log);
        this.pendingByKey.delete(key);
        pending = undefined;
      }
    }

    if (pending) {
      const already = pending.room.state.players.some(
        (p) => p.userId === userId && p.status !== "left",
      );
      if (!already) {
        await this.addPlayerToLobby(pending.room, userId, log);
        pending.room.onPlayerJoined();
      }
      return { matchId: pending.matchId };
    }

    pending = await this.openLobby(locale, mode, log);
    await this.addPlayerToLobby(pending.room, userId, log);
    pending.room.startLobby();
    pending.room.onPlayerJoined();

    // The lobby slot is no longer joinable once the silent-fill timer fires.
    setTimeout(() => {
      if (this.pendingByKey.get(key)?.matchId === pending!.matchId) {
        this.pendingByKey.delete(key);
      }
    }, MATCH_CONFIG.lobby.silentFillMs + 500);

    return { matchId: pending.matchId };
  }

  private async openLobby(
    locale: string,
    mode: MatchMode,
    log: FastifyBaseLogger,
  ): Promise<PendingLobby> {
    const matchId = randomUUID();
    const seed = randomUUID();
    const rand = rngFromSeed(seed);
    const pool = await pickQuestionsForMatch(locale, rand);

    const state: MatchState = {
      matchId,
      status: "lobby",
      mode,
      locale,
      seed,
      players: [],
      questionPool: pool.map((q) => q.id),
      questions: new Map(pool.map((q) => [q.id, q])),
      poolCursor: 0,
      currentAnswers: new Map(),
      answersBuffer: [],
      lobbyStartsAt: null,
      createdAt: Date.now(),
    };

    const room = new MatchRoom(state, log);
    registry.set(matchId, room);

    const pending: PendingLobby = { matchId, locale, mode, room };
    this.pendingByKey.set(lobbyKey(locale, mode), pending);
    log.info({ matchId, locale, mode }, "match lobby opened");
    return pending;
  }

  private async addPlayerToLobby(
    room: MatchRoom,
    userId: string,
    log: FastifyBaseLogger,
  ): Promise<void> {
    if (room.state.players.length >= MATCH_CONFIG.size) {
      throw new Error("LOBBY_FULL");
    }

    const row = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!row) throw new Error("USER_NOT_FOUND");

    // Find the first free seat — leavers can have left holes in the seat
    // numbering. Reusing `players.length` would collide with the unique
    // constraint (matchId, seat) in the DB once seats start being recycled.
    const usedSeats = new Set(room.state.players.map((p) => p.seat));
    let seat = 0;
    while (usedSeats.has(seat) && seat < MATCH_CONFIG.size) seat++;
    if (seat >= MATCH_CONFIG.size) throw new Error("LOBBY_FULL");

    const player: MatchPlayer = {
      userId: row.id,
      seat,
      name: row.displayName ?? row.handle ?? row.name ?? "Player",
      handle: row.handle,
      avatarId: row.avatarId ?? 0,
      status: "active",
      score: 0,
      streak: 0,
      lives: MATCH_CONFIG.phase3.startingLives,
      skipped: false,
      lastScoreReachedAt: 0,
      eliminatedAt: null,
      peakScore: 0,
      phase2Index: 0,
      isShadow: false,
    };
    room.state.players.push(player);

    if (room.state.players.length === 1) {
      await persistMatchCreate(room.state).catch((err) =>
        log.error(err, "persistMatchCreate failed"),
      );
    } else {
      await db
        .insert(matchPlayers)
        .values({
          matchId: room.state.matchId,
          userId: player.userId,
          seat: player.seat,
          status: "active",
          score: 0,
        })
        .catch((err) => log.error(err, "insert match_players failed"));
    }
  }
}

export const matchmaker = new Matchmaker();
