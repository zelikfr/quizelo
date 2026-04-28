import { db, questions } from "@quizelo/db";
import { and, eq } from "drizzle-orm";
import { pickN } from "./random";
import type { DbQuestion } from "./types";

/** How deep the per-match pool goes. Phases dip into this in order. */
const POOL_SIZE = 60;

/**
 * Pull active questions for the locale and pick `POOL_SIZE` deterministically
 * from the seed. Questions are consumed sequentially across the 3 phases.
 */
export async function pickQuestionsForMatch(
  locale: string,
  rand: () => number,
): Promise<DbQuestion[]> {
  const rows = await db
    .select({
      id: questions.id,
      locale: questions.locale,
      category: questions.category,
      difficulty: questions.difficulty,
      prompt: questions.prompt,
      choices: questions.choices,
      correctChoiceId: questions.correctChoiceId,
      timeLimit: questions.timeLimit,
    })
    .from(questions)
    .where(and(eq(questions.locale, locale), eq(questions.active, true)));

  if (rows.length === 0) {
    throw new Error(
      `No active questions for locale=${locale}. Run pnpm db:seed.`,
    );
  }

  // If the bank is small, repeat with a fresh shuffle to reach POOL_SIZE.
  const target = Math.max(POOL_SIZE, rows.length);
  const out: DbQuestion[] = [];
  let pool: DbQuestion[] = [];
  while (out.length < target) {
    if (pool.length === 0) pool = pickN(rows as DbQuestion[], rows.length, rand);
    const next = pool.shift()!;
    out.push(next);
  }
  return out.slice(0, POOL_SIZE);
}
