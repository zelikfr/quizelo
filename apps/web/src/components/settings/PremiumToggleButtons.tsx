"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  resumeSubscriptionAction,
  type PremiumDuration,
} from "@/lib/stripe-actions";
import { Button } from "@/components/ui/button";
import { CancelSubscriptionDialog } from "@/components/premium/CancelSubscriptionDialog";
import { PremiumCheckoutDialog } from "@/components/premium/PremiumCheckoutDialog";

interface PremiumToggleButtonsProps {
  isPremium: boolean;
  /** End of the current paid period — shown in the cancel dialog. */
  premiumUntil: Date | null;
  /** True if the user already scheduled a cancellation. Hides the
   *  cancel CTA and shows a "Resume" CTA in its place. */
  cancelAtPeriodEnd: boolean;
  /** Tone of the action labels (gold = activate, neutral = manage). */
  labels: {
    activateMonth: string;
    activateYear: string;
    cancel: string;
    extend: string;
  };
}

/**
 * Premium activation / management buttons on the /settings page.
 *
 * State machine for a Premium user:
 *   - default            → "Extend" + "Cancel" buttons
 *   - cancellation armed → "Resume subscription" button (the period
 *                          info is rendered by the parent card)
 *
 * Free user: two "activate" CTAs that open the embedded Checkout
 * dialog. Everything stays inside Quizelo — no Stripe-hosted UI.
 */
export function PremiumToggleButtons({
  isPremium,
  premiumUntil,
  cancelAtPeriodEnd,
  labels,
}: PremiumToggleButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDuration, setCheckoutDuration] = useState<PremiumDuration | null>(
    null,
  );
  const [cancelOpen, setCancelOpen] = useState(false);

  const activate = (duration: PremiumDuration) => {
    setError(null);
    setCheckoutDuration(duration);
    setCheckoutOpen(true);
  };

  const resume = () => {
    setError(null);
    startTransition(async () => {
      const res = await resumeSubscriptionAction();
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.code === "no_subscription") {
        setError("Aucune annulation en cours à reprendre.");
        return;
      }
      if (res.code === "no_customer") {
        setError("Aucun abonnement Stripe lié à ce compte.");
        return;
      }
      if (res.code === "not_configured") {
        setError("Reprise indisponible — réessaie plus tard.");
        return;
      }
      if (res.code === "unauthorized") {
        setError("Connecte-toi pour gérer ton abonnement.");
        return;
      }
      setError(res.message ?? "Une erreur est survenue.");
    });
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1.5">
        {!isPremium ? (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => activate("month")}
              className="px-3 py-2 text-[11px] text-gold"
              style={{ borderColor: "rgba(255,209,102,0.4)" }}
            >
              {labels.activateMonth}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => activate("year")}
              className="px-3 py-2 text-[11px] text-gold"
              style={{ borderColor: "rgba(255,209,102,0.4)" }}
            >
              {labels.activateYear}
            </Button>
          </div>
        ) : cancelAtPeriodEnd ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resume}
            disabled={pending}
            className="px-3 py-2 text-[11px] text-gold"
            style={{ borderColor: "rgba(255,209,102,0.4)" }}
          >
            {pending ? "…" : "Reprendre l'abonnement"}
          </Button>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => activate("year")}
              className="px-3 py-2 text-[11px] text-gold"
              style={{ borderColor: "rgba(255,209,102,0.4)" }}
            >
              {labels.extend}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCancelOpen(true)}
              className="px-3 py-2 text-[11px] text-danger"
              style={{ borderColor: "rgba(248,113,113,0.4)" }}
            >
              {labels.cancel}
            </Button>
          </div>
        )}
        {error ? (
          <span className="font-mono text-[10px] text-danger">{error}</span>
        ) : null}
      </div>

      <PremiumCheckoutDialog
        open={checkoutOpen}
        duration={checkoutDuration}
        onClose={() => setCheckoutOpen(false)}
      />

      <CancelSubscriptionDialog
        open={cancelOpen}
        premiumUntil={premiumUntil}
        onClose={() => setCancelOpen(false)}
      />
    </>
  );
}
