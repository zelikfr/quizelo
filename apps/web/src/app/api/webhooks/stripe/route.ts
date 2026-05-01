import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { isStripeConfigured, stripe } from "@/lib/stripe";

/**
 * Stripe webhook receiver — the **only** place that flips users to
 * Premium. We verify the signature with `STRIPE_WEBHOOK_SECRET`, then
 * react to the events we care about:
 *
 *   - checkout.session.completed → extend `premiumUntil` for the
 *     duration encoded in metadata.
 *
 * Future events to handle (left as TODO when subscriptions go live):
 *   - invoice.payment_succeeded   → recurring renewal
 *   - customer.subscription.deleted → premium expires now
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

  // Stripe needs the raw body for signature verification — Next's Web
  // Request stream gives us that via `.text()`.
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
      // Add subscription / invoice cases here once we move from
      // one-shot payments to recurring billing.
      default:
        // Ignore — Stripe sends many event types; we only need a few.
        break;
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    // Return 500 so Stripe retries the webhook.
    return new Response(
      err instanceof Error ? err.message : "handler failed",
      { status: 500 },
    );
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DURATION_MS: Record<string, number> = {
  month: 30 * DAY_MS,
  year: 365 * DAY_MS,
};

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  const duration = session.metadata?.duration;
  if (!userId || !duration || !DURATION_MS[duration]) {
    // Malformed metadata — log on Stripe side, ignore here.
    return;
  }

  // Extend from `premiumUntil` if still active, else from now. Idempotent
  // when Stripe replays the same event (the webhook may be redelivered).
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { isPremium: true, premiumUntil: true },
  });
  const now = Date.now();
  const startMs =
    row?.isPremium && row.premiumUntil && row.premiumUntil.getTime() > now
      ? row.premiumUntil.getTime()
      : now;
  const until = new Date(startMs + DURATION_MS[duration]);

  await db
    .update(users)
    .set({
      isPremium: true,
      premiumUntil: until,
      // Persist the customer id if Stripe set it on the session and we
      // didn't have it yet (rare, but defensive).
      ...(typeof session.customer === "string"
        ? { stripeCustomerId: session.customer }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
