"use server";

import { auth } from "@/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type UserActionResult =
  | { ok: true }
  | {
      ok: false;
      code: "unauthorized" | "validation" | "unknown";
      message?: string;
    };

/* ── Field schemas ──────────────────────────────────────────────────────── */

/**
 * Per-field Zod validators. Empty string is allowed and turned into `null`
 * in the DB so a user can clear an optional field.
 */
const FIELD_SCHEMAS = {
  displayName: z
    .string()
    .trim()
    .min(1, "Le nom doit faire au moins 1 caractère")
    .max(40, "Le nom est trop long (40 max)")
    .regex(
      /^[\p{L}\p{N} _.\-]+$/u,
      "Caractères autorisés : lettres, chiffres, espace, _ . -",
    ),
  phone: z
    .string()
    .trim()
    .max(40, "Le numéro est trop long")
    .regex(/^[+\d\s.()\-]*$/, "Format : chiffres, espace, +, -, ., ()"),
  addressLine: z
    .string()
    .trim()
    .max(120, "Adresse trop longue (120 max)"),
  city: z.string().trim().max(60, "Ville trop longue (60 max)"),
  postalCode: z
    .string()
    .trim()
    .max(20, "Code postal trop long")
    .regex(
      /^[\p{L}\p{N} \-]*$/u,
      "Caractères autorisés : lettres, chiffres, espace, -",
    ),
  country: z.string().trim().max(60, "Pays trop long (60 max)"),
} as const;

export type UserField = keyof typeof FIELD_SCHEMAS;

/** Mapping logical field → actual `users` column for the Drizzle update. */
function columnFor(field: UserField): keyof typeof users.$inferInsert {
  switch (field) {
    case "displayName":
      return "displayName";
    case "phone":
      return "phone";
    case "addressLine":
      return "addressLine";
    case "city":
      return "city";
    case "postalCode":
      return "postalCode";
    case "country":
      return "country";
  }
}

/* ── Generic field update ───────────────────────────────────────────────── */

/**
 * Validate `raw` against the schema for `field` then write it to the user
 * row. Empty strings (after trim) are stored as NULL — except for
 * `displayName` which has min(1) and rejects empty input.
 */
export async function updateUserFieldAction(
  field: UserField,
  raw: string,
): Promise<UserActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const schema = FIELD_SCHEMAS[field];
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues[0]?.message ?? "Valeur invalide",
    };
  }

  const value = parsed.data;
  // Optional fields: empty string → NULL; required (displayName) → keep value.
  const nextValue =
    field === "displayName" ? value : value.length === 0 ? null : value;

  try {
    await db
      .update(users)
      .set({ [columnFor(field)]: nextValue, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "DB update failed",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── Avatar (typed separately — value is a number) ──────────────────────── */

const avatarSchema = z.number().int().min(0).max(99);

export async function updateAvatarIdAction(
  raw: number,
): Promise<UserActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const parsed = avatarSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues[0]?.message ?? "Avatar invalide",
    };
  }

  try {
    await db
      .update(users)
      .set({ avatarId: parsed.data, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "DB update failed",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── Backwards-compat shim — kept so existing imports keep working ──────── */

export async function updateDisplayNameAction(
  raw: string,
): Promise<UserActionResult> {
  return updateUserFieldAction("displayName", raw);
}

/* ── Premium toggle (no payment, dev-mode activation) ───────────────────── */

export type PremiumDuration = "month" | "year";

/**
 * Activate Quizelo Premium for `duration` starting from now (or extend
 * the current subscription if one is already active). No payment is
 * processed — this is a dev-mode toggle until billing is wired in.
 */
export async function activatePremiumAction(
  duration: PremiumDuration,
): Promise<UserActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  if (duration !== "month" && duration !== "year") {
    return { ok: false, code: "validation", message: "Durée invalide" };
  }

  // Read the user once so we can extend an active subscription.
  const [row] = await db
    .select({
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const now = Date.now();
  // If already premium and still active, extend from `premiumUntil`;
  // otherwise start from now.
  const startMs =
    row?.isPremium && row.premiumUntil && row.premiumUntil.getTime() > now
      ? row.premiumUntil.getTime()
      : now;

  const addMs =
    duration === "month"
      ? 30 * 24 * 60 * 60 * 1000
      : 365 * 24 * 60 * 60 * 1000;
  const until = new Date(startMs + addMs);

  try {
    await db
      .update(users)
      .set({
        isPremium: true,
        premiumUntil: until,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "DB update failed",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Cancel Premium immediately. */
export async function cancelPremiumAction(): Promise<UserActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  try {
    await db
      .update(users)
      .set({
        isPremium: false,
        premiumUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "DB update failed",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
