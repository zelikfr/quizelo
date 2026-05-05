"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction } from "@/lib/account-actions";
import { Button } from "@/components/ui/button";

interface DeleteAccountDialogProps {
  open: boolean;
  /** Email of the signed-in account, used for the confirmation match. */
  email: string | null;
  onClose: () => void;
}

/**
 * Two-step destructive confirmation:
 *   1. Read the warning, type the account email exactly, click confirm.
 *   2. Server tombstones the row, cancels Stripe sub, signs the user
 *      out → we redirect to /auth/login.
 *
 * Modal copy is intentionally heavy on irreversibility — RGPD-mandated
 * "right to erasure" is permanent and we don't keep a 30-day soft
 * delete window in this v1.
 */
export function DeleteAccountDialog({
  open,
  email,
  onClose,
}: DeleteAccountDialogProps) {
  const t = useTranslations("settings.danger.dialog");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      setConfirmEmail("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const expected = (email ?? "").toLowerCase().trim();
  const matches = confirmEmail.toLowerCase().trim() === expected && !!expected;

  const onConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteAccountAction(confirmEmail);
      if (res.ok) {
        // Server already cleared the cookie via signOut(). Hard-replace
        // the URL so any cached client state is dropped too.
        window.location.replace("/auth/login?deleted=1");
        return;
      }
      if (res.code === "email_mismatch") {
        setError(t("errors.emailMismatch"));
        return;
      }
      if (res.code === "unauthorized") {
        setError(t("errors.unauthorized"));
        return;
      }
      setError(res.message ?? t("errors.generic"));
    });
    // Suppress lint: router is unused here, kept for consistency.
    void router;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex w-full max-w-[460px] flex-col overflow-hidden rounded-lg border border-danger/40 bg-surface-1 shadow-card-elev">
        <div className="flex items-center justify-between border-b border-danger/30 bg-danger/[0.06] px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest3 text-danger">
            ⚠ {t("header")}
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

        <div className="space-y-4 px-6 py-6">
          <h2 className="font-display text-[20px] font-semibold text-white">
            {t("title")}
          </h2>
          <p className="text-sm leading-relaxed text-fg-2">{t("body")}</p>

          <ul className="ml-4 list-disc space-y-1 text-[12px] text-fg-3">
            <li>{t("bullets.session")}</li>
            <li>{t("bullets.subscription")}</li>
            <li>{t("bullets.history")}</li>
            <li>{t("bullets.irreversible")}</li>
          </ul>

          <div>
            <label
              htmlFor="confirm-email"
              className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-3"
            >
              {t("retypeLabel", { email: expected })}
            </label>
            <input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              autoComplete="off"
              className="w-full rounded-md border border-line bg-bg-2 px-3 py-2 font-mono text-sm text-fg-1 outline-none focus:border-danger"
              placeholder={expected || "you@example.com"}
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onConfirm}
              disabled={pending || !matches}
              className="text-danger"
              style={{ borderColor: "rgba(248,113,113,0.5)" }}
            >
              {pending ? t("deleting") : t("confirm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
