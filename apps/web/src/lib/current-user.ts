import "server-only";

import { auth } from "@/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string;
  handle: string | null;
  avatarId: number;
  image: string | null;
  elo: number;
  coins: number;
  isPremium: boolean;
  premiumUntil: Date | null;
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

  return {
    id: row.id,
    email: row.email,
    name: row.displayName ?? row.name ?? row.handle ?? "Player",
    handle: row.handle,
    avatarId: row.avatarId ?? FALLBACK_AVATAR_ID,
    image: row.image,
    elo: row.elo,
    coins: row.coins,
    isPremium: row.isPremium,
    premiumUntil: row.premiumUntil,
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
