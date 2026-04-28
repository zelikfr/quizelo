import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QARankBadge } from "@/components/shared/QARankBadge";
import { LEADERS, MY_LEADERBOARD_ROW } from "@/lib/leaderboard-data";
import { cn } from "@/lib/cn";

interface LeaderboardTableProps {
  locale: Locale;
}

const COLS = "60px 1fr 120px 100px 80px";

export async function LeaderboardTable({ locale }: LeaderboardTableProps) {
  const t = await getTranslations("leaderboard.table");
  const tCommon = await getTranslations("common");

  // Skip the top 3 (shown as cards above) — render rows 4+.
  const rows = LEADERS.filter((l) => l.rank > 3);

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
      {/* Header */}
      <div
        className="grid border-b border-white/[0.08] bg-black/30 px-[18px] py-3"
        style={{ gridTemplateColumns: COLS }}
      >
        <ColLabel>{t("rank")}</ColLabel>
        <ColLabel>{t("player")}</ColLabel>
        <ColLabel>ELO</ColLabel>
        <ColLabel>{t("change24h")}</ColLabel>
        <ColLabel className="text-right">{t("tier")}</ColLabel>
      </div>

      {/* Rows */}
      {rows.map((p, i) => (
        <div
          key={p.name}
          className={cn(
            "grid items-center px-[18px] py-3",
            i < rows.length - 1 && "border-b border-white/[0.08]",
          )}
          style={{ gridTemplateColumns: COLS }}
        >
          <div className="font-display font-mono text-sm font-bold text-fg-2">
            {p.rank}
          </div>
          <div className="flex items-center gap-2.5">
            <QAAvatar name={p.name} seed={p.seed} size={32} />
            <span className="font-display text-sm font-semibold">{p.name}</span>
          </div>
          <div className="font-display font-mono text-base font-bold">{p.elo}</div>
          <ChangeCell change={p.change} />
          <div className="flex justify-end">
            <QARankBadge elo={p.elo} locale={locale} />
          </div>
        </div>
      ))}

      {/* My row — sticky highlight at bottom */}
      <div
        className="grid items-center border-t px-[18px] py-3.5"
        style={{
          gridTemplateColumns: COLS,
          background:
            "linear-gradient(90deg, rgba(124,92,255,0.18), rgba(124,92,255,0.04))",
          borderTopColor: "rgba(124,92,255,0.4)",
        }}
      >
        <div className="font-display font-mono text-base font-bold text-gold">
          #{MY_LEADERBOARD_ROW.rank}
        </div>
        <div className="flex items-center gap-2.5">
          <QAAvatar
            name={MY_LEADERBOARD_ROW.name}
            seed={MY_LEADERBOARD_ROW.seed}
            size={32}
            ring="#FFD166"
          />
          <span className="font-display text-sm font-bold">{tCommon("you")}</span>
        </div>
        <div className="font-display font-mono text-base font-bold">
          {MY_LEADERBOARD_ROW.elo}
        </div>
        <ChangeCell change={MY_LEADERBOARD_ROW.change} />
        <div className="flex justify-end">
          <QARankBadge elo={MY_LEADERBOARD_ROW.elo} locale={locale} />
        </div>
      </div>
    </div>
  );
}

function ColLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-[10px] tracking-[0.15em] text-fg-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ChangeCell({ change }: { change: number }) {
  const color =
    change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-fg-3";
  const sign = change > 0 ? "+" : "";
  return (
    <div className={cn("font-mono text-sm font-semibold", color)}>
      {sign}
      {change}
    </div>
  );
}
