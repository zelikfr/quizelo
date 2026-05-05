"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type Appearance,
  type Stripe,
  type StripeElementLocale,
} from "@stripe/stripe-js";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  confirmSubscriptionActiveAction,
  createSubscriptionAction,
  type PremiumDuration,
  type SubscriptionInitResult,
} from "@/lib/stripe-actions";
import { Button } from "@/components/ui/button";
import { ConsentCheckbox } from "@/components/legal/ConsentCheckbox";

/**
 * Lazy-loads the Stripe.js bundle exactly once per page load.
 */
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return Promise.resolve(null);
  stripePromise = loadStripe(key);
  return stripePromise;
}

/**
 * Map next-intl's locale code (`fr`, `en`, …) to Stripe's locale codes.
 * Stripe accepts `auto` and a curated list of region codes; falling
 * back to `auto` lets Stripe sniff the browser when we don't have a
 * direct match.
 */
function toStripeLocale(locale: string): StripeElementLocale {
  if (locale === "fr") return "fr";
  if (locale === "en") return "en";
  return "auto";
}

const APPEARANCE: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#7C5CFF",
    colorBackground: "#11162A",
    colorText: "#E6E8F2",
    colorDanger: "#FF4D6D",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSizeBase: "14px",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      backgroundColor: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    ".Input:focus": {
      border: "1px solid #7C5CFF",
      boxShadow: "0 0 0 1px rgba(124,92,255,0.4)",
    },
    ".Label": {
      color: "#9AA0BF",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
  },
};

interface PremiumCheckoutDialogProps {
  open: boolean;
  duration: PremiumDuration | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Quizelo-skinned subscription checkout. Stripe renders only the
 * Payment Element fields; the rest is our UI + copy, fully translated
 * via next-intl.
 */
export function PremiumCheckoutDialog({
  open,
  duration,
  onClose,
  onSuccess,
}: PremiumCheckoutDialogProps) {
  const t = useTranslations("premium.checkout");
  const locale = useLocale();
  const handleSuccess = onSuccess ?? onClose;

  const [pending, startTransition] = useTransition();
  const [init, setInit] = useState<SubscriptionInitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !duration) {
      setInit(null);
      setError(null);
      return;
    }
    setInit(null);
    setError(null);
    startTransition(async () => {
      const res = await createSubscriptionAction(duration);
      if (res.ok) {
        setInit(res);
        return;
      }
      if (res.code === "not_configured") {
        setError(t("errors.notConfigured"));
      } else if (res.code === "unauthorized") {
        setError(t("errors.unauthorized"));
      } else {
        setError(res.message ?? t("errors.generic"));
      }
    });
  }, [open, duration, t]);

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

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-surface-1 shadow-card-elev">
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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error ? (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : !init ? (
            <div className="flex items-center justify-center py-12 text-sm text-fg-3">
              {pending ? t("loading") : t("initializing")}
            </div>
          ) : (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret: init.clientSecret,
                appearance: APPEARANCE,
                locale: toStripeLocale(locale),
              }}
            >
              <CheckoutForm
                amountTotal={init.amountTotal}
                currency={init.currency}
                duration={init.duration}
                subscriptionId={init.subscriptionId}
                locale={locale}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────

interface CheckoutFormProps {
  amountTotal: number;
  currency: string;
  duration: PremiumDuration;
  subscriptionId: string;
  locale: string;
  onSuccess: () => void;
}

function CheckoutForm({
  amountTotal,
  currency,
  duration,
  subscriptionId,
  locale,
  onSuccess,
}: CheckoutFormProps) {
  const t = useTranslations("premium.checkout");
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Mandatory checkbox under L.221-28-13° — see ConsentCheckbox docs.
  const [consent, setConsent] = useState(false);

  const formattedAmount = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 2,
      }).format(amountTotal / 100),
    [amountTotal, currency, locale],
  );

  const planLabel = duration === "year" ? t("planYear") : t("planMonth");
  const periodHint =
    duration === "year" ? t("renewYearly") : t("renewMonthly");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!consent) {
      // Belt and braces: button is disabled when !consent, but if a
      // user submits via Enter on a focused field we still bail.
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings?premium=success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setFormError(error.message ?? t("errors.declined"));
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Sync DB before refresh — see confirmSubscriptionActiveAction.
      const confirm = await confirmSubscriptionActiveAction(subscriptionId);
      if (!confirm.ok) {
        // eslint-disable-next-line no-console
        console.warn("confirmSubscriptionActiveAction failed:", confirm);
      }
      router.refresh();
      onSuccess();
      return;
    }

    if (paymentIntent?.status === "processing") {
      setFormError(t("errors.processing"));
      setSubmitting(false);
      return;
    }

    setFormError(t("errors.incomplete"));
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-md border border-white/[0.08] bg-white/[0.02] px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-[15px] font-semibold text-fg-1">
            {planLabel}
          </span>
          <span className="font-display text-[18px] font-semibold text-gold">
            {formattedAmount}
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-fg-3">
          {periodHint}
        </p>
      </div>

      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
        }}
      />

      {formError ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {formError}
        </div>
      ) : null}

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        disabled={submitting}
      />

      <Button
        type="submit"
        variant="primary"
        size="full"
        className="justify-center py-3 text-xs"
        disabled={!stripe || !elements || submitting || !consent}
      >
        {submitting ? t("paying") : t("payCta", { amount: formattedAmount })}
      </Button>

      <p className="text-center font-mono text-[9px] uppercase tracking-widest text-fg-3">
        {t("secured")}
      </p>
    </form>
  );
}
