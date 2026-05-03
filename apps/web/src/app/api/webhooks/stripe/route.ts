import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { isStripeConfigured, stripe } from "@/lib/stripe";

/**
 * Stripe webhook receiver — single source of truth for `isPremium`
 * and `premiumUntil`. We verify the signature with
 * `STRIPE_WEBHOOK_SECRET`, then react to subscription lifecycle events:
 *
 *   - checkout.session.completed     → first-time activation. Pulls
 *                                      the just-created subscription
 *                                      and snapshots its state.
 *   - customer.subscription.created  → mostly redundant with the line
 *                                      above, but Stripe sometimes
 *                                      delivers it first; we handle
 *                                      both for safety.
 *   - customer.subscription.updated  → cancel-at-period-end toggle,
 *                                      plan change, etc.
 *   - customer.subscription.deleted  → final cancellation. Strips
 *                                      premium from the user.
 *   - invoice.payment_succeeded      → recurring renewal. Bumps
 *                                      `premiumUntil` to the new
 *                                      period end.
 *
 * In dev with `stripe listen`, all subscribed events are forwarded —
 * no extra config. In prod, configure these 5 in the Dashboard
 * webhook endpoint.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isStripeConfigured()) {
    return new Response("Stripe not configured", { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return new Response(
      `Invalid signature: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        // Stripe sends many event types; ignore everything else.
        break;
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    // 500 → Stripe retries the webhook with exponential backoff.
    return new Response(
      err instanceof Error ? err.message : "handler failed",
      { status: 500 },
    );
  }
}

// ─── Handlers ────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  // Only subscription-mode checkouts touch premium — we still get this
  // event for one-shot payments if anyone ever runs Checkout in
  // `payment` mode, which we now don't.
  if (session.mode !== "subscription") return;
  if (!session.subscription) return;

  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  const sub = await stripe().subscriptions.retrieve(subId);
  await applySubscription(sub);
}

async function handleSubscriptionEvent(sub: Stripe.Subscription): Promise<void> {
  // Refetch via the SDK so we always get the shape of our pinned API
  // version (`2025-01-27.acacia`), regardless of what version the
  // webhook endpoint was configured with on the dashboard. Stripe's
  // newer API versions moved `current_period_end` off the root, which
  // would otherwise crash `applySubscription` with an invalid date.
  const fresh = await stripe().subscriptions.retrieve(sub.id);
  await applySubscription(fresh);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  // Renewals fire `invoice.payment_succeeded` with the subscription
  // attached. We refetch to get the freshest `current_period_end`.
  if (!invoice.subscription) return;
  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;
  const sub = await stripe().subscriptions.retrieve(subId);
  await applySubscription(sub);
}

/**
 * Project a Stripe `Subscription` onto the user row.
 *
 * Status mapping:
 *   - active / trialing / past_due → premium ON, valid until period_end
 *     (past_due means Stripe is retrying; we keep access during retries
 *     so a card hiccup doesn't lock the player out mid-game).
 *   - canceled / unpaid / incomplete_expired → premium OFF.
 *   - incomplete → still waiting for first payment, leave user alone.
 *
 * Idempotent: re-applying the same subscription state produces the
 * same row, so Stripe replays cause no drift.
 */
async function applySubscription(sub: Stripe.Subscription): Promise<void> {
  const userId = sub.metadata?.userId;
  if (!userId) {
    // Subscription created outside our app (e.g. backfilled manually
    // in the dashboard) — ignore.
    return;
  }

  // `current_period_end` was at the subscription root in older API
  // versions (≤ 2025-01-27) and moved to `items.data[].current_period_end`
  // in newer ones. Try root first, fall back to items, default to "now"
  // so a malformed payload doesn't poison the row with NaN.
  const rawPeriodEnd =
    (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ??
    (sub.items?.data?.[0] as { current_period_end?: number } | undefined)
      ?.current_period_end ??
    Math.floor(Date.now() / 1000);
  const periodEnd = new Date(rawPeriodEnd * 1000);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let isPremium: boolean;
  let premiumUntil: Date | null;
  // Stripe sets this flag when the user cancels via portal/API while
  // the period is still paid; we surface it in the UI so the user
  // sees "scheduled for X" instead of a fresh "Cancel" button.
  const cancelAtPeriodEnd = !!sub.cancel_at_period_end;

  switch (sub.status) {
    case "active":
    case "trialing":
    case "past_due":
      isPremium = true;
      premiumUntil = periodEnd;
      break;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      isPremium = false;
      premiumUntil = null;
      break;
    case "incomplete":
    case "paused":
    default:
      // Don't touch state for transient/edge statuses; the next event
      // will resolve it.
      return;
  }

  await db
    .update(users)
    .set({
      isPremium,
      premiumUntil,
      // Once the subscription is fully terminal, clear the flag —
      // the user can re-subscribe and we don't want a stale "scheduled"
      // state to leak into the next cycle.
      premiumCancelAtPeriodEnd: isPremium ? cancelAtPeriodEnd : false,
      stripeCustomerId: customerId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
