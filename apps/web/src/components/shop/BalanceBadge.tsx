import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/current-user";

interface BalanceBadgeProps {
  /** Mobile = bigger card with explicit "BALANCE" label. */
  variant?: "pill" | "card";
}

function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(value);
}

const CARD_BG =
  "linear-gradient(135deg, rgba(255,209,102,0.18), rgba(124,92,255,0.10))";

export async function BalanceBadge({ variant = "pill" }: BalanceBadgeProps) {
  const t = await getTranslations("shop");
  const locale = (await getLocale()) as Locale;
  // Real balance from the session — falls back to 0 for logged-out
  // viewers (the shop page is gated, but the component is reusable).
  const user = await getCurrentUser();
  const formatted = formatNumber(user?.coins ?? 0, locale);

  if (variant === "card") {
    return (
      <div
        className="flex items-center gap-3 rounded-[14px] border p-3.5"
        style={{ background: CARD_BG, borderColor: "rgba(255,209,102,0.4)" }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px] text-gold"
          style={{
            background: "rgba(255,209,102,0.2)",
            border: "1px solid rgba(255,209,102,0.5)",
          }}
        >
          ◈
        </div>
        <div className="flex-1">
          <div className="font-mono text-[9px] tracking-[0.18em] text-fg-3">
            {t("balanceLabel")}
          </div>
          <div className="font-display font-mono text-[22px] font-bold text-gold">
            {formatted}{" "}
            <span className="text-[10px] text-fg-3">{t("creditsLabel")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 rounded-pill px-3.5 py-2"
      style={{
        background: "rgba(255,209,102,0.10)",
        border: "1px solid rgba(255,209,102,0.4)",
      }}
    >
      <span aria-hidden className="text-sm text-gold">◈</span>
      <span className="font-mono text-sm font-bold text-gold">{formatted}</span>
      <span className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
        {t("creditsLabel")}
      </span>
    </div>
  );
}
