/**
 * Static fixtures for the profile mockup. Runtime values come from
 * `/api/profile/me`.
 */

export const PROFILE_ME = {
  handle: "your_handle",
  name: "Toi",
  seed: 0,
  joinedAt: "2026-01-15", // ISO; the page formats it
  elo: 1499,
  matches: 127,
  winRate: 0.18,
  avgRank: 4.3,
} as const;

/** ELO progression over the past N matches/days. */
export const ELO_HISTORY: readonly number[] = [
  1400, 1380, 1410, 1455, 1430, 1480, 1465, 1487, 1499,
];

/** Category accuracy ratios (0..1). */
export const CATEGORY_ACCURACY = [
  { id: "Geography",     value: 0.78 },
  { id: "History",       value: 0.71 },
  { id: "Web",           value: 0.85 },
  { id: "Sport",         value: 0.42 },
  { id: "Art",           value: 0.55 },
  { id: "Entertainment", value: 0.68 },
] as const;

/** Same data but trimmed to the 4 most relevant categories for mobile. */
export const CATEGORY_ACCURACY_COMPACT = [
  { id: "Web",       value: 0.85 },
  { id: "Geography", value: 0.78 },
  { id: "History",   value: 0.71 },
  { id: "Sport",     value: 0.42 },
] as const;
