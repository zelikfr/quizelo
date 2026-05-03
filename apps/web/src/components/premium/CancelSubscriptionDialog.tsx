"use client";

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
 * Premium until the end of the paid period, then it lapses. The
 * webhook (`customer.subscription.updated`) is what updates our DB.
 *
 * If the user changes their mind during the grace period, they can
 * re-subscribe via the normal "Activate" buttons (Stripe will detect
 * the existing customer and Stripe will reactivate).
 */
export function CancelSubscriptionDialog({
  open,
  premiumUntil,
  onClose,
}: CancelSubscriptionDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Reset state when reopening.
  useEffect(() => {
    if (!open) {
      setError(null);
      setDone(false);
    }
  }, [open]);

  // ESC / scroll lock.
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
        // Refresh so the SubscriptionCard pulls the updated row once
        // the webhook lands. Stripe usually fires the `updated` event
        // within ~1s, but we leave the modal up so the user gets a
        // visible "got it" state.
        router.refresh();
        return;
      }
      if (res.code === "no_subscription") {
        setError("Aucun abonnement actif à annuler.");
        return;
      }
      if (res.code === "no_customer") {
        setError("Aucun abonnement Stripe lié à ce compte.");
        return;
      }
      if (res.code === "not_configured") {
        setError("Annulation indisponible — réessaie plus tard.");
        return;
      }
      if (res.code === "unauthorized") {
        setError("Connecte-toi pour gérer ton abonnement.");
        return;
      }
      setError(res.message ?? "Une erreur est survenue.");
    });
  };

  if (!open) return null;

  const formattedUntil = premiumUntil
    ? premiumUntil.toLocaleDateString("fr-FR", {
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
            Annuler Premium
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md px-2 py-1 text-fg-2 transition hover:bg-white/[0.04] hover:text-fg-1"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <>
              <h2 className="font-display text-[20px] font-semibold text-white">
                Annulation enregistrée
              </h2>
              <p className="mt-2 text-sm text-fg-2">
                Tu gardes Premium{" "}
                {formattedUntil ? (
                  <>
                    jusqu&apos;au <strong className="text-fg-1">{formattedUntil}</strong>
                  </>
                ) : (
                  "jusqu'à la fin de la période en cours"
                )}
                . Aucun nouveau prélèvement ne sera fait.
              </p>
              <div className="mt-6 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Fermer
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-[20px] font-semibold text-white">
                Annuler ton abonnement ?
              </h2>
              <p className="mt-2 text-sm text-fg-2">
                Tu garderas Premium{" "}
                {formattedUntil ? (
                  <>
                    jusqu&apos;au <strong className="text-fg-1">{formattedUntil}</strong>
                  </>
                ) : (
                  "jusqu'à la fin de la période en cours"
                )}
                . Pas de remboursement, mais aucun nouveau prélèvement.
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
                  Garder Premium
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
                  {pending ? "Annulation…" : "Confirmer l'annulation"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
