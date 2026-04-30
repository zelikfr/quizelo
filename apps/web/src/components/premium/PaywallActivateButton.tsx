"use client";

import { useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activatePremiumAction,
  type PremiumDuration,
} from "@/lib/user-actions";
import { Button } from "@/components/ui/button";
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
      const res = await activatePremiumAction(duration);
      if (!res.ok) {
        setError(res.message ?? "Une erreur est survenue.");
        return;
      }
      // Close the dialog first so the user immediately sees the home
      // page refresh into its premium state (no quota counter, no
      // upsell, premium crown badge).
      close?.();
      router.refresh();
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
