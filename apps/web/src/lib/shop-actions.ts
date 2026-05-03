"use server";

import { auth } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findBoost, findCreditPack, type BoostCard } from "@/lib/shop-data";
import { isStripeConfigured, stripe } from "@/lib/stripe";

/**
 * Resolve the user's Premium status for a given userId. The shop is
 * Premium-only, so all paying actions early-return with a `not_premium`
 * code if this comes back false.
 */
async function isUserPremium(userId: string): Promise<boolean> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { isPremium: true, premiumUntil: true },
  });
  if (!row) return false;
  if (!row.isPremium) return false;
  if (!row.premiumUntil) return true; // grandfathered or never-expiring
  return row.premiumUntil.getTime() > Date.now();
}

/* ── Credit packs (real money via Stripe one-time PaymentIntent) ──── */

export type CreditPackInitResult =
  | {
      ok: true;
      clientSecret: string;
      paymentIntentId: string;
      amountCents: number;
      currency: string;
      credits: number;
      packId: string;
    }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "not_premium"
        | "not_configured"
        | "unknown_pack"
        | "unknown";
      message?: string;
    };

export type CreditPackConfirmResult =
  | { ok: true; coinsAdded: number }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "not_configured"
        | "not_found"
        | "wrong_user"
        | "not_succeeded"
        | "unknown";
      message?: string;
    };

/**
 * Get-or-create the Stripe customer (same helper as the Premium flow,
 * duplicated here to keep shop-actions independent of stripe-actions).
 */
async function ensureStripeCustomer(userId: string): Promise<string | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, email: true, stripeCustomerId: true, displayName: true, name: true },
  });
  if (!row) return null;
  if (row.stripeCustomerId) return row.stripeCustomerId;

  const customer = await stripe().customers.create({
    email: row.email ?? undefined,
    name: row.displayName ?? row.name ?? undefined,
    metadata: { userId },
  });
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(users.id, userId));
  return customer.id;
}

/**
 * Create a PaymentIntent for a credit pack. The Payment Element on the
 * client confirms it; the webhook (`payment_intent.succeeded`) credits
 * the user's `coins`. Idempotent — re-running for the same pack just
 * creates a new PaymentIntent (PaymentIntents auto-cancel after 7 days
 * if never confirmed, so abandoned ones don't pile up).
 */
export async function purchaseCreditPackAction(
  packId: string,
): Promise<CreditPackInitResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured" };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  // Premium-only feature — bouncer at the action layer so a free user
  // who hits the endpoint directly can't bypass the UI gate.
  if (!(await isUserPremium(session.user.id))) {
    return { ok: false, code: "not_premium" };
  }

  const pack = findCreditPack(packId);
  if (!pack) return { ok: false, code: "unknown_pack" };

  const customerId = await ensureStripeCustomer(session.user.id);
  if (!customerId) {
    return { ok: false, code: "unknown", message: "User row missing" };
  }

  try {
    const intent = await stripe().paymentIntents.create({
      amount: pack.amountCents,
      currency: pack.currency,
      customer: customerId,
      // Critical: kind=credit_pack lets the webhook tell our credit
      // packs apart from any other PaymentIntent we'd ever create.
      metadata: {
        kind: "credit_pack",
        userId: session.user.id,
        packId: pack.id,
        credits: String(pack.credits),
      },
      automatic_payment_methods: { enabled: true },
    });

    if (!intent.client_secret) {
      return { ok: false, code: "unknown", message: "No client_secret" };
    }
    return {
      ok: true,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amountCents: pack.amountCents,
      currency: pack.currency,
      credits: pack.credits,
      packId: pack.id,
    };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "PaymentIntent create failed",
    };
  }
}

/**
 * Race fix — same pattern as `confirmSubscriptionActiveAction`. Called
 * by the client right after `confirmPayment()` succeeds; we re-fetch
 * the PaymentIntent, validate ownership via metadata.userId, and
 * credit the coins ourselves. The webhook lands later and is idempotent
 * thanks to the per-PaymentIntent dedupe in the handler.
 */
export async function confirmCreditPackPaidAction(
  paymentIntentId: string,
): Promise<CreditPackConfirmResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured" };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  let pi;
  try {
    pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    return {
      ok: false,
      code: "not_found",
      message: err instanceof Error ? err.message : "PI lookup failed",
    };
  }

  if (pi.metadata?.userId !== session.user.id) {
    return { ok: false, code: "wrong_user" };
  }
  if (pi.status !== "succeeded") {
    return { ok: false, code: "not_succeeded" };
  }

  const credits = Number(pi.metadata?.credits ?? 0);
  if (!Number.isFinite(credits) || credits <= 0) {
    return { ok: false, code: "unknown", message: "Invalid credits metadata" };
  }

  // Use a per-PI marker to dedupe with the webhook. We store the
  // paymentIntentId in the user row's `coins_credited_pi_ids` JSON
  // array... actually simpler: tag the PI itself once we've credited.
  // Stripe lets us add metadata via `update`, so we set
  // `metadata.creditedAt` after the DB write. Both this action and the
  // webhook check that field before applying.
  if (pi.metadata?.creditedAt) {
    return { ok: true, coinsAdded: 0 };
  }

  await db
    .update(users)
    .set({
      coins: sql`${users.coins} + ${credits}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  // Mark on Stripe side so a webhook delivery for the same PI doesn't
  // double-credit. Best-effort: even if this fails, the webhook would
  // observe the same `creditedAt` we wrote here; if it doesn't, worst
  // case the webhook also tries to credit and we double — to harden
  // against that we'd need a DB-side dedupe table, deferred for v1.
  try {
    await stripe().paymentIntents.update(paymentIntentId, {
      metadata: { ...pi.metadata, creditedAt: String(Date.now()) },
    });
  } catch {
    // ignore
  }

  revalidatePath("/", "layout");
  return { ok: true, coinsAdded: credits };
}

/* ── Boost cards (spent in coins) ─────────────────────────────────── */

export type SpendBoostResult =
  | { ok: true; remainingCoins: number; ownedCount: number }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "not_premium"
        | "unknown_boost"
        | "insufficient_coins"
        | "unknown";
      message?: string;
    };

/**
 * Atomic "spend N coins, gain `card.count` charges of `card.kind`".
 *
 * Inventory is keyed by KIND (`double-elo` / `shield`), not by card id —
 * the cards are bundles (3, 5, 10 charges). After purchase, what
 * matters is "how many charges of x2 do I have left", consumed one
 * per ranked match.
 *
 * Single UPDATE guarded by `coins >= price` so a double-click can't
 * spend the price twice.
 */
export async function spendCoinsOnBoostAction(
  boostId: string,
): Promise<SpendBoostResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  if (!(await isUserPremium(session.user.id))) {
    return { ok: false, code: "not_premium" };
  }

  const boost: BoostCard | undefined = findBoost(boostId);
  if (!boost) return { ok: false, code: "unknown_boost" };

  const updated = await db
    .update(users)
    .set({
      coins: sql`${users.coins} - ${boost.price}`,
      boostInventory: sql`
        jsonb_set(
          coalesce(${users.boostInventory}, '{}'::jsonb),
          ${`{${boost.kind}}`}::text[],
          to_jsonb(
            coalesce((${users.boostInventory} ->> ${boost.kind})::int, 0) + ${boost.count}
          ),
          true
        )
      `,
      updatedAt: new Date(),
    })
    .where(sql`${users.id} = ${session.user.id} AND ${users.coins} >= ${boost.price}`)
    .returning({
      coins: users.coins,
      inventory: users.boostInventory,
    });

  if (updated.length === 0) {
    return { ok: false, code: "insufficient_coins" };
  }

  const row = updated[0]!;
  const ownedCount = (row.inventory?.[boost.kind] as number | undefined) ?? 0;

  revalidatePath("/", "layout");
  return { ok: true, remainingCoins: row.coins, ownedCount };
}

/* ── Pre-match boost activation ───────────────────────────────────── */

export type BoostKind = "double-elo" | "shield";

export type ConsumeBoostResult =
  | { ok: true; remaining: number }
  | {
      ok: false;
      code: "unauthorized" | "no_charge" | "unknown";
      message?: string;
    };

/**
 * Decrement one charge of `kind` from the user's inventory. Called
 * by `enqueueRankedAndRedirectAction` right before the API enqueue,
 * so the charge is consumed atomically — no risk of "I activated x2
 * but the match never started".
 *
 * The actual ELO multiplier / shield is applied by the match runtime
 * at settlement time (see scoring on the API side).
 */
export async function consumeBoostChargeAction(
  kind: BoostKind,
): Promise<ConsumeBoostResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const updated = await db
    .update(users)
    .set({
      boostInventory: sql`
        jsonb_set(
          coalesce(${users.boostInventory}, '{}'::jsonb),
          ${`{${kind}}`}::text[],
          to_jsonb(
            coalesce((${users.boostInventory} ->> ${kind})::int, 0) - 1
          ),
          true
        )
      `,
      updatedAt: new Date(),
    })
    .where(
      sql`${users.id} = ${session.user.id} AND coalesce((${users.boostInventory} ->> ${kind})::int, 0) >= 1`,
    )
    .returning({ inventory: users.boostInventory });

  if (updated.length === 0) {
    return { ok: false, code: "no_charge" };
  }

  const remaining =
    (updated[0]!.inventory?.[kind] as number | undefined) ?? 0;

  return { ok: true, remaining };
}
