"use server";

import { signIn, signOut, hashPassword } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq, or } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

const signupSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(16)
    .regex(/^[a-z0-9_]+$/i, "Only letters, digits and underscores"),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  acceptTerms: z.literal("on"),
  newsletter: z.string().optional(),
});

const magicLinkSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
});

export type AuthActionResult =
  | { ok: true }
  | { ok: false; code: "validation" | "credentials" | "duplicate" | "unknown"; message?: string };

// ─── Helpers ────────────────────────────────────────────────────
const handleAuthError = (err: unknown): AuthActionResult => {
  if (err instanceof AuthError) {
    if (err.type === "CredentialsSignin") {
      return { ok: false, code: "credentials", message: "Invalid email or password" };
    }
    return { ok: false, code: "unknown", message: err.message };
  }
  // next-auth throws a redirect; let it bubble up
  throw err;
};

// ─── Sign in (credentials) ──────────────────────────────────────
export async function signInWithCredentialsAction(
  _: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, code: "validation", message: parsed.error.issues[0]?.message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.redirectTo ?? "/home",
    });
    return { ok: true };
  } catch (err) {
    return handleAuthError(err);
  }
}

// ─── Sign up (credentials) ──────────────────────────────────────
export async function signUpWithCredentialsAction(
  _: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, code: "validation", message: parsed.error.issues[0]?.message };
  }

  const { handle, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const normalizedHandle = handle.toLowerCase();

  // Conflict check
  const existing = await db.query.users.findFirst({
    where: or(eq(users.email, normalizedEmail), eq(users.handle, normalizedHandle)),
    columns: { id: true, email: true, handle: true },
  });
  if (existing) {
    const dupField = existing.email === normalizedEmail ? "email" : "handle";
    return { ok: false, code: "duplicate", message: `${dupField} already in use` };
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email: normalizedEmail,
    handle: normalizedHandle,
    displayName: handle,
    passwordHash,
  });

  // Auto-login after signup
  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/home",
    });
    return { ok: true };
  } catch (err) {
    return handleAuthError(err);
  }
}

// ─── Magic link (Resend) ────────────────────────────────────────
export async function signInWithMagicLinkAction(
  _: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = magicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, code: "validation", message: parsed.error.issues[0]?.message };
  }

  try {
    await signIn("resend", {
      email: parsed.data.email,
      redirectTo: parsed.data.redirectTo ?? "/home",
    });
    return { ok: true };
  } catch (err) {
    return handleAuthError(err);
  }
}

// ─── OAuth ──────────────────────────────────────────────────────
export async function signInWithProviderAction(
  provider: "google" | "apple",
  redirectTo?: string,
): Promise<void> {
  await signIn(provider, { redirectTo: redirectTo ?? "/home" });
}

// ─── Sign out ───────────────────────────────────────────────────
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
