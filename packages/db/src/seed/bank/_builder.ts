import type { SeedQuestion } from "../questions";

/**
 * Compact tuple format for hand-curated bilingual facts. The 3 distractors
 * per locale are written explicitly (no algorithmic shuffle pool), so every
 * question gets HAND_CURATED-quality wrong answers.
 *
 *   [qFr, qEn, aFr, aEn, [dFr1, dFr2, dFr3], [dEn1, dEn2, dEn3]]
 */
export type CuratedFact = readonly [
  qFr: string,
  qEn: string,
  aFr: string,
  aEn: string,
  distractorsFr: readonly [string, string, string],
  distractorsEn: readonly [string, string, string],
];

/** Four difficulty buckets, in order: easy, medium, hard, expert. */
export type CuratedBucket = readonly [
  easy: ReadonlyArray<CuratedFact>,
  medium: ReadonlyArray<CuratedFact>,
  hard: ReadonlyArray<CuratedFact>,
  expert: ReadonlyArray<CuratedFact>,
];

const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pad(n: number, width = 3): string {
  return String(n).padStart(width, "0");
}

/**
 * Expand a 4-bucket curated category into bilingual `SeedQuestion[]`.
 * Correct-answer position is hash-derived from the fact text, so it
 * varies across questions but stays stable across re-seeds.
 */
export function buildCuratedCategory(
  category: string,
  shortId: string,
  buckets: CuratedBucket,
): SeedQuestion[] {
  const out: SeedQuestion[] = [];
  for (let d = 0; d < DIFFICULTIES.length; d++) {
    const difficulty: Difficulty = DIFFICULTIES[d]!;
    const facts = buckets[d]!;
    for (let i = 0; i < facts.length; i++) {
      const fact = facts[i]!;
      const [qFr, qEn, aFr, aEn, distFr, distEn] = fact;
      const seed = hashString(`${category}:${difficulty}:${qFr}`);
      const idxFr = seed % 4;
      const idxEn = (seed >>> 8) % 4;
      const choicesFr = [...distFr];
      choicesFr.splice(idxFr, 0, aFr);
      const choicesEn = [...distEn];
      choicesEn.splice(idxEn, 0, aEn);
      const idStr = pad(i);
      out.push({
        id: `fr-${shortId}-${difficulty}-${idStr}`,
        locale: "fr",
        category,
        difficulty,
        prompt: qFr,
        choices: choicesFr,
        correctIndex: idxFr,
      });
      out.push({
        id: `en-${shortId}-${difficulty}-${idStr}`,
        locale: "en",
        category,
        difficulty,
        prompt: qEn,
        choices: choicesEn,
        correctIndex: idxEn,
      });
    }
  }
  return out;
}
