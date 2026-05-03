"use server";

import { auth } from "@quizelo/auth";
import { db, matches, matchPlayers, referralRewards, users } from "@quizelo/db";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  MILESTONE_AWARDS,
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LEN,
  type MilestoneId,
  type ReferralFriend,
  type ReferralState,
} from "./referral-config";

/* ── Code generation ───────────────────────────────────────────────── */

function generateCode(): string {
  let out = "";
  for (let i = 0; i < REFERRAL_CODE_LEN; i++) {
    out +=
      REFERRAL_CODE_ALPHABET[
        Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length)
      ];
  }
  // Format as `XXXX-XXXX` for readability.
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

/**
 * Lazy-generate (or read) the user's personal referral code. Stable
 * for life once generated. Up to 5 retries on accidental collision —
 * with 32^8 = 1.1e12 possibilities, collisions are virtually impossible.
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { referralCode: true },
  });
  if (row?.referralCode) return row.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode();
    try {
      await db
        .update(users)
        .set({ referralCode: candidate, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return candidate;
    } catch {
      // unique violation → retry with a fresh code
    }
  }
  throw new Error("Failed to generate a unique referral code after 5 tries");
}

/* ── Public actions ────────────────────────────────────────────────── */

/**
 * Aggregate everything the /referral page needs in one call:
 *   - the user's own code (lazy-created)
 *   - all referees, with per-friend stats + tier reached
 *   - lifetime totals for the stat tiles
 *   - milestone progress (computed across the referee population —
 *     "have any of my friends played their first game?", etc.)
 *
 * Side effect: also runs `settleReferralRewards` so any newly-met
 * milestones get awarded before we read the totals. That's why
 * loading /referral right after a friend hits a milestone shows the
 * fresh credits without needing a separate cron.
 */
export async function getReferralState(): Promise<ReferralState | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Settle pending rewards first so totals/friends are up to date.
  await settleReferralRewards(session.user.id).catch(() => {
    // Non-fatal — we still want to render even if settlement fails.
  });

  const code = await getOrCreateReferralCode(session.user.id);

  // Pull all referees (one query) + their match counts (one extra query).
  const referees = await db
    .select({
      id: users.id,
      name: users.displayName,
      handle: users.handle,
      rawName: users.name,
      createdAt: users.createdAt,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
    })
    .from(users)
    .where(eq(users.referredByUserId, session.user.id))
    .orderBy(desc(users.createdAt))
    .limit(100);

  const refereeIds = referees.map((r) => r.id);
  const matchCountByReferee = new Map<string, number>();
  if (refereeIds.length > 0) {
    const rows = await db
      .select({
        userId: matchPlayers.userId,
        n: sql<number>`count(distinct ${matches.id})::int`,
      })
      .from(matchPlayers)
      .innerJoin(matches, eq(matches.id, matchPlayers.matchId))
      .where(
        and(
          sql`${matchPlayers.userId} = ANY(${refereeIds})`,
          // Only count matches that actually started (not abandoned in lobby).
          sql`${matches.startedAt} IS NOT NULL`,
        ),
      )
      .groupBy(matchPlayers.userId);
    for (const r of rows) matchCountByReferee.set(r.userId, r.n);
  }

  // Ledger of credits already paid (per referee).
  const creditsByReferee = new Map<string, number>();
  if (refereeIds.length > 0) {
    const rows = await db
      .select({
        userId: referralRewards.refereeUserId,
        n: sql<number>`coalesce(sum(${referralRewards.referrerCredits}), 0)::int`,
      })
      .from(referralRewards)
      .where(
        and(
          eq(referralRewards.referrerUserId, session.user.id),
          sql`${referralRewards.refereeUserId} = ANY(${refereeIds})`,
        ),
      )
      .groupBy(referralRewards.refereeUserId);
    for (const r of rows) creditsByReferee.set(r.userId, r.n);
  }

  const now = Date.now();
  const friends: ReferralFriend[] = referees.map((r) => {
    const matchesPlayed = matchCountByReferee.get(r.id) ?? 0;
    const isPremium =
      r.isPremium && (!r.premiumUntil || r.premiumUntil.getTime() > now);
    const earnedCredits = creditsByReferee.get(r.id) ?? 0;
    let tier: 1 | 2 | 3 = 1;
    if (isPremium) tier = 3;
    else if (matchesPlayed >= 10) tier = 2;
    return {
      userId: r.id,
      name: r.name ?? r.handle ?? r.rawName ?? "Player",
      joinedAt: r.createdAt,
      isPremium,
      matchesPlayed,
      earnedCredits,
      tier,
    };
  });

  // Milestone state: "active" means "at least one friend is making
  // progress toward this milestone but hasn't hit it yet"; "done" means
  // ≥1 friend has hit it; "idle" means no traction.
  const anyFirst = friends.some((f) => f.matchesPlayed >= 1);
  const anyTen = friends.some((f) => f.matchesPlayed >= 10);
  const anyPrem = friends.some((f) => f.isPremium);

  const milestones: ReferralState["milestones"] = [
    {
      id: "firstGame",
      state: anyFirst ? "done" : friends.length > 0 ? "active" : "idle",
      progress: friends.length > 0 ? 1 : 0,
    },
    {
      id: "tenGames",
      state: anyTen ? "done" : anyFirst ? "active" : "idle",
      progress: friends.length > 0
        ? Math.min(
            1,
            Math.max(0, ...friends.map((f) => f.matchesPlayed / 10)),
          )
        : 0,
    },
    {
      id: "premium",
      state: anyPrem ? "done" : friends.length > 0 ? "active" : "idle",
      progress: friends.length > 0 ? (anyPrem ? 1 : 0.2) : 0,
    },
  ];

  const totals = {
    friendsCount: friends.length,
    earnedCredits: Array.from(creditsByReferee.values()).reduce((a, b) => a + b, 0),
  };

  return { code, friends, totals, milestones };
}

/* ── Linking + settlement ──────────────────────────────────────────── */

export type ClaimCodeResult =
  | { ok: true; referrerName: string }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "invalid_code"
        | "already_referred"
        | "self_referral"
        | "unknown";
      message?: string;
    };

/**
 * Link the current user to a referrer by code. Used at signup time
 * (the signup form passes `?ref=CODE` through to this) and from a
 * future "I have a code" UI for users who joined organically.
 *
 * Idempotency: each user can be referred only once (`referredByUserId`
 * is set on first call and refused thereafter), and they can't refer
 * themselves.
 */
export async function claimReferralCode(
  rawCode: string,
): Promise<ClaimCodeResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, code: "invalid_code" };

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { referredByUserId: true, referralCode: true },
  });
  if (!me) return { ok: false, code: "unauthorized" };
  if (me.referredByUserId) return { ok: false, code: "already_referred" };

  const referrer = await db.query.users.findFirst({
    where: eq(users.referralCode, code),
    columns: { id: true, displayName: true, name: true, handle: true },
  });
  if (!referrer) return { ok: false, code: "invalid_code" };
  if (referrer.id === session.user.id) {
    return { ok: false, code: "self_referral" };
  }

  await db
    .update(users)
    .set({ referredByUserId: referrer.id, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  // Best effort settlement — give the new pair a chance to earn the
  // "first game" milestone immediately if the user already played.
  await settleReferralRewards(referrer.id).catch(() => {
    // ignore
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    referrerName:
      referrer.displayName ?? referrer.name ?? referrer.handle ?? "Player",
  };
}

/**
 * Scan all referees of `referrerUserId` and award any milestones they
 * have hit but for which we haven't logged a reward yet.
 *
 * Settlement is idempotent thanks to the unique index on
 * `(referee_user_id, milestone)` — a duplicate insert just no-ops at
 * the constraint level. We catch+swallow per-row insert failures so
 * a single duplicate doesn't abort the whole batch.
 */
export async function settleReferralRewards(
  referrerUserId: string,
): Promise<void> {
  // 1. Pull referees + their stats.
  const referees = await db
    .select({
      id: users.id,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
    })
    .from(users)
    .where(eq(users.referredByUserId, referrerUserId));
  if (referees.length === 0) return;

  const refereeIds = referees.map((r) => r.id);

  // Match count per referee (only started matches).
  const matchCountRows = await db
    .select({
      userId: matchPlayers.userId,
      n: sql<number>`count(distinct ${matches.id})::int`,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matches.id, matchPlayers.matchId))
    .where(
      and(
        sql`${matchPlayers.userId} = ANY(${refereeIds})`,
        sql`${matches.startedAt} IS NOT NULL`,
      ),
    )
    .groupBy(matchPlayers.userId);
  const matchCount = new Map(matchCountRows.map((r) => [r.userId, r.n]));

  // Already-awarded milestones (so we don't insert dupes).
  const awarded = await db
    .select({
      refereeUserId: referralRewards.refereeUserId,
      milestone: referralRewards.milestone,
    })
    .from(referralRewards)
    .where(
      and(
        eq(referralRewards.referrerUserId, referrerUserId),
        sql`${referralRewards.refereeUserId} = ANY(${refereeIds})`,
      ),
    );
  const awardedSet = new Set(
    awarded.map((a) => `${a.refereeUserId}::${a.milestone}`),
  );

  const now = Date.now();
  for (const ref of referees) {
    const matchesPlayed = matchCount.get(ref.id) ?? 0;
    const isPremium =
      ref.isPremium && (!ref.premiumUntil || ref.premiumUntil.getTime() > now);

    const checks: Array<{ milestone: MilestoneId; passed: boolean }> = [
      { milestone: "firstGame", passed: matchesPlayed >= 1 },
      { milestone: "tenGames", passed: matchesPlayed >= 10 },
      { milestone: "premium", passed: isPremium },
    ];

    for (const check of checks) {
      if (!check.passed) continue;
      const key = `${ref.id}::${check.milestone}`;
      if (awardedSet.has(key)) continue;

      const award = MILESTONE_AWARDS[check.milestone];
      try {
        // Single transactional UPDATE: insert ledger row + bump both
        // users' coins. If the unique index trips on the insert (race
        // with a concurrent settlement), we catch and skip — the
        // coins update only runs after the insert succeeds.
        await db.transaction(async (tx) => {
          await tx.insert(referralRewards).values({
            referrerUserId,
            refereeUserId: ref.id,
            milestone: check.milestone,
            referrerCredits: award.referrer,
            refereeCredits: award.referee,
          });
          await tx
            .update(users)
            .set({
              coins: sql`${users.coins} + ${award.referrer}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, referrerUserId));
          await tx
            .update(users)
            .set({
              coins: sql`${users.coins} + ${award.referee}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, ref.id));
        });
        awardedSet.add(key);
      } catch {
        // Race or constraint hit — ignore and move on.
      }
    }
  }
}

/* ── Anti-spam stat ────────────────────────────────────────────────── */

/**
 * Light helper used by the dashboard / debug — total unique referees
 * (premium-tier or not) attached to a user.
 */
export async function countMyReferees(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  const [row] = await db
    .select({ n: count() })
    .from(users)
    .where(
      and(eq(users.referredByUserId, session.user.id), ne(users.id, session.user.id)),
    );
  return row?.n ?? 0;
}
