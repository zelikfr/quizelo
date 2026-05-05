"use server";

import { db, questions } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("FORBIDDEN");
  return session.user;
}

const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(200),
});

const updateSchema = z.object({
  prompt: z.string().min(1).max(500),
  choices: z.array(choiceSchema).length(4),
  correctChoiceId: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  locale: z.string().min(2).max(8),
  eloTarget: z.number().int().min(0).max(4000).nullable(),
  active: z.boolean(),
  explanation: z.string().nullable(),
});

/**
 * Every admin action stamps `lintReviewedAt = now()`. The seed
 * pipeline reads that column on `ON CONFLICT` and skips rewriting
 * `lintReason` / `active` when it's non-null, making admin verdicts
 * survive `pnpm db:seed` runs.
 */
export async function updateQuestionAction(id: string, raw: unknown) {
  await ensureAdmin();
  const data = updateSchema.parse(raw);

  // Sanity: the correct choice must reference a known choice id.
  if (!data.choices.some((c) => c.id === data.correctChoiceId)) {
    throw new Error("correctChoiceId must reference one of the choices");
  }

  await db
    .update(questions)
    .set({
      prompt: data.prompt,
      choices: data.choices,
      correctChoiceId: data.correctChoiceId,
      category: data.category,
      difficulty: data.difficulty,
      locale: data.locale,
      eloTarget: data.eloTarget,
      active: data.active,
      explanation: data.explanation,
      // Editing = reviewing. The admin saw the row and made a call.
      lintReviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(questions.id, id));

  revalidatePath("/questions");
  revalidatePath(`/questions/${id}`);
}

export async function toggleQuestionActiveAction(id: string, active: boolean) {
  await ensureAdmin();
  await db
    .update(questions)
    .set({ active, lintReviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(questions.id, id));
  revalidatePath("/questions");
}

export async function deleteQuestionAction(id: string) {
  await ensureAdmin();
  // We soft-delete via active=false because match_answers FK references
  // questions.id and we don't want to break history. Clearing
  // `lintReason` removes the row from the "needs review" queue —
  // delete is a verdict, same UX bucket as Approve. The
  // `lintReviewedAt` stamp keeps the seed pipeline from resurrecting
  // it on the next run.
  await db
    .update(questions)
    .set({
      active: false,
      lintReason: null,
      lintReviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(questions.id, id));
  revalidatePath("/questions");
}

/**
 * Clear a shape-leak flag and reactivate the question. Used from the
 * "Needs review" page when the admin has decided that a flagged
 * question is fine as-is (e.g., the linter caught a legitimate
 * comma in "Marie, reine d'Écosse" but the distractors actually do
 * follow the same `Title, role` template — the rule fired on a real
 * shape mismatch but the curator decided to ship it anyway).
 *
 * Stamps `lintReviewedAt` so the next `db:seed` won't re-flag the
 * same row.
 */
export async function approveQuestionAction(id: string) {
  await ensureAdmin();
  await db
    .update(questions)
    .set({
      active: true,
      lintReason: null,
      lintReviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(questions.id, id));
  revalidatePath("/questions");
  revalidatePath(`/questions/${id}`);
}
