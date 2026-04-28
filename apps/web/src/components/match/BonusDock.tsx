import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

interface Bonus {
  label: string;
  used?: boolean;
}

const BONUSES: readonly Bonus[] = [
  { label: "50/50" },
  { label: "↦"     },
  { label: "+15s", used: true },
  { label: "✦"     },
];

interface BonusDockProps {
  compact?: boolean;
}

export async function BonusDock({ compact = false }: BonusDockProps) {
  const t = await getTranslations("match.phase1");
  const remaining = BONUSES.filter((b) => !b.used).length;

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
        {BONUSES.map((b) => (
          <button
            key={b.label}
            type="button"
            disabled={b.used}
            className={cn(
              "rounded-md border px-3.5 py-2 font-display text-xs font-semibold transition-colors duration-120",
              compact && "flex-1 px-2 py-2 text-[11px]",
              b.used
                ? "cursor-not-allowed border-white/[0.08] bg-white/[0.02] text-fg-4 line-through"
                : "border-violet/35 bg-violet/[0.08] text-violet-light hover:bg-violet/[0.12]",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      {!compact && (
        <span className="ml-auto font-mono text-[11px] text-fg-3">
          {remaining}/{BONUSES.length}
        </span>
      )}
    </div>
  );
}
