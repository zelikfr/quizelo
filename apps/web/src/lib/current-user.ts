import "server-only";

import { auth } from "@/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";

export interface CurrentUser {
  id: string;
  email: string | null;
  /** Set by Auth.js when the user clicks the magic link sent at signup. */
  emailVerified: Date | null;
  name: string;
  handle: string | null;
  avatarId: number;
  image: string | null;
  elo: number;
  coins: number;
  /** Owned boost cards keyed by boost id, e.g. `{ "x2-3": 5 }`. */
  boostInventory: Record<string, number>;
  isPremium: boolean;
  premiumUntil: Date | null;
  /** True when the user has scheduled a cancellation that hasn't kicked in yet. */
  premiumCancelAtPeriodEnd: boolean;
  locale: string;
  // Contact + address — all optional, edited from /settings.
  phone: string | null;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

const FALLBACK_AVATAR_ID = 0;

/**
 * Resolve the currently authenticated user with all Quizelo-specific
 * fields. Returns `null` if there's no session or the row is gone.
 *
 * Reads off the Drizzle DB; cached per request by Next via React's
 * dedupe so multiple components can call it cheaply.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!row) return null;

  // Apply expiry: a user flagged premium whose `premiumUntil` is in the
  // past is treated as free everywhere in the UI. The DB row stays as-is
  // (cleanup is a job for a future cron).
  const now = Date.now();
  const isCurrentlyPremium =
    row.isPremium &&
    (!row.premiumUntil || row.premiumUntil.getTime() > now);

  return {
    id: row.id,
    email: row.email,
    emailVerified: row.emailVerified,
    name: row.displayName ?? row.name ?? row.handle ?? "Player",
    handle: row.handle,
    avatarId: row.avatarId ?? FALLBACK_AVATAR_ID,
    image: row.image,
    elo: row.elo,
    coins: row.coins,
    boostInventory: (row.boostInventory ?? {}) as Record<string, number>,
    isPremium: isCurrentlyPremium,
    premiumUntil: row.premiumUntil,
    premiumCancelAtPeriodEnd: row.premiumCancelAtPeriodEnd,
    locale: row.locale,
    phone: row.phone,
    addressLine: row.addressLine,
    city: row.city,
    postalCode: row.postalCode,
    country: row.country,
  };
}

/**
 * Same as getCurrentUser() but throws if there's no session — useful in
 * server components rendered behind an auth-gated route.
 */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}
