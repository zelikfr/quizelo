"use client";

import { useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  startPremiumCheckoutAction,
  type PremiumDuration,
} from "@/lib/stripe-actions";
import { activatePremiumAction } from "@/lib/user-actions";
import { PaywallCloseContext } from "./Paywall";
import { cn } from "@/lib/cn";

interface PaywallActivateButtonProps {
  /** Mensuel ou annuel — passe directement à `activatePremiumAction`. */
  duration: PremiumDuration;
  /** Visible label (e.g. translated "Get Premium"). */
  cta: string;
  /** Visual variant — gold for the highlighted plan, ghost otherwise. */
  variant?: "gold" | "ghost";
}

/**
 * The "Get Premium" CTA on a plan card. Calls the server action, refreshes
 * the page on success, and closes the paywall dialog if it lives inside
 * one (via `PaywallCloseContext`).
 */
export function PaywallActivateButton({
  duration,
  cta,
  variant = "ghost",
}: PaywallActivateButtonProps) {
  const router = useRouter();
  const close = useContext(PaywallCloseContext);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      // Real flow: redirect to Stripe Checkout. The webhook flips
      // `isPremium` after payment, then the user lands back on
      // /settings?premium=success.
      const checkout = await startPremiumCheckoutAction(duration);
      if (checkout.ok) {
        window.location.href = checkout.url;
        return;
      }
      // Dev-mode fallback: if Stripe isn't configured (e.g. local
      // testing without keys), fall back to the instant flag-flip so
      // the rest of the app stays usable.
      if (checkout.code === "not_configured") {
        const dev = await activatePremiumAction(duration);
        if (!dev.ok) {
          setError(dev.message ?? "Activation failed.");
          return;
        }
        close?.();
        router.refresh();
        return;
      }
      setError(checkout.message ?? "Une erreur est survenue.");
    });
  };

  return (
    <div className="mt-[18px] flex flex-col gap-1.5">
      <Button
        type="button"
        variant={variant}
        size="full"
        className={cn("justify-center py-3 text-xs")}
        onClick={onClick}
        disabled={pending}
      >
        {cta} {variant === "gold" && "▸"}
      </Button>
      {error ? (
        <span className="font-mono text-[10px] text-danger">{error}</span>
      ) : null}
    </div>
  );
}
