"use server";

import { auth } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { isStripeConfigured, stripe, stripePriceFor } from "@/lib/stripe";

export type PremiumDuration = "month" | "year";

export type CheckoutResult =
  | { ok: true; clientSecret: string }
  | {
      ok: false;
      code: "unauthorized" | "not_configured" | "unknown";
      message?: string;
    };

export type PortalResult =
  | { ok: true; url: string }
  | {
      ok: false;
      code: "unauthorized" | "no_customer" | "not_configured" | "unknown";
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
 * checkout creates a customer and persists the ID so renewals don't
 * spawn duplicates.
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
 * Step 1 of a paid Premium activation: create a Stripe **subscription**
 * Checkout session and return the redirect URL. The client navigates to
 * it; on payment success Stripe sends `checkout.session.completed`,
 * then on every renewal `invoice.payment_succeeded`. The webhook is
 * the single source of truth for `isPremium` / `premiumUntil`.
 *
 * `metadata.userId` is duplicated on `subscription_data.metadata` so
 * later subscription events (renewals, cancellations) can map back to
 * our user without re-fetching the original Checkout Session.
 */
export async function startPremiumCheckoutAction(
  duration: PremiumDuration,
): Promise<CheckoutResult> {
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
    const checkout = await stripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      ui_mode: "embedded",
      line_items: [{ price: stripePriceFor(duration), quantity: 1 }],
      metadata: { userId: session.user.id, duration },
      subscription_data: {
        metadata: { userId: session.user.id, duration },
      },
      // `redirect_on_completion: "never"` keeps the user inside Quizelo
      // — Stripe surfaces a "Payment received" state inside the iframe
      // and we close the modal client-side via `onComplete`. The
      // webhook is what flips `isPremium`, not this redirect.
      redirect_on_completion: "never",
      allow_promotion_codes: true,
    });
    if (!checkout.client_secret) {
      return { ok: false, code: "unknown", message: "No client_secret returned" };
    }
    return { ok: true, clientSecret: checkout.client_secret };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "Stripe checkout failed",
    };
  }
}

/**
 * Open the Stripe Customer Portal so the user can view receipts,
 * update their payment method, or cancel from Stripe's hosted UI.
 * Used by the "Manage" button when already Premium.
 */
export async function openCustomerPortalAction(): Promise<PortalResult> {
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

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  try {
    const portal = await stripe().billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });
    return { ok: true, url: portal.url };
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "Stripe portal failed",
    };
  }
}

/**
 * In-app cancel — flips `cancel_at_period_end` on the user's active
 * subscription so they keep access until the end of the paid period.
 *
 * No redirect, no Stripe Portal: we look up the active subscription by
 * customer id, mark it for cancellation, and let the
 * `customer.subscription.updated` webhook update our DB.
 *
 * To uncancel before the period ends, call this with `false` (not
 * exposed yet — add a "Resume subscription" CTA when needed).
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
    // Find the user's most recent non-canceled subscription. We don't
    // store `stripeSubscriptionId` yet, but the customer id is enough
    // to fetch it — small extra round-trip, no migration needed.
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

    // Optimistic DB write so the UI reflects the change immediately,
    // before the `customer.subscription.updated` webhook lands. The
    // webhook will idempotently apply the same state — no drift.
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
 * being billed at the next renewal. Same call shape.
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

    // Optimistic DB write — see cancelSubscriptionAction for rationale.
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
