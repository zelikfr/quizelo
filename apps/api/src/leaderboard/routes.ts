import {
  db,
  matchPlayers,
  matches,
  users,
} from "@quizelo/db";
import { and, desc, eq, gt, gte, inArray, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { readSession } from "../auth-cookie";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

interface LeaderRowDb {
  userId: string;
  name: string | null;
  displayName: string | null;
  handle: string | null;
  avatarId: number | null;
  elo: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  handle: string | null;
  avatarId: number;
  elo: number;
  /** Sum of `match_players.elo_delta` over the past 24 hours. */
  change24h: number;
}

export interface LeaderboardResponse {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

/**
 * Build a stable display name from the available fields.
 *  Priority: displayName → handle → email-prefix(name) → "Player".
 */
function displayName(row: LeaderRowDb): string {
  if (row.displayName && row.displayName.trim()) return row.displayName.trim();
  if (row.handle && row.handle.trim()) return row.handle.trim();
  if (row.name && row.name.trim()) return row.name.trim();
  return "Player";
}

/** Stable avatarId fallback — derive from userId when null. */
function avatarSeed(row: LeaderRowDb): number {
  if (typeof row.avatarId === "number") return row.avatarId;
  // Hash userId to a small int for a stable visual.
  let h = 0;
  for (let i = 0; i < row.userId.length; i++) {
    h = (h * 31 + row.userId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100;
}

/** Resolve a delta map { userId → sum(eloDelta) } over the past 24 hours.
 *  Only ranked matches contribute — quick matches don't move ELO and write
 *  NULL deltas, but we filter on `mode` explicitly for query clarity. */
async function fetchDeltas24h(
  userIds: string[],
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      userId: matchPlayers.userId,
      delta: sql<number>`COALESCE(SUM(${matchPlayers.eloDelta}), 0)::int`,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
    .where(
      and(
        eq(matches.mode, "ranked"),
        gte(matches.endedAt, since),
        inArray(matchPlayers.userId, userIds),
      ),
    )
    .groupBy(matchPlayers.userId);
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.userId, Number(r.delta) || 0);
  return map;
}

/** Number of users strictly above a given ELO. Rank = count + 1. */
async function fetchRankFor(elo: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(users)
    .where(gt(users.elo, elo));
  return Number(rows[0]?.count ?? 0) + 1;
}

export async function registerLeaderboardRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/leaderboard", async (req, reply) => {
    // ── Parse limit
    const raw = (req.query as { limit?: string }).limit;
    const parsedLimit = Number.parseInt(raw ?? "", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(MAX_LIMIT, parsedLimit))
      : DEFAULT_LIMIT;

    // ── Top N by ELO (tiebreaker: stable user id ordering)
    let topRows: LeaderRowDb[];
    try {
      topRows = await db
        .select({
          userId: users.id,
          name: users.name,
          displayName: users.displayName,
          handle: users.handle,
          avatarId: users.avatarId,
          elo: users.elo,
        })
        .from(users)
        .orderBy(desc(users.elo), users.id)
        .limit(limit);
    } catch (err) {
      app.log.error({ err }, "leaderboard: top query failed");
      return reply.code(500).send({ error: "DB_ERROR" });
    }

    // ── Optional session for "me"
    const session = await readSession(req).catch(() => null);

    // ── Fetch deltas for top + me in a single query
    const userIds = new Set(topRows.map((r) => r.userId));
    if (session?.userId) userIds.add(session.userId);
    const deltas = await fetchDeltas24h([...userIds]).catch(() => new Map());

    const top: LeaderboardEntry[] = topRows.map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      name: displayName(row),
      handle: row.handle,
      avatarId: avatarSeed(row),
      elo: row.elo,
      change24h: deltas.get(row.userId) ?? 0,
    }));

    let me: LeaderboardEntry | null = null;
    if (session?.userId) {
      // Either grab the row from the top set (cheap) or query separately.
      const inTop = top.find((r) => r.userId === session.userId) ?? null;
      if (inTop) {
        me = inTop;
      } else {
        try {
          const rows = await db
            .select({
              userId: users.id,
              name: users.name,
              displayName: users.displayName,
              handle: users.handle,
              avatarId: users.avatarId,
              elo: users.elo,
            })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);
          const row = rows[0];
          if (row) {
            const rank = await fetchRankFor(row.elo);
            me = {
              rank,
              userId: row.userId,
              name: displayName(row),
              handle: row.handle,
              avatarId: avatarSeed(row),
              elo: row.elo,
              change24h: deltas.get(row.userId) ?? 0,
            };
          }
        } catch (err) {
          app.log.error({ err }, "leaderboard: me query failed");
        }
      }
    }

    const body: LeaderboardResponse = { top, me };
    return body;
  });
}
