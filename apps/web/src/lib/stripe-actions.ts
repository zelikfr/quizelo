"use server";

import { auth } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { isStripeConfigured, stripe, stripePriceFor } from "@/lib/stripe";

export type PremiumDuration = "month" | "year";

export type CheckoutResult =
  | { ok: true; url: string }
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
 * Step 1 of a paid Premium activation: create a Stripe Checkout
 * session and return the redirect URL. The client navigates to it; on
 * payment success Stripe sends `checkout.session.completed` to our
 * webhook which is the only thing that ever flips `isPremium`.
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

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  try {
    const checkout = await stripe().checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: stripePriceFor(duration), quantity: 1 }],
      // We pass the duration via metadata so the webhook can extend
      // `premiumUntil` by the right amount (the Price object alone
      // doesn't tell us "monthly vs yearly" semantics).
      metadata: { userId: session.user.id, duration },
      payment_intent_data: {
        metadata: { userId: session.user.id, duration },
      },
      success_url: `${baseUrl}/settings?premium=success`,
      cancel_url: `${baseUrl}/settings?premium=cancel`,
      allow_promotion_codes: true,
    });
    if (!checkout.url) {
      return { ok: false, code: "unknown", message: "No checkout URL returned" };
    }
    return { ok: true, url: checkout.url };
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
