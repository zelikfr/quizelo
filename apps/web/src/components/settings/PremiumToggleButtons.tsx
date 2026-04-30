"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activatePremiumAction,
  cancelPremiumAction,
  type PremiumDuration,
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
      const res = await activatePremiumAction(duration);
      if (!res.ok) {
        setError(res.message ?? "Une erreur est survenue.");
        return;
      }
      router.refresh();
    });
  };

  const cancel = () => {
    setError(null);
    startTransition(async () => {
      const res = await cancelPremiumAction();
      if (!res.ok) {
        setError(res.message ?? "Une erreur est survenue.");
        return;
      }
      router.refresh();
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
