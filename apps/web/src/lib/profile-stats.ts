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
import { and, desc, eq, isNotNull, sql, type SQL } from "drizzle-orm";
import type { MatchMode } from "@quizelo/protocol";

export type ProfileFilter = "all" | "quick" | "ranked";

export interface RecentMatch {
  matchId: string;
  endedAt: Date;
  mode: MatchMode;
  /** 1..10, position the user finished the match at. */
  finalRank: number;
  /** ELO change for this match, or `null` for quick matches. */
  eloDelta: number | null;
}

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
  /** Most-recent-first list of the player's last completed matches. */
  recentMatches: RecentMatch[];
}

const HISTORY_LIMIT = 30;
const CATEGORY_LIMIT = 8;
const RECENT_MATCHES_LIMIT = 20;

/** Resolve the currently authenticated user's profile stats. */
export async function fetchProfileStats(
  filter: ProfileFilter = "all",
): Promise<ProfileStats | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return fetchProfileStatsFor(session.user.id, filter);
}

/** Same as `fetchProfileStats` but for an explicit user id (e.g. /profile/[handle]). */
export async function fetchProfileStatsFor(
  userId: string,
  filter: ProfileFilter = "all",
): Promise<ProfileStats | null> {
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!userRow) return null;

  // The mode filter constrains every aggregate that joins `matches`. The user
  // info (ELO, joinedAt, handle…) above is unfiltered — it always reflects
  // the current state of the row.
  const modeFilter: SQL | undefined =
    filter === "quick"
      ? eq(matches.mode, "quick")
      : filter === "ranked"
        ? eq(matches.mode, "ranked")
        : undefined;

  /* ── Totals (matches, wins, sum & count of finalRank) ───────────────── */
  const totalsRows = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      wins: sql<number>`COALESCE(SUM(CASE WHEN ${matchPlayers.finalRank} = 1 THEN 1 ELSE 0 END), 0)::int`,
      sumRank: sql<number>`COALESCE(SUM(${matchPlayers.finalRank}), 0)::int`,
      rankedCount: sql<number>`COALESCE(SUM(CASE WHEN ${matchPlayers.finalRank} IS NOT NULL THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
    .where(
      modeFilter
        ? and(eq(matchPlayers.userId, userId), modeFilter)
        : eq(matchPlayers.userId, userId),
    );

  const t = totalsRows[0];
  const matchesCount = Number(t?.total ?? 0);
  const wins = Number(t?.wins ?? 0);
  const ranked = Number(t?.rankedCount ?? 0);
  const sumRank = Number(t?.sumRank ?? 0);
  const winRate = matchesCount > 0 ? wins / matchesCount : 0;
  const avgRank = ranked > 0 ? sumRank / ranked : 0;

  /* ── ELO history — walk backward from current ELO subtracting deltas ── */
  const histConditions: SQL[] = [
    eq(matchPlayers.userId, userId),
    isNotNull(matches.endedAt),
    isNotNull(matchPlayers.eloDelta),
  ];
  if (modeFilter) histConditions.push(modeFilter);
  const histRows = await db
    .select({
      at: matches.endedAt,
      delta: matchPlayers.eloDelta,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
    .where(and(...histConditions))
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
  const catSelect = {
    id: questions.category,
    total: sql<number>`COUNT(*)::int`,
    correct: sql<number>`COALESCE(SUM(CASE WHEN ${matchAnswers.isCorrect} THEN 1 ELSE 0 END), 0)::int`,
  };
  const catRows = modeFilter
    ? await db
        .select(catSelect)
        .from(matchAnswers)
        .innerJoin(questions, eq(matchAnswers.questionId, questions.id))
        .innerJoin(matches, eq(matchAnswers.matchId, matches.id))
        .where(and(eq(matchAnswers.userId, userId), modeFilter))
        .groupBy(questions.category)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(CATEGORY_LIMIT)
    : await db
        .select(catSelect)
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

  /* ── Recent matches (last N completed, newest first) ────────────────── */
  const recentConditions: SQL[] = [
    eq(matchPlayers.userId, userId),
    isNotNull(matches.endedAt),
    isNotNull(matchPlayers.finalRank),
  ];
  if (modeFilter) recentConditions.push(modeFilter);
  const recentRows = await db
    .select({
      matchId: matches.id,
      endedAt: matches.endedAt,
      mode: matches.mode,
      finalRank: matchPlayers.finalRank,
      eloDelta: matchPlayers.eloDelta,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
    .where(and(...recentConditions))
    .orderBy(desc(matches.endedAt))
    .limit(RECENT_MATCHES_LIMIT);

  const recentMatches: RecentMatch[] = recentRows
    .filter((r) => r.endedAt !== null && r.finalRank !== null)
    .map((r) => ({
      matchId: r.matchId,
      endedAt: r.endedAt as Date,
      mode: r.mode as MatchMode,
      finalRank: r.finalRank as number,
      eloDelta: r.eloDelta,
    }));

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
    recentMatches,
  };
}
