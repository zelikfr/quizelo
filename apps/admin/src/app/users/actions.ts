"use server";

import { hashPassword } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("FORBIDDEN");
  return session.user;
}

export async function setPremiumAction(userId: string, days: number | "off") {
  await ensureAdmin();

  if (days === "off") {
    await db
      .update(users)
      .set({ isPremium: false, premiumUntil: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } else {
    const until = new Date(Date.now() + days * 86_400_000);
    await db
      .update(users)
      .set({ isPremium: true, premiumUntil: until, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  revalidatePath("/users");
}

export async function forceVerifyEmailAction(userId: string) {
  await ensureAdmin();
  await db
    .update(users)
    .set({ emailVerified: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/users");
}

export async function resetPasswordAction(userId: string, newPassword: string) {
  await ensureAdmin();
  if (newPassword.length < 8) throw new Error("Password too short");
  const hash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash: hash, updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/users");
}

/**
 * "Ban" = revoke email verification + null the password hash.
 * Without a verified email the player gets stuck behind the
 * /auth/verify-required gate, and without a password the Credentials
 * provider can't sign them in. OAuth links would still let them in,
 * which is fine for our scope.
 *
 * We don't truly delete the row — match history references it.
 */
export async function banUserAction(userId: string) {
  await ensureAdmin();
  await db
    .update(users)
    .set({
      emailVerified: null,
      passwordHash: null,
      isPremium: false,
      premiumUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  revalidatePath("/users");
}

export async function adjustEloAction(userId: string, delta: number) {
  await ensureAdmin();
  if (!Number.isFinite(delta)) throw new Error("Invalid delta");
  const [u] = await db.select({ elo: users.elo }).from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return;
  const next = Math.max(0, Math.min(4000, u.elo + delta));
  await db
    .update(users)
    .set({ elo: next, updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/users");
}
