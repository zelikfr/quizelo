"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmailAction } from "@/lib/auth-actions";

interface ResendVerificationButtonProps {
  label: string;
  sentLabel: string;
}

/**
 * Inline button for the "Verify your email" banner. Calls
 * `resendVerificationEmailAction` and swaps to a "Sent ✓" state on
 * success. The button stays disabled afterwards to prevent abuse.
 */
export function ResendVerificationButton({
  label,
  sentLabel,
}: ResendVerificationButtonProps) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const onClick = () => {
    startTransition(async () => {
      const res = await resendVerificationEmailAction();
      if (res.ok) setSent(true);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending || sent}
      className="px-3 py-2 text-[11px] text-gold"
      style={{ borderColor: "rgba(255,209,102,0.4)" }}
    >
      {sent ? sentLabel : pending ? "…" : label}
    </Button>
  );
}
