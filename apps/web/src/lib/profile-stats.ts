import "server-only";

import { auth } from "@/auth";
import {
  db,
  matchAnswers,
  matchPlayers,
  matches,
  questions,
  users,
} from "@quizelo/db";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";

export interface ProfileStats {
  user: {
    id: string;
    handle: string | null;
    name: string;
    avatarId: number;
    elo: number;
    joinedAt: Date;
  };
  totals: {
    matches: number;
    wins: number;
    /** 0..1 ratio of finalRank=1 over total ranked matches. */
    winRate: number;
    /** 1..10, 0 if no ranked matches. */
    avgRank: number;
  };
  /** Chronological ascending series of ELO snapshots after each match end. */
  eloHistory: Array<{ at: Date; elo: number }>;
  /** Up to 8 categories ordered by total answers desc. */
  categories: Array<{
    id: string;
    /** 0..1 accuracy. */
    value: number;
    correct: number;
    total: number;
  }>;
}

const HISTORY_LIMIT = 30;
const CATEGORY_LIMIT = 8;

/** Resolve the currently authenticated user's profile stats. */
export async function fetchProfileStats(): Promise<ProfileStats | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return fetchProfileStatsFor(session.user.id);
}

/** Same as `fetchProfileStats` but for an explicit user id (e.g. /profile/[handle]). */
export async function fetchProfileStatsFor(
  userId: string,
): Promise<ProfileStats | null> {
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!userRow) return null;

  /* ── Totals (matches, wins, sum & count of finalRank) ───────────────── */
  const totalsRows = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      wins: sql<number>`COALESCE(SUM(CASE WHEN ${matchPlayers.finalRank} = 1 THEN 1 ELSE 0 END), 0)::int`,
      sumRank: sql<number>`COALESCE(SUM(${matchPlayers.finalRank}), 0)::int`,
      rankedCount: sql<number>`COALESCE(SUM(CASE WHEN ${matchPlayers.finalRank} IS NOT NULL THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(matchPlayers)
    .where(eq(matchPlayers.userId, userId));

  const t = totalsRows[0];
  const matchesCount = Number(t?.total ?? 0);
  const wins = Number(t?.wins ?? 0);
  const ranked = Number(t?.rankedCount ?? 0);
  const sumRank = Number(t?.sumRank ?? 0);
  const winRate = matchesCount > 0 ? wins / matchesCount : 0;
  const avgRank = ranked > 0 ? sumRank / ranked : 0;

  /* ── ELO history — walk backward from current ELO subtracting deltas ── */
  const histRows = await db
    .select({
      at: matches.endedAt,
      delta: matchPlayers.eloDelta,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
    .where(
      and(
        eq(matchPlayers.userId, userId),
        isNotNull(matches.endedAt),
        isNotNull(matchPlayers.eloDelta),
      ),
    )
    .orderBy(desc(matches.endedAt))
    .limit(HISTORY_LIMIT);

  let cur = userRow.elo;
  const points: Array<{ at: Date; elo: number }> = [];
  for (const row of histRows) {
    if (!row.at) continue;
    points.push({ at: row.at, elo: cur });
    cur -= row.delta ?? 0;
  }
  // Make chronological (oldest first → newest last).
  points.reverse();

  /* ── Category accuracy (up to N most-answered categories) ───────────── */
  const catRows = await db
    .select({
      id: questions.category,
      total: sql<number>`COUNT(*)::int`,
      correct: sql<number>`COALESCE(SUM(CASE WHEN ${matchAnswers.isCorrect} THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(matchAnswers)
    .innerJoin(questions, eq(matchAnswers.questionId, questions.id))
    .where(eq(matchAnswers.userId, userId))
    .groupBy(questions.category)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(CATEGORY_LIMIT);

  const categories = catRows.map((r) => {
    const total = Number(r.total) || 0;
    const correct = Number(r.correct) || 0;
    return {
      id: r.id,
      total,
      correct,
      value: total > 0 ? correct / total : 0,
    };
  });

  return {
    user: {
      id: userRow.id,
      handle: userRow.handle,
      name:
        userRow.displayName ?? userRow.name ?? userRow.handle ?? "Player",
      avatarId: userRow.avatarId ?? 0,
      elo: userRow.elo,
      joinedAt: userRow.createdAt,
    },
    totals: { matches: matchesCount, wins, winRate, avgRank },
    eloHistory: points,
    categories,
  };
}
