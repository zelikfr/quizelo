"use server";

import { auth, signIn, signOut, hashPassword } from "@quizelo/auth";
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

const newPasswordSchema = z.object({
  password: z.string().min(8).max(200),
});

export type AuthActionResult =
  | { ok: true }
  | { ok: false; code: "validation" | "credentials" | "duplicate" | "unauthorized" | "unknown"; message?: string };

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

  // Send a verification magic link instead of auto-login. Clicking the
  // link signs the user in *and* sets `emailVerified` (Resend adapter).
  // The shared `/auth/verify` page tells them to check their inbox.
  try {
    await signIn("resend", {
      email: normalizedEmail,
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

// ─── Resend verification email ──────────────────────────────────
/**
 * Re-send the email-verification magic link to the current user. Used
 * by the "Verify your email" banner on /home when their account is
 * still flagged as unverified.
 *
 * Uses `redirect: false` so the call returns to the client UI instead
 * of bouncing them through the magic-link landing.
 */
export async function resendVerificationEmailAction(): Promise<AuthActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { email: true, emailVerified: true },
  });
  if (!row?.email) {
    return { ok: false, code: "unknown", message: "No email on this account" };
  }
  if (row.emailVerified) {
    // Already verified — pretend we succeeded so the banner fades.
    return { ok: true };
  }

  try {
    await signIn("resend", { email: row.email, redirect: false });
    return { ok: true };
  } catch (err) {
    return handleAuthError(err);
  }
}

// ─── Password reset (request + new password) ───────────────────
/**
 * Step 1 of password reset — send a magic link to the user's email
 * pointing back to /auth/new-password. The link both signs them in and
 * lands them on a page where they can set a new password.
 *
 * For privacy we never reveal whether the email exists in the DB: the
 * action always returns `{ ok: true }` so an attacker can't enumerate
 * accounts. If the email is unknown, no mail is sent.
 */
export async function requestPasswordResetAction(
  _: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = magicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, code: "validation", message: parsed.error.issues[0]?.message };
  }

  const email = parsed.data.email.toLowerCase();
  const known = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (!known) {
    // Silent ok — don't leak account existence.
    return { ok: true };
  }

  try {
    await signIn("resend", {
      email,
      redirectTo: "/auth/new-password",
    });
    return { ok: true };
  } catch (err) {
    return handleAuthError(err);
  }
}

/**
 * Step 2 of password reset — the user is signed in (via the magic link)
 * and submits a new password. Updates `users.passwordHash` for the
 * current session user.
 */
export async function setNewPasswordAction(
  _: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Session expired" };
  }

  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, code: "validation", message: parsed.error.issues[0]?.message };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "DB update failed",
    };
  }
}
