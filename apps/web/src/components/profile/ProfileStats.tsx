import { getTranslations } from "next-intl/server";
import { rankFromElo, rankLabel } from "@/lib/ranks";
import { PROFILE_ME } from "@/lib/profile-data";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface ProfileStatsProps {
  locale: Locale;
  compact?: boolean;
}

export async function ProfileStats({ locale, compact = false }: ProfileStatsProps) {
  const t = await getTranslations("profile.stats");

  const rank = rankFromElo(PROFILE_ME.elo);
  const tierLabel = rankLabel(rank, locale);
  const winRatePct = `${Math.round(PROFILE_ME.winRate * 100)}%`;
  const winsCount = Math.round(PROFILE_ME.winRate * PROFILE_ME.matches);

  const stats: readonly { label: string; value: string; sub: string; color?: string }[] = [
    {
      label: "ELO",
      value: String(PROFILE_ME.elo),
      sub: `${tierLabel} · ${PROFILE_ME.elo}/1599`,
      color: "#FFD166",
    },
    {
      label: t("matches"),
      value: String(PROFILE_ME.matches),
      sub: t("thisSeason"),
    },
    {
      label: t("winRate"),
      value: winRatePct,
      sub: `${winsCount} / ${PROFILE_ME.matches}`,
      color: "#4ADE80",
    },
    {
      label: t("avgRank"),
      value: PROFILE_ME.avgRank.toFixed(1),
      sub: t("outOf10"),
      color: "#A18BFF",
    },
  ];

  return (
    <div className={cn("grid gap-3.5", compact ? "grid-cols-2 gap-2" : "grid-cols-4")}>
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
