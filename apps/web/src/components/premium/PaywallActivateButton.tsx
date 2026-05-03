"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { PaywallCloseContext } from "./Paywall";
import { PremiumCheckoutDialog } from "./PremiumCheckoutDialog";
import type { PremiumDuration } from "@/lib/stripe-actions";
import { cn } from "@/lib/cn";

interface PaywallActivateButtonProps {
  /** Monthly or yearly — passed straight through to Stripe. */
  duration: PremiumDuration;
  /** Visible label (e.g. translated "Get Premium"). */
  cta: string;
  /** Visual variant — gold for the highlighted plan, ghost otherwise. */
  variant?: "gold" | "ghost";
}

/**
 * The "Get Premium" CTA on a plan card.
 *
 * Opens the in-app Payment Element dialog. On successful payment we
 * also close the surrounding Paywall (via `PaywallCloseContext`) so
 * the user lands back on whatever page triggered the paywall, with
 * the freshly-applied Premium state.
 */
export function PaywallActivateButton({
  duration,
  cta,
  variant = "ghost",
}: PaywallActivateButtonProps) {
  const closePaywall = useContext(PaywallCloseContext);
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
        onSuccess={() => {
          // Close the payment dialog AND the outer paywall in one go,
          // so the user doesn't land back on the plan-selection screen
          // they just paid for.
          setOpen(false);
          closePaywall?.();
        }}
      />
    </>
  );
}
