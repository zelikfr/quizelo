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
      updatedAt: new Date(),
    })
    .where(eq(questions.id, id));

  revalidatePath("/questions");
  revalidatePath(`/questions/${id}`);
}

export async function toggleQuestionActiveAction(id: string, active: boolean) {
  await ensureAdmin();
  await db.update(questions).set({ active, updatedAt: new Date() }).where(eq(questions.id, id));
  revalidatePath("/questions");
}

export async function deleteQuestionAction(id: string) {
  await ensureAdmin();
  // We soft-delete via active=false because match_answers FK references
  // questions.id and we don't want to break history.
  await db.update(questions).set({ active: false, updatedAt: new Date() }).where(eq(questions.id, id));
  revalidatePath("/questions");
}
