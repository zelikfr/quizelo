import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

interface ResultStatsProps {
  compact?: boolean;
}

interface Stat {
  labelKey: string;
  value: string;
  /** Sub-line under the value (desktop only). */
  sub?: string;
  color?: string;
}

const STATS: readonly Stat[] = [
  { labelKey: "eloChange", value: "+12",  sub: "1487 → 1499", color: "#4ADE80" },
  { labelKey: "correct",   value: "14",   sub: "/ 18",                            },
  { labelKey: "avgReact",  value: "4.2s", sub: "Top 3",       color: "#FFD166" },
];

const STATS_COMPACT: readonly Stat[] = [
  { labelKey: "eloChange",      value: "+12",   color: "#4ADE80" },
  { labelKey: "correctShort",   value: "14/18"                    },
  { labelKey: "avgReactShort",  value: "4.2s",  color: "#FFD166" },
];

export async function ResultStats({ compact = false }: ResultStatsProps) {
  const t = await getTranslations("match.results.stats");
  const data = compact ? STATS_COMPACT : STATS;

  return (
    <div
      className={cn(
        "grid",
        compact ? "grid-cols-3 gap-2" : "grid-cols-3 gap-3.5",
      )}
    >
      {data.map((s) => (
        <div
          key={s.labelKey}
          className={cn(
            "rounded-lg border border-white/[0.08] bg-gradient-surface",
            compact ? "p-3" : "p-4",
          )}
        >
          <div
            className={cn(
              "font-mono tracking-[0.15em] text-fg-3",
              compact ? "text-[9px]" : "text-[10px]",
            )}
          >
            {t(s.labelKey)}
          </div>
          <div
            className={cn(
              "font-display font-mono font-bold",
              compact ? "text-[22px]" : "mt-1 text-[32px]",
            )}
            style={{ color: s.color ?? "#fff" }}
          >
            {s.value}
          </div>
          {!compact && s.sub && (
            <div className="font-mono text-[11px] text-fg-3">{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
