"use client";

import { useState, type ReactNode } from "react";
import { PaywallDialog } from "@/components/premium/Paywall";

interface PremiumCrownProps {
  /** Accessibility label for the crown trigger (e.g. "Premium"). */
  ariaLabel: string;
  closeLabel: string;
  /** Server-rendered paywall content. */
  children: ReactNode;
}

/**
 * Round gold crown button (mobile header) that opens the paywall dialog.
 */
export function PremiumCrown({
  ariaLabel,
  closeLabel,
  children,
}: PremiumCrownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-sm text-gold transition-colors duration-120 hover:bg-white/[0.08]"
      >
        ♔
      </button>

      <PaywallDialog
        open={open}
        onClose={() => setOpen(false)}
        closeLabel={closeLabel}
      >
        {children}
      </PaywallDialog>
    </>
  );
}
