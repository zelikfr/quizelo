"use server";

import { hashPassword } from "@quizelo/auth";
import { db, matches, matchPlayers, users } from "@quizelo/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/auth";

async function ensureAdmin() {
  const session = await getAdminSession();
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

/**
 * Hard-delete a shadow user. Cascades to `match_players`,
 * `match_answers`, `accounts`, `sessions` via the FK rules in the
 * schema, so historical bot rows disappear too — that's fine for a
 * synthetic player; it's not fine for a real human (whose match
 * history other users may have ELO derived from), so this action
 * refuses anything but a shadow row.
 *
 * Active-match guard: we won't yank a shadow out of a lobby/match
 * that's still in flight. The cascade would remove the runtime's DB
 * snapshot mid-game and leave the room state stale.
 */
export type DeleteShadowResult =
  | { ok: true }
  | { ok: false; code: "not_found" | "not_shadow" | "in_match" };

const ACTIVE_MATCH_STATUSES = [
  "lobby",
  "phase1",
  "transition_p1_p2",
  "phase2",
  "transition_p2_p3",
  "phase3",
] as const;

export async function deleteShadowAction(
  userId: string,
): Promise<DeleteShadowResult> {
  await ensureAdmin();

  const [u] = await db
    .select({ id: users.id, isShadow: users.isShadow })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!u) return { ok: false, code: "not_found" };
  if (!u.isShadow) return { ok: false, code: "not_shadow" };

  const [busy] = await db
    .select({ matchId: matchPlayers.matchId })
    .from(matchPlayers)
    .innerJoin(matches, eq(matches.id, matchPlayers.matchId))
    .where(
      and(
        eq(matchPlayers.userId, userId),
        inArray(matches.status, [...ACTIVE_MATCH_STATUSES]),
      ),
    )
    .limit(1);
  if (busy) return { ok: false, code: "in_match" };

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/users");
  return { ok: true };
}

/**
 * Bulk-delete every shadow that isn't currently in an active match.
 * Useful for wiping the population before re-seeding with fresh
 * names. Returns the count actually removed.
 */
export async function deleteAllIdleShadowsAction(): Promise<{ removed: number }> {
  await ensureAdmin();

  const removed = await db
    .delete(users)
    .where(
      sql`${users.isShadow} = true
          AND NOT EXISTS (
            SELECT 1 FROM match_players mp
            JOIN matches m ON m.id = mp.match_id
            WHERE mp.user_id = ${users.id}
              AND m.status IN ('lobby', 'phase1', 'transition_p1_p2',
                               'phase2', 'transition_p2_p3', 'phase3')
          )`,
    )
    .returning({ id: users.id });

  revalidatePath("/users");
  return { removed: removed.length };
}
