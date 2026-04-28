import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { type CreditPack } from "@/lib/shop-data";
import { cn } from "@/lib/cn";

interface CreditPackCardProps {
  pack: CreditPack;
  /** Mobile compact (horizontal) variant. */
  compact?: boolean;
}

const HIGHLIGHT_BG =
  "linear-gradient(180deg, rgba(124,92,255,0.18), rgba(124,92,255,0.04))";
const HIGHLIGHT_BG_MOBILE =
  "linear-gradient(90deg, rgba(124,92,255,0.18), rgba(124,92,255,0.04))";

function formatCredits(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(value);
}

export async function CreditPackCard({ pack, compact = false }: CreditPackCardProps) {
  const t = await getTranslations("shop");
  const locale = (await getLocale()) as Locale;
  const credits = formatCredits(pack.credits, locale);
  const badgeLabel = pack.badge ? t(`badges.${pack.badge}`) : null;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3",
          pack.highlighted ? "border-violet/40" : "border-white/[0.08] bg-gradient-surface",
        )}
        style={{ background: pack.highlighted ? HIGHLIGHT_BG_MOBILE : undefined }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg text-gold"
          style={{
            background: "rgba(255,209,102,0.15)",
            border: "1px solid rgba(255,209,102,0.3)",
          }}
        >
          ◈
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-fg-3">
              {pack.name}
            </span>
            {badgeLabel && (
              <span className="font-mono text-[8px] tracking-[0.12em] text-gold">
                {badgeLabel}
              </span>
            )}
          </div>
          <div className="font-display font-mono text-lg font-bold">{credits}</div>
        </div>
        <Button
          variant={pack.highlighted ? "primary" : "ghost"}
          size="sm"
          className="px-3 py-2 text-[11px]"
        >
          {pack.priceLabel}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border p-[18px]",
        pack.highlighted ? "border-violet/50" : "border-white/[0.08] bg-gradient-surface",
      )}
      style={{
        background: pack.highlighted ? HIGHLIGHT_BG : undefined,
        boxShadow: pack.highlighted ? "0 20px 50px -20px rgba(124,92,255,0.4)" : undefined,
      }}
    >
      {badgeLabel && (
        <span
          className="absolute -top-2.5 right-3 rounded-pill px-2 py-1 font-mono text-[9px] font-bold tracking-[0.15em] text-surface-0"
          style={{ background: "#FFD166" }}
        >
          {badgeLabel}
        </span>
      )}

      <div className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-fg-3">
        {pack.name}
      </div>

      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-lg text-gold">◈</span>
        <span className="font-display font-mono text-[30px] font-bold text-white">
          {credits}
        </span>
      </div>

      <div className="mt-0.5 font-mono text-[10px] text-fg-3">
        {pack.pricePerCredit} ¢ / {t("perCredit")}
      </div>

      <Button
        variant={pack.highlighted ? "primary" : "ghost"}
        size="full"
        className="mt-3.5 justify-center py-2.5 text-xs"
      >
        {pack.priceLabel}
      </Button>
    </div>
  );
}
