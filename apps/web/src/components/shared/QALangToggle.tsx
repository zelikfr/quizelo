"use client";

import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface QALangToggleProps {
  className?: string;
}

const LOCALES: readonly Locale[] = ["fr", "en"] as const;

const TOGGLE_BASE =
  "inline-flex rounded-pill border border-white/[0.08] bg-surface-1/85 p-0.5 font-mono text-[10px] font-semibold backdrop-blur-md";

const PILL_BASE =
  "rounded-pill border-0 px-2.5 py-1 uppercase transition-all duration-120 cursor-pointer";

/** The hooks below need a Suspense boundary inside `[locale]` routes. */
function ToggleInner({ className }: QALangToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className={cn(TOGGLE_BASE, className)}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          className={cn(
            PILL_BASE,
            l === locale
              ? "bg-violet text-white"
              : "bg-transparent text-fg-3 hover:text-fg-2",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function QALangToggle({ className }: QALangToggleProps) {
  return (
    <Suspense
      fallback={
        <div className={cn(TOGGLE_BASE, "pointer-events-none opacity-40", className)}>
          {LOCALES.map((l) => (
            <span key={l} className={cn(PILL_BASE, "bg-transparent text-fg-3")}>
              {l}
            </span>
          ))}
        </div>
      }
    >
      <ToggleInner className={className} />
    </Suspense>
  );
}
