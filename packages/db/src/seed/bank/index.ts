/**
 * Aggregator for the curated question bank. Imports each category file
 * and concatenates them into a single `BANK_QUESTIONS` array consumed by
 * `seed/index.ts`.
 *
 * Each category aims for **400 entries** (50 facts × 4 difficulties × FR
 * + EN), giving a balanced 3 200-question bank across 8 categories.
 */
import type { SeedQuestion } from "../questions";
import { ART_QUESTIONS } from "./art";
import { ENTERTAINMENT_QUESTIONS } from "./entertainment";
import { FUN_QUESTIONS } from "./fun";
import { GEOGRAPHY_QUESTIONS } from "./geography";
import { HISTORY_QUESTIONS } from "./history";
import { SCIENCE_QUESTIONS } from "./science";
import { SPORT_QUESTIONS } from "./sport";
import { WEB_QUESTIONS } from "./web";

export const BANK_QUESTIONS: SeedQuestion[] = [
  ...GEOGRAPHY_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...ENTERTAINMENT_QUESTIONS,
  ...SPORT_QUESTIONS,
  ...ART_QUESTIONS,
  ...WEB_QUESTIONS,
  ...SCIENCE_QUESTIONS,
  ...FUN_QUESTIONS,
];
