import {
  db,
  matchAnswers,
  matchPlayers,
  matches,
  users,
  type Match,
} from "@quizelo/db";
import { and, eq, gt, inArray, lte, or, sql } from "drizzle-orm";
import type { MatchMode, MatchStatus } from "@quizelo/protocol";
import type { AnswerRecord, MatchPlayer, MatchState } from "./types";

/**
 * Persistence helpers.
 *
 * Real users (non-shadow) are written to match_players + match_answers.
 * Shadows live only in memory — they have synthetic ids that aren't FKs.
 */
const isReal = (p: MatchPlayer) => !p.isShadow;
const isShadowId = (id: string) => id.startsWith("shadow:");

export async function persistMatchCreate(state: MatchState): Promise<void> {
  await db.insert(matches).values({
    id: state.matchId,
    mode: state.mode,
    status: state.status as Match["status"],
    locale: state.locale,
    seed: state.seed,
    questionIds: state.questionPool,
  });

  const realPlayers = state.players.filter(isReal);
  if (realPlayers.length === 0) return;
  await db.insert(matchPlayers).values(
    realPlayers.map((p) => ({
      matchId: state.matchId,
      userId: p.userId,
      seat: p.seat,
      status: p.status,
      score: p.score,
    })),
  );
}

export async function persistMatchStatus(
  matchId: string,
  status: MatchStatus,
): Promise<void> {
  const patch: Partial<Match> = { status: status as Match["status"] };
  if (status === "phase1") patch.startedAt = new Date();
  await db.update(matches).set(patch).where(eq(matches.id, matchId));
}

export async function flushAnswers(
  state: MatchState,
  answers: AnswerRecord[],
): Promise<void> {
  const real = answers.filter((a) => !isShadowId(a.userId));
  if (real.length === 0) return;

  await db.insert(matchAnswers).values(
    real.map((a) => ({
      matchId: state.matchId,
      userId: a.userId,
      questionId: a.questionId,
      phase: a.phase,
      roundIndex: a.questionIndex,
      chosenChoiceId: a.chosenChoiceId,
      isCorrect: a.isCorrect,
      responseMs: a.responseMs,
      scoreDelta: a.scoreDelta,
      answeredAt: a.answeredAt,
    })),
  );
}

/**
 * Decrement the daily quick-match quota for the listed real users. Called
 * at lobby → phase 1 transition so a player who leaves the lobby before
 * the match begins doesn't lose a free game.
 *
 * Atomic per row: only decrements where the user is **not currently
 * premium** (either `is_premium = false`, or `premium_until` has passed)
 * AND `quick_matches_remaining > 0`.
 */
export async function consumeQuickQuotaForUsers(
  userIds: string[],
): Promise<void> {
  if (userIds.length === 0) return;
  const now = new Date();
  await db
    .update(users)
    .set({
      quickMatchesRemaining: sql`${users.quickMatchesRemaining} - 1`,
    })
    .where(
      and(
        inArray(users.id, userIds),
        // Not currently premium = not flagged, OR flagged but expired.
        // (premium_until IS NULL → lifetime premium → never deducts.)
        or(eq(users.isPremium, false), lte(users.premiumUntil, now)),
        gt(users.quickMatchesRemaining, 0),
      ),
    );
}

export async function persistPlayerRemove(
  matchId: string,
  userId: string,
): Promise<void> {
  if (isShadowId(userId)) return;
  await db
    .delete(matchPlayers)
    .where(
      and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.userId, userId)),
    );
}

export async function persistPlayerUpdates(
  matchId: string,
  players: MatchPlayer[],
): Promise<void> {
  for (const p of players.filter(isReal)) {
    await db
      .update(matchPlayers)
      .set({
        status: p.status,
        score: p.score,
        streak: p.streak,
        lives: p.lives,
      })
      .where(
        and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.userId, p.userId)),
      );
  }
}

export async function persistMatchEnd(
  matchId: string,
  mode: MatchMode,
  podium: { userId: string; rank: number; eloDelta: number; score: number }[],
): Promise<void> {
  const isRanked = mode === "ranked";

  await db
    .update(matches)
    .set({ status: "results", endedAt: new Date() })
    .where(eq(matches.id, matchId));

  for (const row of podium) {
    if (isShadowId(row.userId)) continue;
    await db
      .update(matchPlayers)
      .set({
        finalRank: row.rank,
        // Quick matches don't move ELO — store NULL so leaderboard / profile
        // can ignore them in their aggregates.
        eloDelta: isRanked ? row.eloDelta : null,
        score: row.score,
      })
      .where(
        and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.userId, row.userId)),
      );

    // Only ranked matches mutate `users.elo`.
    if (isRanked) {
      await db
        .update(users)
        .set({ elo: sql`GREATEST(0, ${users.elo} + ${row.eloDelta})` })
        .where(eq(users.id, row.userId));
    }
  }
}
