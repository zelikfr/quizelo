"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { spendCoinsOnBoostAction } from "@/lib/shop-actions";

interface BoostBuyButtonProps {
  boostId: string;
  /** Buy CTA label (e.g. "Acheter"). */
  cta: string;
  /** Mobile-compact (small chip) variant. */
  compact?: boolean;
}

/**
 * Atomic "spend N coins, gain 1 card" CTA. Shows "✓ Acheté" for ~2 s
 * after a successful purchase so the user feels the action landed,
 * then resets. Errors (insufficient coins, etc.) replace the label
 * inline.
 */
export function BoostBuyButton({ boostId, cta, compact = false }: BoostBuyButtonProps) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    | { kind: "ok"; until: number }
    | { kind: "error"; message: string }
    | null
  >(null);

  const onClick = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await spendCoinsOnBoostAction(boostId);
      if (res.ok) {
        setFeedback({ kind: "ok", until: Date.now() + 2000 });
        router.refresh();
        // Reset after the success window so the button is reusable.
        setTimeout(() => {
          setFeedback((prev) =>
            prev?.kind === "ok" && prev.until <= Date.now() ? null : prev,
          );
        }, 2100);
        return;
      }
      if (res.code === "insufficient_coins") {
        setFeedback({ kind: "error", message: t("errors.insufficientCoins") });
      } else if (res.code === "not_premium") {
        setFeedback({ kind: "error", message: t("errors.notPremium") });
      } else if (res.code === "unauthorized") {
        setFeedback({ kind: "error", message: t("errors.unauthorized") });
      } else if (res.code === "unknown_boost") {
        setFeedback({ kind: "error", message: t("errors.unknownBoost") });
      } else {
        setFeedback({ kind: "error", message: res.message ?? t("errors.generic") });
      }
    });
  };

  const label =
    feedback?.kind === "ok"
      ? t("bought")
      : feedback?.kind === "error"
        ? feedback.message
        : pending
          ? "…"
          : cta;

  return (
    <Button
      type="button"
      variant={feedback?.kind === "ok" ? "primary" : "ghost"}
      size="sm"
      className={
        compact
          ? "px-2.5 py-1 text-[10px]"
          : "px-2.5 py-1 text-[10px]"
      }
      onClick={onClick}
      disabled={pending}
    >
      {label}
    </Button>
  );
}
