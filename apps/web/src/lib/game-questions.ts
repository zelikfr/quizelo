import type { Locale } from "@/i18n/routing";

/**
 * Bilingual question fixtures for the gameplay mockups.
 * Server pages pick the right locale at render time.
 */

export interface QCMQuestion {
  category: string; // matches a key in `categories.names` i18n
  text: string;
  choices: readonly string[];
  /** Index of the correct answer in `choices`. */
  answerIndex: number;
}

const FR: Record<string, QCMQuestion> = {
  phase1: {
    category: "Geography",
    text: "Quelle est la capitale de la Mongolie ?",
    choices: ["Astana", "Oulan-Bator", "Bichkek", "Tachkent"],
    answerIndex: 1,
  },
  sprint: {
    category: "Web",
    text: "Quel réseau social a été lancé en 2010 par Kevin Systrom ?",
    choices: ["Pinterest", "Instagram", "Snapchat", "TikTok"],
    answerIndex: 1,
  },
  finale: {
    category: "Sport",
    text: "Combien de Ballons d'Or possède Lionel Messi en 2024 ?",
    choices: ["6", "7", "8", "9"],
    answerIndex: 2,
  },
};

const EN: Record<string, QCMQuestion> = {
  phase1: {
    category: "Geography",
    text: "What is the capital of Mongolia?",
    choices: ["Astana", "Ulaanbaatar", "Bishkek", "Tashkent"],
    answerIndex: 1,
  },
  sprint: {
    category: "Web",
    text: "Which social network did Kevin Systrom launch in 2010?",
    choices: ["Pinterest", "Instagram", "Snapchat", "TikTok"],
    answerIndex: 1,
  },
  finale: {
    category: "Sport",
    text: "How many Ballon d'Or has Lionel Messi won as of 2024?",
    choices: ["6", "7", "8", "9"],
    answerIndex: 2,
  },
};

export function getQuestion(key: keyof typeof FR, locale: Locale): QCMQuestion {
  return locale === "en" ? EN[key] : FR[key];
}

/** Sprint live-leaderboard data — top 5 of phase 2. */
export const SPRINT_SCORES = [
  { playerId: 1, score: 11 },
  { playerId: 5, score: 10 },
  { playerId: 0, score:  9 },
  { playerId: 9, score:  6 },
  { playerId: 3, score:  3 },
] as const;

/** Final 3 player IDs, with overrides for lives + "last" flag. */
export const FINALISTS = [
  { playerId: 0, lives: 2, isLast: false },
  { playerId: 1, lives: 3, isLast: true  },
  { playerId: 5, lives: 2, isLast: false },
] as const;

/** Final podium with ELO deltas. Place 1 / 2 / 3 in declaration order. */
export const PODIUM = [
  { playerId: 1, place: 1, eloDelta: 28 },
  { playerId: 0, place: 2, eloDelta: 12 },
  { playerId: 5, place: 3, eloDelta:  6 },
] as const;

/** Phase 1 outcome — top 5 fastest survive, others go out. */
export const PHASE1_SURVIVOR_IDS = [1, 5, 9, 0, 3] as const;
export const PHASE1_ELIMINATED_IDS = [2, 4, 6, 7, 8] as const;

/** Phase 2 outcome — top 3 sprint scores advance to finale. */
export const PHASE2_FINALIST_IDS = [1, 5, 0] as const;
export const PHASE2_ELIMINATED_IDS = [9, 3] as const;
