/**
 * Static leaderboard fixtures used by the leaderboard mockup.
 * At runtime these would come from `/api/leaderboard?filter=...`.
 */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  elo: number;
  /** ELO change over the past 24h. */
  change: number;
  seed: number;
}

export const LEADERS: readonly LeaderboardEntry[] = [
  { rank: 1, name: "KIRA_ZERO", elo: 2671, change:  24, seed: 1 },
  { rank: 2, name: "plasm0",    elo: 2598, change:  12, seed: 2 },
  { rank: 3, name: "WynnX",     elo: 2554, change:  -8, seed: 3 },
  { rank: 4, name: "aestrid",   elo: 2491, change:  18, seed: 4 },
  { rank: 5, name: "helio.",    elo: 2438, change:   0, seed: 5 },
  { rank: 6, name: "BRACKET",   elo: 2401, change:   6, seed: 6 },
  { rank: 7, name: "ne0n_owl",  elo: 2389, change:  14, seed: 7 },
  { rank: 8, name: "Marlowe",   elo: 2342, change: -10, seed: 8 },
];

/** Current user's leaderboard position. */
export const MY_LEADERBOARD_ROW = {
  rank: 1247,
  name: "Toi",
  elo: 1499,
  change: 12,
  seed: 0,
} as const;

export type LeaderboardFilter =
  | "global"
  | "friends"
  | "elite"
  | "diamond"
  | "platinum"
  | "gold";

export const FILTERS: readonly LeaderboardFilter[] = [
  "global",
  "friends",
  "elite",
  "diamond",
  "platinum",
  "gold",
];
