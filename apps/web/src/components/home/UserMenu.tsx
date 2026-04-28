"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { signOutAction } from "@/lib/auth-actions";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { cn } from "@/lib/cn";

const ITEMS = [
  { key: "profile",  href: "/profile",  glyph: "○" },
  { key: "referral", href: "/referral", glyph: "✦" },
  { key: "settings", href: "/settings", glyph: "⚙" },
] as const;

interface UserMenuProps {
  /** Display name shown to the user (handle / displayName). */
  name: string;
  /** Avatar seed (numeric) — falls back to a stable seed from the user id. */
  seed: number;
}

/**
 * Avatar trigger + dropdown menu (Profile / Referral / Settings + Sign out).
 * Closes on outside click, Escape, or item selection.
 */
export function UserMenu({ name, seed }: UserMenuProps) {
  const t = useTranslations("home.userMenu");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSignOut() {
    setOpen(false);
    startTransition(() => signOutAction());
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("ariaLabel")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "cursor-pointer rounded-full transition-shadow duration-120",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50",
          open && "[box-shadow:0_0_0_2px_rgba(124,92,255,0.5)]",
        )}
      >
        <QAAvatar name={name} seed={seed} size={32} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden",
            "rounded-lg border border-white/[0.08] bg-surface-2 py-1 shadow-card-elev",
            "backdrop-blur-md",
          )}
        >
          {ITEMS.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2.5 font-display text-[13px] font-medium text-fg-1",
                "no-underline transition-colors duration-120 hover:bg-white/[0.06]",
              )}
            >
              <span aria-hidden className="w-4 text-center text-sm text-fg-3">
                {it.glyph}
              </span>
              <span className="flex-1">{t(it.key)}</span>
            </Link>
          ))}

          {/* Separator */}
          <div className="my-1 h-px bg-white/[0.08]" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={pending}
            className={cn(
              "flex w-full items-center gap-2.5 px-3.5 py-2.5 font-display text-[13px] font-medium text-danger",
              "cursor-pointer border-0 bg-transparent text-left transition-colors duration-120 hover:bg-danger/[0.08]",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            <span aria-hidden className="w-4 text-center text-sm">
              ⏻
            </span>
            <span className="flex-1">{tCommon("signOut")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
