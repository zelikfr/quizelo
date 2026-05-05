"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { readConsent, writeConsent } from "@/lib/consent";

type Mode = "hidden" | "summary" | "customize";

/**
 * Cookie consent banner — RGPD/ePrivacy compliant.
 *
 *   - Shows on first visit (no stored consent) and after 13 months.
 *   - Equal-prominence "Accept all" + "Reject all" + "Customize"
 *     buttons (CNIL guideline: refusing must be as easy as accepting).
 *   - Customize panel exposes 2 toggleable categories: Analytics +
 *     Marketing. Essential is implicit and always on.
 *   - Listens to `quizelo:consent-change` so re-opening from the
 *     /settings or the cookie policy page works without a reload.
 *
 * We deliberately don't load any analytics/marketing scripts yet —
 * the toggles are wired so we can add them later behind the boolean
 * (`if (consent.analytics) loadPlausible()` etc.).
 */
export function CookieBanner() {
  const t = useTranslations("cookies");
  const [mode, setMode] = useState<Mode>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Read storage on mount + listen for external changes (re-open from
  // the policy page or /settings).
  useEffect(() => {
    const refresh = () => {
      const c = readConsent();
      if (!c) {
        setMode("summary");
        setAnalytics(false);
        setMarketing(false);
      } else {
        setMode("hidden");
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
      }
    };
    refresh();
    const onReopen = () => setMode("summary");
    const onChange = () => refresh();
    window.addEventListener("quizelo:consent-reopen", onReopen);
    window.addEventListener("quizelo:consent-change", onChange);
    return () => {
      window.removeEventListener("quizelo:consent-reopen", onReopen);
      window.removeEventListener("quizelo:consent-change", onChange);
    };
  }, []);

  const acceptAll = () => {
    writeConsent({ analytics: true, marketing: true });
    setMode("hidden");
  };
  const rejectAll = () => {
    writeConsent({ analytics: false, marketing: false });
    setMode("hidden");
  };
  const saveCustom = () => {
    writeConsent({ analytics, marketing });
    setMode("hidden");
  };

  if (mode === "hidden") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t("ariaLabel")}
        className="mx-auto w-full max-w-2xl rounded-lg border border-white/[0.10] bg-surface-2/95 p-4 shadow-card-elev backdrop-blur-md sm:p-5"
      >
        {mode === "summary" ? (
          <>
            <p className="text-[12px] leading-relaxed text-fg-1">
              {t("summary")}{" "}
              <Link
                href="/legal/cookies"
                className="text-violet-light underline-offset-2 hover:underline"
              >
                {t("learnMore")}
              </Link>
            </p>
            <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[11px]"
                onClick={() => setMode("customize")}
              >
                {t("customize")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[11px]"
                onClick={rejectAll}
              >
                {t("rejectAll")}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-[11px]"
                onClick={acceptAll}
              >
                {t("acceptAll")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[12px] leading-relaxed text-fg-1">
              {t("customizeIntro")}
            </p>
            <div className="mt-3 space-y-2">
              <CategoryRow
                title={t("essential.title")}
                description={t("essential.body")}
                checked
                disabled
              />
              <CategoryRow
                title={t("analytics.title")}
                description={t("analytics.body")}
                checked={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                title={t("marketing.title")}
                description={t("marketing.body")}
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[11px]"
                onClick={() => setMode("summary")}
              >
                {t("back")}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-[11px]"
                onClick={saveCustom}
              >
                {t("saveChoices")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface CategoryRowProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: CategoryRowProps) {
  return (
    <label
      className={`flex items-start gap-3 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 ${
        disabled ? "opacity-70" : "cursor-pointer hover:border-white/[0.12]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-violet"
      />
      <div className="flex-1">
        <div className="font-display text-[12px] font-semibold text-fg-1">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-fg-3">
          {description}
        </div>
      </div>
    </label>
  );
}
