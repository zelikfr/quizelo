"use server";

import { auth } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { isStripeConfigured, stripe, stripePriceFor } from "@/lib/stripe";

export type PremiumDuration = "month" | "year";

/**
 * Result of `createSubscriptionAction` — everything the client-side
 * Payment Element needs to mount and confirm the payment in-app.
 *
 * `clientSecret` is the SetupIntent / PaymentIntent secret on the
 * subscription's first invoice. The browser uses it with
 * `stripe.confirmPayment()` so the user pays without leaving Quizelo.
 */
export type SubscriptionInitResult =
  | {
      ok: true;
      clientSecret: string;
      subscriptionId: string;
      /** Total in the smallest currency unit (cents). */
      amountTotal: number;
      /** ISO 4217 code, e.g. "eur". */
      currency: string;
      duration: PremiumDuration;
    }
  | {
      ok: false;
      code: "unauthorized" | "not_configured" | "unknown";
      message?: string;
    };

export type CancelResult =
  | { ok: true; cancelAt: number | null }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "no_customer"
        | "no_subscription"
        | "not_configured"
        | "unknown";
      message?: string;
    };

/**
 * Get-or-create the Stripe customer for the current user. The first
 * subscription creates a customer and persists the ID so renewals
 * don't spawn duplicates.
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
 * Create a Stripe Subscription in `incomplete` status and return the
 * `client_secret` of its first invoice's PaymentIntent.
 *
 * The client renders Stripe's Payment Element bound to that secret;
 * `stripe.confirmPayment()` then charges the customer in-app. The
 * subscription auto-flips to `active` once payment succeeds, and our
 * webhook propagates `isPremium` / `premiumUntil` to the DB.
 *
 * Why `default_incomplete` + `save_default_payment_method`?
 *   - Stripe doesn't pre-charge — we control the moment via the client.
 *   - Card is saved on the customer so future renewals don't ask
 *     again.
 *   - 3DS / SCA flows happen automatically inside Payment Element.
 *
 * If the user closes the dialog without paying, the subscription
 * stays `incomplete` and Stripe auto-cancels it after 23h.
 */
export async function createSubscriptionAction(
  duration: PremiumDuration,
): Promise<SubscriptionInitResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured" };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const customerId = await ensureStripeCustomer(session.user.id);
  if (!customerId) {
    return { ok: false, code: "unknown", message: "User row missing" };
  }

  try {
    const sub = await stripe().subscriptions.create({
      customer: customerId,
      items: [{ price: stripePriceFor(duration) }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        // Restrict to card for now. Add 'sepa_debit', 'apple_pay',
        // 'google_pay', etc. when you're ready — Payment Element
        // surfaces them automatically once enabled here.
        payment_method_types: ["card"],
      },
      // We need the PaymentIntent expanded so we can return its
      // client_secret to the browser without a second round-trip.
      expand: ["latest_invoice.payment_intent"],
      metadata: { userId: session.user.id, duration },
    });

    type ExpandedInvoice = Stripe.Invoice & {
      payment_intent?: Stripe.PaymentIntent | string | null;
    };
    const invoice = sub.latest_invoice as ExpandedInvoice | null;
    const pi =
      invoice && typeof invoice.payment_intent === "object"
        ? invoice.payment_intent
        : null;
    if (!invoice || !pi?.client_secret) {
      return {
        ok: false,
        code: "unknown",
        message: "Subscription created without payment intent",
      };
    }

    return {
      ok: true,
      clientSecret: pi.client_secret,
      subscriptionId: sub.id,
      amountTotal: invoice.amount_due,
      currency: invoice.currency,
      duration,
    };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message:
        err instanceof Error ? err.message : "Subscription creation failed",
    };
  }
}

export type ConfirmResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "not_configured"
        | "not_found"
        | "wrong_user"
        | "not_active"
        | "unknown";
      message?: string;
    };

/**
 * Called by the client immediately after `confirmPayment()` succeeds.
 *
 * Stripe charges the customer synchronously, but the
 * `customer.subscription.updated` webhook that flips the DB flag is
 * async — there's a 1–2s window where `isPremium` is still false in
 * Postgres even though the user has paid. If the user clicks "Jouer"
 * during that window, the paywall reappears.
 *
 * This action closes the gap: we re-fetch the subscription from
 * Stripe, validate it really belongs to the current user, and write
 * the row ourselves. The webhook lands later and re-applies the same
 * state — idempotent, no drift.
 */
export async function confirmSubscriptionActiveAction(
  subscriptionId: string,
): Promise<ConfirmResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured" };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  let sub: Stripe.Subscription;
  try {
    sub = await stripe().subscriptions.retrieve(subscriptionId);
  } catch (err) {
    return {
      ok: false,
      code: "not_found",
      message:
        err instanceof Error ? err.message : "Subscription lookup failed",
    };
  }

  // Defensive: refuse to upgrade a different user's account if
  // someone tampers with the client-side subscriptionId.
  if (sub.metadata?.userId !== session.user.id) {
    return { ok: false, code: "wrong_user" };
  }

  // The PaymentIntent might be `succeeded` while the subscription is
  // still flipping from `incomplete` to `active`. Trust either signal:
  // if Stripe says we're paid, we mark premium.
  const isPaid =
    sub.status === "active" ||
    sub.status === "trialing" ||
    sub.status === "past_due";
  if (!isPaid) {
    return { ok: false, code: "not_active" };
  }

  const rawPeriodEnd =
    (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ??
    (sub.items?.data?.[0] as { current_period_end?: number } | undefined)
      ?.current_period_end ??
    Math.floor(Date.now() / 1000);
  const periodEnd = new Date(rawPeriodEnd * 1000);
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  await db
    .update(users)
    .set({
      isPremium: true,
      premiumUntil: periodEnd,
      premiumCancelAtPeriodEnd: !!sub.cancel_at_period_end,
      stripeCustomerId: customerId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return { ok: true };
}

/**
 * In-app cancel — flips `cancel_at_period_end` on the user's active
 * subscription so they keep access until the end of the paid period.
 *
 * Optimistic DB write so the UI reflects the change immediately,
 * before the `customer.subscription.updated` webhook lands. The
 * webhook will idempotently apply the same state — no drift.
 */
export async function cancelSubscriptionAction(): Promise<CancelResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured" };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { stripeCustomerId: true },
  });
  if (!row?.stripeCustomerId) {
    return { ok: false, code: "no_customer" };
  }

  try {
    const list = await stripe().subscriptions.list({
      customer: row.stripeCustomerId,
      status: "all",
      limit: 5,
    });
    const active = list.data.find(
      (s) =>
        s.status === "active" ||
        s.status === "trialing" ||
        s.status === "past_due",
    );
    if (!active) {
      return { ok: false, code: "no_subscription" };
    }

    const updated = await stripe().subscriptions.update(active.id, {
      cancel_at_period_end: true,
    });

    await db
      .update(users)
      .set({
        premiumCancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { ok: true, cancelAt: updated.cancel_at };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "Stripe cancel failed",
    };
  }
}

/**
 * Reverse of `cancelSubscriptionAction` — clears
 * `cancel_at_period_end` on the active subscription so the user keeps
 * being billed at the next renewal.
 */
export async function resumeSubscriptionAction(): Promise<CancelResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured" };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { stripeCustomerId: true },
  });
  if (!row?.stripeCustomerId) {
    return { ok: false, code: "no_customer" };
  }

  try {
    const list = await stripe().subscriptions.list({
      customer: row.stripeCustomerId,
      status: "all",
      limit: 5,
    });
    const scheduled = list.data.find(
      (s) =>
        (s.status === "active" ||
          s.status === "trialing" ||
          s.status === "past_due") &&
        s.cancel_at_period_end,
    );
    if (!scheduled) {
      return { ok: false, code: "no_subscription" };
    }

    await stripe().subscriptions.update(scheduled.id, {
      cancel_at_period_end: false,
    });

    await db
      .update(users)
      .set({
        premiumCancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { ok: true, cancelAt: null };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "Stripe resume failed",
    };
  }
}
