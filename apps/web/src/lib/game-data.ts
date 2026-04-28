/**
 * Static gameplay fixtures used by the home and lobby mockups.
 * The current user is `id: 0` ("you").
 */

export interface Player {
  id: number;
  name: string;
  seed: number;
  elo: number;
  lives: number;
}

export const ROSTER: readonly Player[] = [
  { id: 0, name: "Toi",       seed: 0, elo: 1487, lives: 3 },
  { id: 1, name: "Nyra_92",   seed: 6, elo: 1612, lives: 3 },
  { id: 2, name: "kovax",     seed: 2, elo: 1390, lives: 3 },
  { id: 3, name: "Léa.S",     seed: 4, elo: 1521, lives: 3 },
  { id: 4, name: "pixelorca", seed: 7, elo: 1455, lives: 3 },
  { id: 5, name: "M3RIDIAN",  seed: 1, elo: 1698, lives: 3 },
  { id: 6, name: "tofu_king", seed: 3, elo: 1402, lives: 3 },
  { id: 7, name: "sun_yi",    seed: 5, elo: 1554, lives: 3 },
  { id: 8, name: "Drelan",    seed: 8, elo: 1471, lives: 3 },
  { id: 9, name: "auroraX",   seed: 9, elo: 1583, lives: 3 },
];

/** The current user's stats. */
export const ME = ROSTER[0];

/** Activity log entries shown on the lobby right-hand column. */
export const LOBBY_ACTIVITY = [
  { who: "Drelan",    delay: "+0:32" },
  { who: "auroraX",   delay: "+0:24" },
  { who: "Léa.S",     delay: "+0:22" },
  { who: "M3RIDIAN",  delay: "+0:18" },
  { who: "tofu_king", delay: "+0:14" },
  { who: "Nyra_92",   delay: "+0:09" },
  { who: "Toi",       delay: "+0:00", self: true },
] as const;
