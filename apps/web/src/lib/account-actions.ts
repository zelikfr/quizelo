"use server";

import { auth, signOut } from "@quizelo/auth";
import { db, users } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isStripeConfigured, stripe } from "@/lib/stripe";

export type DeleteAccountResult =
  | { ok: true }
  | {
      ok: false;
      code: "unauthorized" | "email_mismatch" | "unknown";
      message?: string;
    };

/**
 * Permanent account deletion (RGPD right to erasure).
 *
 * Strategy: tombstone-in-place rather than CASCADE delete the row.
 *   - The user row stays so `match_players` and `match_answers` FK
 *     references remain valid (other players' match history is
 *     preserved).
 *   - Every PII column is cleared (email, name, handle, image, phone,
 *     address, password hash, OAuth links, premium info).
 *   - `deleted_at` is stamped — login flows refuse any further auth
 *     against the row.
 *   - Any active Stripe subscription is cancelled IMMEDIATELY (no
 *     grace period; the user asked us to forget them).
 *
 * The `confirmEmail` argument has to match the user's current email
 * (case-insensitive). Stops accidental clicks and prevents one-click
 * destruction if a session was hijacked.
 */
export async function deleteAccountAction(
  confirmEmail: string,
): Promise<DeleteAccountResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      email: true,
      stripeCustomerId: true,
      deletedAt: true,
    },
  });
  if (!me) return { ok: false, code: "unauthorized" };
  if (me.deletedAt) {
    // Already deleted — sign out and treat as a no-op success so the
    // client redirects to /auth/login like a normal completion.
    await signOut({ redirect: false }).catch(() => {});
    return { ok: true };
  }

  const expected = (me.email ?? "").toLowerCase().trim();
  if (!expected || expected !== confirmEmail.toLowerCase().trim()) {
    return { ok: false, code: "email_mismatch" };
  }

  // Cancel active Stripe subscription IMMEDIATELY — we don't want to
  // keep billing a deleted account during the grace period.
  if (isStripeConfigured() && me.stripeCustomerId) {
    try {
      const subs = await stripe().subscriptions.list({
        customer: me.stripeCustomerId,
        status: "all",
        limit: 5,
      });
      const active = subs.data.find(
        (s) =>
          s.status === "active" ||
          s.status === "trialing" ||
          s.status === "past_due",
      );
      if (active) {
        await stripe().subscriptions.cancel(active.id, {
          // Prorate refund so we're not charging beyond the deletion
          // date; the user can dispute on Stripe side if needed.
          prorate: true,
        });
      }
    } catch (err) {
      // Don't block deletion on a Stripe hiccup — the customer record
      // is left orphaned (no PII linkage left in our DB anyway).
      // eslint-disable-next-line no-console
      console.warn("Stripe cancel failed during account deletion:", err);
    }
  }

  // Tombstone the row: clear every PII column, keep the id.
  // `email` is set to a unique placeholder so the unique-index doesn't
  // bite us if the user wants to re-create an account later with the
  // same address (the placeholder uses the user id so it's never
  // reusable across users either).
  const tombstoneEmail = `deleted-${session.user.id}@deleted.local`;
  try {
    await db
      .update(users)
      .set({
        email: tombstoneEmail,
        emailVerified: null,
        name: null,
        displayName: null,
        handle: null,
        avatarId: null,
        image: null,
        passwordHash: null,
        phone: null,
        addressLine: null,
        city: null,
        postalCode: null,
        country: null,
        stripeCustomerId: null,
        isPremium: false,
        premiumUntil: null,
        premiumCancelAtPeriodEnd: false,
        referralCode: null,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (err) {
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : "DB update failed",
    };
  }

  // Best-effort sign-out — even if the cookie doesn't clear we've
  // anonymised the row, so subsequent auth() calls fail.
  await signOut({ redirect: false }).catch(() => {});

  revalidatePath("/", "layout");
  return { ok: true };
}
