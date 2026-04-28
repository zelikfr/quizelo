import type { Locale } from "@/i18n/routing";

/**
 * ELO ladder. `name` is the canonical (FR) label, `nameEn` the English one.
 * `min` is the inclusive lower bound of the tier — derive ranges with the next entry.
 */
export const RANKS = [
  { name: "Bronze",  nameEn: "Bronze",  min: 0,    color: "#B07A4A", glow: "rgba(176,122,74,0.40)" },
  { name: "Argent",  nameEn: "Silver",  min: 800,  color: "#C9CFE0", glow: "rgba(201,207,224,0.35)" },
  { name: "Or",      nameEn: "Gold",    min: 1200, color: "#FFD166", glow: "rgba(255,209,102,0.40)" },
  { name: "Platine", nameEn: "Plat",    min: 1600, color: "#7DE0E0", glow: "rgba(125,224,224,0.40)" },
  { name: "Diamant", nameEn: "Diamond", min: 2000, color: "#93B4FF", glow: "rgba(147,180,255,0.40)" },
  { name: "Élite",   nameEn: "Elite",   min: 2400, color: "#FF6BB5", glow: "rgba(255,107,181,0.45)" },
] as const;

export type Rank = (typeof RANKS)[number];

export function rankFromElo(elo: number): Rank {
  let current: Rank = RANKS[0];
  for (const r of RANKS) {
    if (elo >= r.min) current = r;
  }
  return current;
}

export function rankLabel(rank: Rank, locale: Locale): string {
  return locale === "en" ? rank.nameEn : rank.name;
}

export function rankRange(index: number): string {
  const r = RANKS[index];
  const next = RANKS[index + 1];
  return next ? `${r.min}–${next.min - 1}` : `${r.min}+`;
}
