"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  openCustomerPortalAction,
  startPremiumCheckoutAction,
  type PremiumDuration,
} from "@/lib/stripe-actions";
import {
  activatePremiumAction,
  cancelPremiumAction,
} from "@/lib/user-actions";
import { Button } from "@/components/ui/button";

interface PremiumToggleButtonsProps {
  isPremium: boolean;
  /** Tone of the action labels (gold = activate, neutral = manage). */
  labels: {
    activateMonth: string;
    activateYear: string;
    cancel: string;
    extend: string;
  };
}

/**
 * Two activation buttons (1 month · 1 year) when free, plus an "extend"
 * shortcut + a danger "cancel" action when already Premium. No payment
 * is processed — the server action just flips the flag and bumps
 * `premiumUntil`.
 */
export function PremiumToggleButtons({
  isPremium,
  labels,
}: PremiumToggleButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activate = (duration: PremiumDuration) => {
    setError(null);
    startTransition(async () => {
      const checkout = await startPremiumCheckoutAction(duration);
      if (checkout.ok) {
        window.location.href = checkout.url;
        return;
      }
      // Dev fallback when Stripe isn't configured.
      if (checkout.code === "not_configured") {
        const dev = await activatePremiumAction(duration);
        if (!dev.ok) {
          setError(dev.message ?? "Une erreur est survenue.");
          return;
        }
        router.refresh();
        return;
      }
      setError(checkout.message ?? "Une erreur est survenue.");
    });
  };

  const cancel = () => {
    setError(null);
    startTransition(async () => {
      // Real flow: open Stripe Customer Portal so the user manages /
      // cancels from Stripe's hosted UI.
      const portal = await openCustomerPortalAction();
      if (portal.ok) {
        window.location.href = portal.url;
        return;
      }
      // No customer yet, or Stripe disabled → fall back to dev cancel.
      if (portal.code === "no_customer" || portal.code === "not_configured") {
        const dev = await cancelPremiumAction();
        if (!dev.ok) {
          setError(dev.message ?? "Une erreur est survenue.");
          return;
        }
        router.refresh();
        return;
      }
      setError(portal.message ?? "Une erreur est survenue.");
    });
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => activate("month")}
            disabled={pending}
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
            disabled={pending}
            className="px-3 py-2 text-[11px] text-gold"
            style={{ borderColor: "rgba(255,209,102,0.4)" }}
          >
            {labels.activateYear}
          </Button>
        </div>
        {error ? (
          <span className="font-mono text-[10px] text-danger">{error}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => activate("year")}
          disabled={pending}
          className="px-3 py-2 text-[11px] text-gold"
          style={{ borderColor: "rgba(255,209,102,0.4)" }}
        >
          {labels.extend}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancel}
          disabled={pending}
          className="px-3 py-2 text-[11px] text-danger"
          style={{ borderColor: "rgba(248,113,113,0.4)" }}
        >
          {labels.cancel}
        </Button>
      </div>
      {error ? (
        <span className="font-mono text-[10px] text-danger">{error}</span>
      ) : null}
    </div>
  );
}
