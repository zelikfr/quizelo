/**
 * Static, presentation-only data for the landing page.
 * Translatable strings live in `messages/*.json` — this file holds
 * design tokens (colors, icons) and structural data only.
 */

export const PHASE_TINTS = [
  { tint: "#7C5CFF", glow: "rgba(124,92,255,0.18)", kpiValue: "15"  },
  { tint: "#5EC2FF", glow: "rgba(94,194,255,0.18)", kpiValue: "60s" },
  { tint: "#FFD166", glow: "rgba(255,209,102,0.18)", kpiValue: "1"  },
] as const;

export const REWARD_TINTS = ["#FFD166", "#C9CFE0", "#B07A4A"] as const;

/** Sample question per category, used in the desktop grid card preview. */
export type CategorySample = { fr: string; en: string };

/**
 * The 8 canonical category IDs — same as the values stored in
 * `questions.category` on the DB so `categories.names.{id}` resolves
 * everywhere (home, in-game chip, profile accuracy).
 */
export type CategoryId =
  | "geography"
  | "history"
  | "entertainment"
  | "sport"
  | "art"
  | "web"
  | "science"
  | "fun";

export const CATEGORIES: ReadonlyArray<{
  id: CategoryId;
  icon: string;
  tint: string;
  sample: CategorySample;
}> = [
  { id: "geography",     icon: "◯", tint: "#5EC2FF", sample: { fr: "Capitale du Bhoutan ?",          en: "Capital of Bhutan?" } },
  { id: "history",       icon: "◇", tint: "#FFD166", sample: { fr: "Année du traité de Versailles ?", en: "Year of Versailles treaty?" } },
  { id: "entertainment", icon: "▣", tint: "#FF6BB5", sample: { fr: "Réalisateur de Inception ?",      en: "Director of Inception?" } },
  { id: "sport",         icon: "⏣", tint: "#4ADE80", sample: { fr: "Hôte des JO 2008 ?",             en: "Host of 2008 Olympics?" } },
  { id: "art",           icon: "✦", tint: "#A18BFF", sample: { fr: 'Auteur de "L\'Étranger" ?',      en: 'Author of "The Stranger"?' } },
  { id: "web",           icon: "⌬", tint: "#7DE0E0", sample: { fr: "Créateur de Linux ?",            en: "Creator of Linux?" } },
  { id: "science",       icon: "⚛", tint: "#FF8B5C", sample: { fr: "Symbole chimique de l'or ?",     en: "Chemical symbol for gold?" } },
  { id: "fun",           icon: "✺", tint: "#FF4D6D", sample: { fr: "Plus petit pays du monde ?",     en: "Smallest country?" } },
];

/** Demo roster shown in the hero `LiveMatchCard`. */
export const HERO_ROSTER = [
  { id: 1, name: "Aria",  seed: 0, dim: false },
  { id: 2, name: "Blaze", seed: 1, dim: true  },
  { id: 3, name: "Cyra",  seed: 2, dim: false },
  { id: 4, name: "Dex",   seed: 3, dim: false },
  { id: 5, name: "Echo",  seed: 4, dim: false },
  { id: 6, name: "Flare", seed: 5, dim: false },
  { id: 7, name: "Glyph", seed: 6, dim: false },
  { id: 8, name: "Hydra", seed: 7, dim: false },
] as const;

/** Demo answer choices for the hero card. The correct answer is at index 1. */
export const HERO_CHOICES = ["Sydney", "Canberra", "Melbourne", "Perth"] as const;
export const HERO_CORRECT_INDEX = 1;
