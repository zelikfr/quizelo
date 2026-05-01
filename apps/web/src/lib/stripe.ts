import "server-only";

import Stripe from "stripe";

/**
 * Lazy Stripe client. We only instantiate when first used so that dev
 * environments without a Stripe key (e.g. CI, design-only branches)
 * don't crash on import.
 *
 * Throws if STRIPE_SECRET_KEY is missing — server actions should call
 * `isStripeConfigured()` before reaching for `stripe()`.
 */
let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY missing — Stripe Checkout cannot run. Add it to .env.",
      );
    }
    cached = new Stripe(key, { apiVersion: "2025-01-27.acacia" });
  }
  return cached;
}

/**
 * Maps the user-facing duration to a Stripe Price ID. The actual
 * products + prices live in your Stripe dashboard; we just plug the IDs
 * into env vars so dev/staging/prod can target different prices without
 * code changes.
 */
export function stripePriceFor(duration: "month" | "year"): string {
  const id =
    duration === "month"
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_YEARLY;
  if (!id) {
    throw new Error(
      `Missing Stripe price for "${duration}" — set STRIPE_PRICE_${duration === "month" ? "MONTHLY" : "YEARLY"}.`,
    );
  }
  return id;
}
