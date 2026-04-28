"use client";

import type { BonusInventory, BonusKind } from "@quizelo/protocol";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

interface LiveBonusDockProps {
  bonuses: BonusInventory;
  /** Click handler — undefined disables all bonuses. */
  onUse?: (bonus: BonusKind) => void;
  /** Compact variant pinned to the bottom of mobile. */
  compact?: boolean;
}

const ORDER: BonusKind[] = ["fifty_fifty", "skip", "shield"];

const GLYPHS: Record<BonusKind, string> = {
  fifty_fifty: "50/50",
  skip: "↦",
  shield: "✦",
};

export function LiveBonusDock({ bonuses, onUse, compact = false }: LiveBonusDockProps) {
  const t = useTranslations("match.live");
  const remaining = ORDER.reduce((sum, b) => sum + (bonuses[b] > 0 ? 1 : 0), 0);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact && "border-t border-white/[0.08] bg-black/30 px-[18px] py-3",
      )}
    >
      {!compact && (
        <span className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
          {t("bonuses")}
        </span>
      )}

      <div className={cn("flex gap-1.5", compact ? "flex-1" : "")}>
        {ORDER.map((b) => {
          const count = bonuses[b];
          const used = count <= 0;
          const usable = !used && !!onUse;
          return (
            <button
              key={b}
              type="button"
              onClick={
                usable
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUse(b);
                    }
                  : undefined
              }
              disabled={!usable}
              aria-label={t(`bonus.${b}`)}
              title={t(`bonus.${b}`)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 font-display text-xs font-semibold transition-colors duration-120",
                compact && "flex-1 justify-center px-2 py-2 text-[11px]",
                used
                  ? "cursor-not-allowed border-white/[0.08] bg-white/[0.02] text-fg-4 line-through"
                  : usable
                    ? "cursor-pointer border-violet/35 bg-violet/[0.08] text-violet-light hover:bg-violet/[0.12]"
                    : "cursor-default border-white/[0.08] bg-white/[0.02] text-fg-3",
              )}
            >
              <span>{GLYPHS[b]}</span>
              <span className="font-mono text-[10px] tabular-nums opacity-70">×{count}</span>
            </button>
          );
        })}
      </div>

      {!compact && (
        <span className="ml-auto font-mono text-[11px] text-fg-3">
          {remaining}/{ORDER.length}
        </span>
      )}
    </div>
  );
}
