import { getTranslations } from "next-intl/server";
import { RANKS, rankFromElo, rankLabel } from "@/lib/ranks";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface ProfileStatsProps {
  locale: Locale;
  elo: number;
  totals: {
    matches: number;
    wins: number;
    winRate: number; // 0..1
    avgRank: number;
  };
  compact?: boolean;
}

/** Upper bound (inclusive) of the tier the given elo belongs to. */
function tierTop(elo: number): number | null {
  const idx = RANKS.findIndex((r, i) => {
    const next = RANKS[i + 1];
    return elo >= r.min && (!next || elo < next.min);
  });
  if (idx < 0) return null;
  const next = RANKS[idx + 1];
  return next ? next.min - 1 : null;
}

export async function ProfileStats({
  locale,
  elo,
  totals,
  compact = false,
}: ProfileStatsProps) {
  const t = await getTranslations("profile.stats");

  const rank = rankFromElo(elo);
  const tierLabel = rankLabel(rank, locale);
  const top = tierTop(elo);
  const eloSub = top != null ? `${tierLabel} · ${elo}/${top}` : `${tierLabel} · ${elo}`;

  const avgRank = totals.avgRank > 0 ? totals.avgRank.toFixed(1) : "—";

  const stats: ReadonlyArray<{
    label: string;
    value: string;
    sub: string;
    color?: string;
  }> = [
    {
      label: "ELO",
      value: String(elo),
      sub: eloSub,
      color: "#FFD166",
    },
    {
      label: t("matches"),
      value: String(totals.matches),
      sub: t("thisSeason"),
    },
    {
      label: t("avgRank"),
      value: avgRank,
      sub: t("outOf10"),
      color: "#A18BFF",
    },
  ];

  return (
    <div className={cn("grid gap-3.5", compact ? "grid-cols-3 gap-2" : "grid-cols-3")}>
      {stats.map((s) => (
        <div
          key={s.label}
          className={cn(
            "rounded-lg border border-white/[0.08] bg-gradient-surface",
            compact ? "p-3" : "p-[18px]",
          )}
        >
          <div
            className={cn(
              "font-mono tracking-[0.15em] text-fg-3",
              compact ? "text-[9px]" : "text-[10px]",
            )}
          >
            {s.label}
          </div>
          <div
            className={cn(
              "font-display font-mono font-bold",
              compact ? "text-[22px]" : "mt-1 text-[36px]",
            )}
            style={{ color: s.color ?? "#fff" }}
          >
            {s.value}
          </div>
          {!compact && (
            <div className="font-mono text-[11px] text-fg-3">{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
