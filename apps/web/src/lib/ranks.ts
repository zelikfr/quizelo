import { ELO_TIERS, tierForElo, type EloTier } from "@quizelo/db";
import type { Locale } from "@/i18n/routing";

/**
 * ELO ladder, single source of truth in `@quizelo/db` so the seed
 * pipeline and the runtime picker share the exact same bands. This file
 * keeps the historical web names (`RANKS`, `Rank`, `rankFromElo`) and
 * adds the locale-aware UI helpers (`rankLabel`, `rankRange`).
 */
export const RANKS = ELO_TIERS;
export type Rank = EloTier;
export const rankFromElo = tierForElo;

export function rankLabel(rank: Rank, locale: Locale): string {
  return locale === "en" ? rank.nameEn : rank.name;
}

export function rankRange(index: number): string {
  const r = RANKS[index];
  if (!r) return "";
  const next = RANKS[index + 1];
  return next ? `${r.min}–${next.min - 1}` : `${r.min}+`;
}
