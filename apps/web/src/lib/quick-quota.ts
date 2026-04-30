import "server-only";

import { db, users } from "@quizelo/db";
import { and, eq, gt, sql } from "drizzle-orm";

/** How many free quick matches a non-premium player gets per UTC day. */
export const QUICK_QUOTA_PER_DAY = 3;

export interface QuickQuota {
  /** Matches still playable today (or `null` for premium = unlimited). */
  remaining: number | null;
  /** Daily ceiling used to render the progress bar (always {@link QUICK_QUOTA_PER_DAY}). */
  max: number;
  isPremium: boolean;
}

/** Did this date roll into a new UTC day relative to now? */
function isStale(d: Date | null): boolean {
  if (!d) return true;
  const now = new Date();
  return d.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);
}

/** True when the user is currently premium **and** hasn't expired yet. */
function isCurrentlyPremium(
  isPremium: boolean,
  premiumUntil: Date | null,
): boolean {
  if (!isPremium) return false;
  // No expiry set → treat as active (lifetime / dev-mode).
  if (!premiumUntil) return true;
  return premiumUntil.getTime() > Date.now();
}

/** Read the user's current quota, applying the daily reset on the fly. */
export async function getQuickQuota(userId: string): Promise<QuickQuota | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      isPremium: true,
      premiumUntil: true,
      quickMatchesRemaining: true,
      quickMatchesResetAt: true,
    },
  });
  if (!row) return null;

  if (isCurrentlyPremium(row.isPremium, row.premiumUntil)) {
    return { remaining: null, max: QUICK_QUOTA_PER_DAY, isPremium: true };
  }

  if (isStale(row.quickMatchesResetAt)) {
    await db
      .update(users)
      .set({
        quickMatchesRemaining: QUICK_QUOTA_PER_DAY,
        quickMatchesResetAt: new Date(),
      })
      .where(eq(users.id, userId));
    return {
      remaining: QUICK_QUOTA_PER_DAY,
      max: QUICK_QUOTA_PER_DAY,
      isPremium: false,
    };
  }

  return {
    remaining: row.quickMatchesRemaining,
    max: QUICK_QUOTA_PER_DAY,
    isPremium: false,
  };
}

export type ConsumeResult =
  | { ok: true; remaining: number | null }
  | { ok: false; reason: "blocked" | "not_found" };

/**
 * Atomically consume one quick match. Premium users always pass without
 * touching the counter. Free users only pass if `remaining > 0`.
 */
export async function consumeQuickMatch(userId: string): Promise<ConsumeResult> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      isPremium: true,
      premiumUntil: true,
      quickMatchesRemaining: true,
      quickMatchesResetAt: true,
    },
  });
  if (!row) return { ok: false, reason: "not_found" };
  if (isCurrentlyPremium(row.isPremium, row.premiumUntil)) {
    return { ok: true, remaining: null };
  }

  // Mid-night roll: reset before consuming so the very first match of the
  // day always succeeds.
  if (isStale(row.quickMatchesResetAt)) {
    const result = await db
      .update(users)
      .set({
        quickMatchesRemaining: QUICK_QUOTA_PER_DAY - 1,
        quickMatchesResetAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ remaining: users.quickMatchesRemaining });
    return { ok: true, remaining: result[0]?.remaining ?? 0 };
  }

  // Atomic decrement — only succeeds if `remaining > 0`.
  const result = await db
    .update(users)
    .set({ quickMatchesRemaining: sql`${users.quickMatchesRemaining} - 1` })
    .where(and(eq(users.id, userId), gt(users.quickMatchesRemaining, 0)))
    .returning({ remaining: users.quickMatchesRemaining });

  if (result.length === 0) return { ok: false, reason: "blocked" };
  return { ok: true, remaining: result[0]?.remaining ?? 0 };
}

/**
 * Award one bonus quick match (e.g. after watching a rewarded ad). Premium
 * users are no-ops since they don't have a counter.
 */
export async function awardQuickMatchBonus(userId: string): Promise<QuickQuota | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      isPremium: true,
      premiumUntil: true,
      quickMatchesRemaining: true,
      quickMatchesResetAt: true,
    },
  });
  if (!row) return null;
  if (isCurrentlyPremium(row.isPremium, row.premiumUntil)) {
    return { remaining: null, max: QUICK_QUOTA_PER_DAY, isPremium: true };
  }

  // If a new UTC day has started, treat the increment as the day's first
  // event: reset to MAX, then add one bonus.
  const stale = isStale(row.quickMatchesResetAt);
  const baseline = stale ? QUICK_QUOTA_PER_DAY : row.quickMatchesRemaining;

  const result = await db
    .update(users)
    .set({
      quickMatchesRemaining: baseline + 1,
      quickMatchesResetAt: stale ? new Date() : row.quickMatchesResetAt,
    })
    .where(eq(users.id, userId))
    .returning({ remaining: users.quickMatchesRemaining });

  return {
    remaining: result[0]?.remaining ?? baseline + 1,
    max: QUICK_QUOTA_PER_DAY,
    isPremium: false,
  };
}
