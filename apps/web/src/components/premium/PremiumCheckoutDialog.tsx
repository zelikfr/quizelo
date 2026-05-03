"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  startPremiumCheckoutAction,
  type PremiumDuration,
} from "@/lib/stripe-actions";

/**
 * Lazy-loads the Stripe.js bundle exactly once per page load. Calling
 * `loadStripe` in the module body would block the bundle on the Stripe
 * script even on pages that never open the checkout — we only resolve
 * it the first time someone clicks "Activate Premium".
 */
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    return Promise.resolve(null);
  }
  stripePromise = loadStripe(key);
  return stripePromise;
}

interface PremiumCheckoutDialogProps {
  open: boolean;
  duration: PremiumDuration | null;
  onClose: () => void;
}

/**
 * Modal wrapping Stripe's Embedded Checkout — the user pays without
 * leaving Quizelo.
 *
 * Lifecycle:
 *   1. Open with a `duration` ("month" | "year")
 *   2. Server action creates a Checkout Session (`ui_mode=embedded`,
 *      `redirect_on_completion=never`) and returns its `client_secret`
 *   3. We hand that to `<EmbeddedCheckoutProvider>` which renders
 *      Stripe's UI inside the modal
 *   4. On `onComplete`, the webhook has been (or will be) called by
 *      Stripe — we close the modal and refresh the page so the
 *      session/UI picks up the new Premium status. There's a tiny
 *      window where the webhook hasn't fired yet; the user might see
 *      "free" for ~1s before reload settles. Acceptable for v1.
 */
export function PremiumCheckoutDialog({
  open,
  duration,
  onClose,
}: PremiumCheckoutDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Reset state every time the dialog (re-)opens for a fresh duration.
  // We re-create the Checkout Session so the user gets a clean slate
  // (Stripe sessions are single-use after completion).
  useEffect(() => {
    if (!open || !duration) {
      setClientSecret(null);
      setError(null);
      return;
    }
    setClientSecret(null);
    setError(null);
    startTransition(async () => {
      const res = await startPremiumCheckoutAction(duration);
      if (res.ok) {
        setClientSecret(res.clientSecret);
        return;
      }
      if (res.code === "not_configured") {
        setError("Paiement indisponible — réessaie plus tard.");
        return;
      }
      if (res.code === "unauthorized") {
        setError("Connecte-toi pour activer Premium.");
        return;
      }
      setError(res.message ?? "Une erreur est survenue.");
    });
  }, [open, duration]);

  // Body scroll lock + Escape to close.
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

  const options = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            onComplete: () => {
              // Close + refetch the session in the background. Webhook
              // will have updated the row already in 99% of cases; if
              // not, the user lands on /settings and a manual refresh
              // (or the next nav) picks it up.
              onClose();
              router.refresh();
            },
          }
        : undefined,
    [clientSecret, onClose, router],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => {
        // Backdrop click → close (only if the click is on the backdrop
        // itself, not bubbling up from inner content).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-surface-1 shadow-card-elev">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest3 text-fg-3">
            Quizelo · Premium
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-fg-2 transition hover:bg-white/[0.04] hover:text-fg-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {error ? (
            <div className="px-5 py-8 text-center text-sm text-danger">{error}</div>
          ) : !options ? (
            <div className="flex items-center justify-center py-12 text-sm text-fg-3">
              {pending ? "Chargement…" : "Initialisation…"}
            </div>
          ) : (
            <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </div>
    </div>
  );
}
