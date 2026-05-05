"use client";

import { Button } from "@/components/ui/button";

interface ReopenConsentButtonProps {
  label: string;
}

/**
 * Tiny client wrapper that re-opens the cookie consent banner via a
 * window event the banner is listening to. Used on the cookie policy
 * page and on /settings so the user can change their mind at any time
 * (CNIL requires a way to withdraw consent as easily as it was given).
 */
export function ReopenConsentButton({ label }: ReopenConsentButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-[11px]"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("quizelo:consent-reopen"));
      }}
    >
      {label}
    </Button>
  );
}
