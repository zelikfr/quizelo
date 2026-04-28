import {
  db,
  matchAnswers,
  matchPlayers,
  matches,
  users,
  type Match,
} from "@quizelo/db";
import { and, eq, sql } from "drizzle-orm";
import type { MatchStatus } from "@quizelo/protocol";
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
    mode: "quick",
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
  podium: { userId: string; rank: number; eloDelta: number; score: number }[],
): Promise<void> {
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
        eloDelta: row.eloDelta,
        score: row.score,
      })
      .where(
        and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.userId, row.userId)),
      );
    // Apply elo delta to the user row.
    await db
      .update(users)
      .set({ elo: sql`GREATEST(0, ${users.elo} + ${row.eloDelta})` })
      .where(eq(users.id, row.userId));
  }
}
