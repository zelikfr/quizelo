"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PremiumCheckoutDialog } from "./PremiumCheckoutDialog";
import type { PremiumDuration } from "@/lib/stripe-actions";
import { cn } from "@/lib/cn";

interface PaywallActivateButtonProps {
  /** Monthly or yearly — passed straight through to Stripe Checkout. */
  duration: PremiumDuration;
  /** Visible label (e.g. translated "Get Premium"). */
  cta: string;
  /** Visual variant — gold for the highlighted plan, ghost otherwise. */
  variant?: "gold" | "ghost";
}

/**
 * The "Get Premium" CTA on a plan card.
 *
 * Opens an in-app dialog with Stripe Embedded Checkout — the user pays
 * without leaving Quizelo. The webhook (`/api/webhooks/stripe`) is the
 * **only** thing that flips `isPremium`; this component just opens the
 * payment surface.
 */
export function PaywallActivateButton({
  duration,
  cta,
  variant = "ghost",
}: PaywallActivateButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-[18px] flex flex-col gap-1.5">
        <Button
          type="button"
          variant={variant}
          size="full"
          className={cn("justify-center py-3 text-xs")}
          onClick={() => setOpen(true)}
        >
          {cta} {variant === "gold" && "▸"}
        </Button>
      </div>

      <PremiumCheckoutDialog
        open={open}
        duration={open ? duration : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
