import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../client";
import { questions } from "../schema/game";
import { QUESTIONS } from "./questions";
import { defaultEloForDifficulty } from "./elo";

const main = async () => {
  console.log(`→ seeding ${QUESTIONS.length} questions…`);

  // Build choice payloads + a stable correctChoiceId from the index.
  const rows = QUESTIONS.map((q) => {
    const choices = q.choices.map((label, i) => ({
      id: `${q.id}-c${i}`,
      label,
    }));
    return {
      id: q.id,
      locale: q.locale,
      category: q.category,
      difficulty: q.difficulty,
      eloTarget: q.eloTarget ?? defaultEloForDifficulty(q.difficulty),
      prompt: q.prompt,
      choices,
      correctChoiceId: choices[q.correctIndex]!.id,
      explanation: q.explanation ?? null,
      timeLimit: q.timeLimit ?? 15,
      active: true,
    };
  });

  // Upsert by primary key (id). Drizzle has no native upsert helper for
  // pg yet, so we use a single insert ... on conflict do update.
  await db
    .insert(questions)
    .values(rows)
    .onConflictDoUpdate({
      target: questions.id,
      set: {
        locale: sql.raw(`excluded.${questions.locale.name}`),
        category: sql.raw(`excluded.${questions.category.name}`),
        difficulty: sql.raw(`excluded.${questions.difficulty.name}`),
        eloTarget: sql.raw(`excluded.${questions.eloTarget.name}`),
        prompt: sql.raw(`excluded.${questions.prompt.name}`),
        choices: sql.raw(`excluded.${questions.choices.name}`),
        correctChoiceId: sql.raw(`excluded.${questions.correctChoiceId.name}`),
        explanation: sql.raw(`excluded.${questions.explanation.name}`),
        timeLimit: sql.raw(`excluded.${questions.timeLimit.name}`),
        active: sql.raw(`excluded.${questions.active.name}`),
        updatedAt: sql`now()`,
      },
    });

  console.log(`✓ seeded ${rows.length} questions`);
  process.exit(0);
};

main().catch((err) => {
  console.error("✗ seed failed", err);
  process.exit(1);
});
