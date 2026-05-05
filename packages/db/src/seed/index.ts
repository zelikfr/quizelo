import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../client";
import { questions } from "../schema/game";
import { QUESTIONS } from "./questions";
import { defaultEloForDifficulty } from "./elo";
import { detectShapeLeak } from "./shape-leak";

const main = async () => {
  console.log(`→ seeding ${QUESTIONS.length} questions…`);

  // Build choice payloads + a stable correctChoiceId from the index.
  // We also run the shape-leak linter inline: any question whose
  // correct answer would be guessable by elimination (paren-only,
  // comma-only, or a word common to every distractor) gets shipped
  // with `active: false` and a `lintReason` so an admin reviews it
  // in the backoffice "Needs review" page before it's served to
  // players.
  let flaggedCount = 0;
  const rows = QUESTIONS.map((q) => {
    const choices = q.choices.map((label, i) => ({
      id: `${q.id}-c${i}`,
      label,
    }));
    const correct = q.choices[q.correctIndex]!;
    const distractors = q.choices.filter((_, i) => i !== q.correctIndex);
    const lintReason = detectShapeLeak(correct, distractors);
    if (lintReason) flaggedCount++;
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
      active: lintReason === null,
      lintReason,
    };
  });

  // Upsert by primary key (id). Drizzle has no native upsert helper for
  // pg yet, so we use a single insert ... on conflict do update.
  //
  // Sticky-review strategy:
  //
  //   `lintReviewedAt` is the sticky-decision marker. Once an admin
  //   has acted on a row (approve / edit / toggle / delete) the
  //   backoffice stamps this column to `now()`. From then on, the
  //   seed pipeline must NOT overwrite ANY field on that row — not
  //   just lint_reason / active, but ALSO prompt / choices /
  //   correctChoiceId etc., otherwise an admin's hand-edit gets
  //   silently reverted by the next `pnpm db:seed`.
  //
  //   We implement this with a per-column CASE expression: if the
  //   row is reviewed, keep the existing DB value; else take the new
  //   value from `excluded` (the bank file). The two columns that
  //   need extra logic are `lintReason` and `active`:
  //
  //     - `lintReason`: reviewed → keep, else mirror bank's lint
  //       result (which may now be null if the curator fixed the
  //       leak in source).
  //     - `active`: reviewed → keep, else: force false when newly
  //       flagged, otherwise keep current (don't auto-reactivate a
  //       row that was inactive for unrelated reasons).
  //
  //   To re-publish a curator-side edit on top of an admin edit, the
  //   admin must clear `lintReviewedAt` for that row (manual SQL or
  //   future "request re-review" action), then re-seed.
  //
  // Postgres ambiguity note: column names exist on both sides of the
  // ON CONFLICT (the existing row and `excluded`), so unqualified
  // references throw `42702`. Always prefix with `questions.` or
  // `excluded.`.
  const reviewed = `questions.${questions.lintReviewedAt.name} IS NOT NULL`;
  const preserveIfReviewed = (col: string) =>
    sql.raw(
      `CASE WHEN ${reviewed} ` +
        `THEN questions.${col} ` +
        `ELSE excluded.${col} END`,
    );

  await db
    .insert(questions)
    .values(rows)
    .onConflictDoUpdate({
      target: questions.id,
      set: {
        // Content fields — preserved if the admin has reviewed.
        locale: preserveIfReviewed(questions.locale.name),
        category: preserveIfReviewed(questions.category.name),
        difficulty: preserveIfReviewed(questions.difficulty.name),
        eloTarget: preserveIfReviewed(questions.eloTarget.name),
        prompt: preserveIfReviewed(questions.prompt.name),
        choices: preserveIfReviewed(questions.choices.name),
        correctChoiceId: preserveIfReviewed(questions.correctChoiceId.name),
        explanation: preserveIfReviewed(questions.explanation.name),
        timeLimit: preserveIfReviewed(questions.timeLimit.name),
        // Lint flag follows the same sticky rule.
        lintReason: preserveIfReviewed(questions.lintReason.name),
        // Active gets a 3-way branch: reviewed → keep ; flagged →
        // false ; otherwise keep current.
        active: sql.raw(
          `CASE WHEN ${reviewed} ` +
            `THEN questions.${questions.active.name} ` +
            `WHEN excluded.${questions.lintReason.name} IS NOT NULL ` +
            `THEN false ` +
            `ELSE questions.${questions.active.name} END`,
        ),
        updatedAt: sql`now()`,
      },
    });

  console.log(`✓ seeded ${rows.length} questions`);
  if (flaggedCount > 0) {
    console.log(
      `⚠ ${flaggedCount} questions flagged by shape-leak lint and shipped inactive — review them in the backoffice (/questions?active=no).`,
    );
  }
  process.exit(0);
};

main().catch((err) => {
  console.error("✗ seed failed", err);
  process.exit(1);
});
