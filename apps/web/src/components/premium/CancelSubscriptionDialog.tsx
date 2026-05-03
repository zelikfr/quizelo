"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscriptionAction } from "@/lib/stripe-actions";
import { Button } from "@/components/ui/button";

interface CancelSubscriptionDialogProps {
  open: boolean;
  /** Date the subscription is currently paid through (premiumUntil). */
  premiumUntil: Date | null;
  onClose: () => void;
}

/**
 * In-app cancel confirmation. We don't terminate the subscription
 * immediately — `cancel_at_period_end=true` means the user keeps
 * Premium until the end of the paid period, then it lapses.
 */
export function CancelSubscriptionDialog({
  open,
  premiumUntil,
  onClose,
}: CancelSubscriptionDialogProps) {
  const t = useTranslations("premium.cancelDialog");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setDone(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await cancelSubscriptionAction();
      if (res.ok) {
        setDone(true);
        router.refresh();
        return;
      }
      if (res.code === "no_subscription") {
        setError(t("errors.noSubscription"));
        return;
      }
      if (res.code === "no_customer") {
        setError(t("errors.noCustomer"));
        return;
      }
      if (res.code === "not_configured") {
        setError(t("errors.notConfigured"));
        return;
      }
      if (res.code === "unauthorized") {
        setError(t("errors.unauthorized"));
        return;
      }
      setError(res.message ?? t("errors.generic"));
    });
  };

  if (!open) return null;

  const formattedUntil = premiumUntil
    ? premiumUntil.toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-surface-1 shadow-card-elev">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest3 text-fg-3">
            {t("header")}
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t("closeAria")}
            className="rounded-md px-2 py-1 text-fg-2 transition hover:bg-white/[0.04] hover:text-fg-1"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <>
              <h2 className="font-display text-[20px] font-semibold text-white">
                {t("doneTitle")}
              </h2>
              <p className="mt-2 text-sm text-fg-2">
                {formattedUntil
                  ? t("doneBodyDated", { date: formattedUntil })
                  : t("doneBodyUndated")}
              </p>
              <div className="mt-6 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  {t("closeBtn")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-[20px] font-semibold text-white">
                {t("askTitle")}
              </h2>
              <p className="mt-2 text-sm text-fg-2">
                {formattedUntil
                  ? t("askBodyDated", { date: formattedUntil })
                  : t("askBodyUndated")}
              </p>

              {error && (
                <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                  {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={pending}
                >
                  {t("keep")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={confirm}
                  disabled={pending}
                  className="text-danger"
                  style={{ borderColor: "rgba(248,113,113,0.4)" }}
                >
                  {pending ? t("confirming") : t("confirm")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
