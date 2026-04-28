import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { type BoostCard } from "@/lib/shop-data";
import { cn } from "@/lib/cn";

interface BoostCardCardProps {
  card: BoostCard;
  compact?: boolean;
}

const BEST_BG =
  "linear-gradient(180deg, rgba(255,209,102,0.10), rgba(11,15,26,0.6))";

export async function BoostCardCard({ card, compact = false }: BoostCardCardProps) {
  const t = await getTranslations("shop");
  const tCommon = await getTranslations("shop.boost");

  // Compose the localized name from the kind + count.
  const name =
    card.kind === "double-elo"
      ? tCommon("doubleElo", { count: card.count })
      : tCommon("shield", { count: card.count });

  const description =
    card.kind === "double-elo"
      ? tCommon("doubleEloDesc", { count: card.count })
      : tCommon("shieldDesc", { count: card.count });

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-gradient-surface p-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold"
          style={{
            background: `${card.tint}26`,
            border: `1px solid ${card.tint}66`,
            color: card.tint,
          }}
        >
          {card.icon}
        </div>
        <span className="flex-1 font-display text-[11px] font-medium text-fg-1">
          {name}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs font-bold text-gold">
          <span className="text-[10px]">◈</span>
          {card.price}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border p-3.5",
        card.best ? "border-gold/50" : "border-white/[0.08] bg-gradient-surface",
      )}
      style={{ background: card.best ? BEST_BG : undefined }}
    >
      {card.best && (
        <span
          className="absolute -top-2 left-3 rounded-[3px] bg-gold px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em] text-surface-0"
        >
          ★ {t("badges.top")}
        </span>
      )}

      <div
        className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-[10px] font-display text-base font-bold"
        style={{
          background: `${card.tint}26`,
          border: `1px solid ${card.tint}66`,
          color: card.tint,
        }}
      >
        {card.icon}
      </div>

      <div className="font-display text-[13px] font-semibold leading-[1.2] text-fg-1">
        {name}
      </div>
      <div className="mt-1 min-h-[32px] text-[11px] leading-[1.4] text-fg-3">
        {description}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.08] pt-2.5">
        <span className="flex items-center gap-1 font-mono text-[13px] font-bold text-gold">
          <span className="text-[11px]">◈</span>
          {card.price}
        </span>
        <Button variant="ghost" size="sm" className="px-2.5 py-1 text-[10px]">
          {t("buy")}
        </Button>
      </div>
    </div>
  );
}
