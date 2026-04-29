/**
 * ELO tier helpers shared by the seed pipeline, the runtime picker, and
 * the UI. Six tiers anchor the difficulty system:
 *
 *   Bronze   :    0–799   · trivial general knowledge
 *   Argent   :  800–1199  · common adult knowledge
 *   Or       : 1200–1599  · TV-quiz level
 *   Platine  : 1600–1999  · notable trivia / specifics
 *   Diamant  : 2000–2399  · specialist knowledge
 *   Élite    : 2400+      · top-tier expert questions
 */

export interface EloTier {
  /** Stable identifier, used in code & analytics. */
  id: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "elite";
  /** Display name FR. */
  name: string;
  /** Display name EN. */
  nameEn: string;
  /** Lower bound (inclusive). */
  min: number;
  /** Hex color for badges, podium, leaderboard. */
  color: string;
  /** rgba color for outer glow effects. */
  glow: string;
  /** Centre-of-band ELO used as a question target. */
  target: number;
}

export const ELO_TIERS: readonly EloTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    nameEn: "Bronze",
    min: 0,
    color: "#B07A4A",
    glow: "rgba(176,122,74,0.40)",
    target: 600,
  },
  {
    id: "silver",
    name: "Argent",
    nameEn: "Silver",
    min: 800,
    color: "#C9CFE0",
    glow: "rgba(201,207,224,0.35)",
    target: 1000,
  },
  {
    id: "gold",
    name: "Or",
    nameEn: "Gold",
    min: 1200,
    color: "#FFD166",
    glow: "rgba(255,209,102,0.40)",
    target: 1400,
  },
  {
    id: "platinum",
    name: "Platine",
    nameEn: "Plat",
    min: 1600,
    color: "#7DE0E0",
    glow: "rgba(125,224,224,0.40)",
    target: 1800,
  },
  {
    id: "diamond",
    name: "Diamant",
    nameEn: "Diamond",
    min: 2000,
    color: "#93B4FF",
    glow: "rgba(147,180,255,0.40)",
    target: 2200,
  },
  {
    id: "elite",
    name: "Élite",
    nameEn: "Elite",
    min: 2400,
    color: "#FF6BB5",
    glow: "rgba(255,107,181,0.45)",
    target: 2500,
  },
] as const;

/** Find the tier an ELO value belongs to (always returns a tier). */
export function tierForElo(elo: number): EloTier {
  let current = ELO_TIERS[0]!;
  for (const t of ELO_TIERS) {
    if (elo >= t.min) current = t;
    else break;
  }
  return current;
}

export type Difficulty = "easy" | "medium" | "hard" | "expert";

/**
 * Each difficulty level lands on the **centre** of an ELO tier. This
 * gives a clean 4 → 4 mapping over the 6 tiers (Bronze and Élite are
 * reserved for explicitly-classified questions, since they sit at the
 * extremes of the player population). Spacing is uniform (400 ELO),
 * which keeps the question pool well-spread across the typical player
 * range and lines up naturally with the picker windows
 * (±150 ranked, ±500 quick).
 */
const DIFFICULTY_DEFAULT_ELO: Record<Difficulty, number> = {
  easy: 1000, // Argent — well-known knowledge, distractors are obvious
  medium: 1400, // Or — TV-quiz standard, distractors plausible
  hard: 1800, // Platine — specifics required, distractors confusable
  expert: 2200, // Diamant — specialist territory
};

/** Pick a sensible default ELO from the difficulty label. */
export function defaultEloForDifficulty(d: Difficulty): number {
  return DIFFICULTY_DEFAULT_ELO[d];
}

/**
 * Derive a 4-level difficulty from a target ELO. The 6 tiers collapse to
 * 4 difficulties in pairs: Bronze+Argent = easy, Or = medium,
 * Platine = hard, Diamant+Élite = expert.
 */
export function difficultyForElo(elo: number): Difficulty {
  if (elo < 1200) return "easy";
  if (elo < 1600) return "medium";
  if (elo < 2000) return "hard";
  return "expert";
}
