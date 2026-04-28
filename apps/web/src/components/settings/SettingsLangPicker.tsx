"use client";

import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface SettingsLangPickerProps {
  /** Compact (mobile) variant — shorter cards. */
  compact?: boolean;
}

const OPTIONS: readonly { code: Locale; label: string; sub: string }[] = [
  { code: "fr", label: "Français", sub: "France" },
  { code: "en", label: "English",  sub: "English" },
];

function PickerInner({ compact = false }: SettingsLangPickerProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-gradient-surface",
        compact ? "flex gap-1.5 p-2" : "flex gap-2 p-3.5",
      )}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => switchLocale(opt.code)}
            className={cn(
              "flex flex-1 cursor-pointer items-center gap-3 rounded-xl border text-left transition-colors duration-120",
              compact ? "justify-center gap-2 px-3 py-2.5" : "px-4 py-3.5",
              active
                ? "border-violet/50 bg-violet/[0.18] text-white"
                : "border-white/[0.08] bg-white/[0.02] text-fg-2 hover:text-fg-1",
              active && !compact && "[box-shadow:0_12px_30px_-14px_rgba(124,92,255,0.4)]",
            )}
          >
            {!compact && (
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.05] font-mono text-xs font-bold uppercase tracking-[0.05em]",
                  active ? "text-white" : "text-fg-3",
                )}
              >
                {opt.code}
              </span>
            )}
            {compact && (
              <span
                className={cn(
                  "font-mono text-[10px]",
                  active ? "text-violet-light" : "text-fg-3",
                )}
              >
                {opt.code.toUpperCase()}
              </span>
            )}
            <div className={compact ? "flex items-center gap-1.5" : "flex-1"}>
              <div
                className={cn(
                  "font-display font-semibold",
                  compact ? "text-xs" : "text-[13px]",
                )}
              >
                {opt.label}
              </div>
              {!compact && (
                <div className="mt-px font-mono text-[10px] text-fg-3">{opt.sub}</div>
              )}
            </div>
            {active && (
              <span aria-hidden className={cn("text-violet-light", compact ? "ml-auto text-xs" : "text-sm")}>
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsLangPicker(props: SettingsLangPickerProps) {
  return (
    <Suspense fallback={<div className="h-[72px] rounded-lg border border-white/[0.08] bg-gradient-surface opacity-40" />}>
      <PickerInner {...props} />
    </Suspense>
  );
}
