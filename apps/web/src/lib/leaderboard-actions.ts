import { cookies, headers } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

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

export interface LeaderboardData {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

const EMPTY: LeaderboardData = { top: [], me: null };

/**
 * Server-side fetch of the public leaderboard. Auth.js cookie is forwarded so
 * the API can resolve `me`. Returns an empty payload if the API is down — the
 * page renders an empty state instead of crashing.
 */
export async function fetchLeaderboard(
  limit = 50,
): Promise<LeaderboardData> {
  const cookieHeader = (await cookies()).toString();
  const xff = (await headers()).get("x-forwarded-for") ?? undefined;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/leaderboard?limit=${limit}`, {
      headers: {
        cookie: cookieHeader,
        ...(xff ? { "x-forwarded-for": xff } : {}),
      },
      cache: "no-store",
    });
  } catch {
    return EMPTY;
  }
  if (!res.ok) return EMPTY;

  try {
    const body = (await res.json()) as LeaderboardData;
    if (!Array.isArray(body.top)) return EMPTY;
    return {
      top: body.top,
      me: body.me ?? null,
    };
  } catch {
    return EMPTY;
  }
}
