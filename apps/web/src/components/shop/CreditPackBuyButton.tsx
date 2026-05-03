"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditPackDialog } from "./CreditPackDialog";

interface CreditPackBuyButtonProps {
  packId: string;
  cta: string;
  /** Visual variant — primary for the highlighted plan, ghost otherwise. */
  variant?: "primary" | "ghost";
  /** Compact (mobile) → smaller chip. */
  compact?: boolean;
}

/**
 * Tiny client wrapper around the CTA on a credit pack card. Owns its
 * dialog open state so the rest of the card can stay a server
 * component.
 */
export function CreditPackBuyButton({
  packId,
  cta,
  variant = "ghost",
  compact = false,
}: CreditPackBuyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={compact ? "sm" : "full"}
        className={
          compact
            ? "px-3 py-2 text-[11px]"
            : "justify-center py-2.5 text-xs"
        }
        onClick={() => setOpen(true)}
      >
        {cta}
      </Button>

      <CreditPackDialog
        open={open}
        packId={open ? packId : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
