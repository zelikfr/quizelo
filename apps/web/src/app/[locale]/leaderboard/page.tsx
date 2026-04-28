import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Top3Cards } from "@/components/leaderboard/Top3Cards";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { LEADERS, MY_LEADERBOARD_ROW } from "@/lib/leaderboard-data";
import { cn } from "@/lib/cn";

interface LeaderboardPageProps {
  params: Promise<{ locale: string }>;
}

const PLACE_COLOR = {
  1: "#FFD166",
  2: "#C9CFE0",
  3: "#B07A4A",
} as const;

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("leaderboard");
  const tCommon = await getTranslations("common");

  const top3 = LEADERS.slice(0, 3);
  const otherRows = LEADERS.filter((l) => l.rank > 3);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:flex-col md:min-h-screen">
        <HomeTopBar active="leaderboard" />

        <div className="px-14 py-8">
          {/* Header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-violet-light">
                ◆ {t("badge")}
              </p>
              <h1 className="mt-1 font-display text-[48px] font-bold tracking-[-0.03em]">
                {t("season")} <span className="text-gold">03</span>
              </h1>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-gradient-surface px-5 py-3.5 text-right">
              <div className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
                {t("seasonEnds")}
              </div>
              <div className="font-display font-mono text-[22px] font-bold text-gold">
                47 {t("daysLeftShort")}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Top3Cards locale={loc} />
          </div>

          <LeaderboardTable locale={loc} />
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-violet-light">
              ◆ {t("badge")}
            </p>
            <h1 className="mt-0.5 font-display text-[22px] font-bold">
              {t("season")} <span className="text-gold">03</span>
            </h1>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] text-fg-3">{t("seasonEndsShort")}</div>
            <div className="font-display font-mono text-sm font-bold text-gold">47j</div>
          </div>
        </div>

        {/* Top 3 row */}
        <div className="flex items-end justify-around gap-2 px-3.5 py-5">
          {[top3[1], top3[0], top3[2]].map((p, idx) => {
            const place = (idx === 0 ? 2 : idx === 1 ? 1 : 3) as 1 | 2 | 3;
            const color = PLACE_COLOR[place];
            return (
              <div key={p.name} className="flex flex-col items-center gap-1">
                <QAAvatar
                  name={p.name}
                  seed={p.seed}
                  size={place === 1 ? 52 : 40}
                  ring={color}
                />
                <div className="font-display text-xs font-bold">{p.name}</div>
                <div
                  className="font-mono text-[10px] font-bold"
                  style={{ color }}
                >
                  #{place} · {p.elo}
                </div>
              </div>
            );
          })}
        </div>

        {/* List rows 4+ */}
        <div className="flex-1 overflow-hidden px-3.5">
          {otherRows.slice(0, 4).map((p) => (
            <div
              key={p.name}
              className="mb-1.5 flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2.5"
            >
              <span className="w-6 font-display font-mono text-[13px] font-bold text-fg-3">
                {p.rank}
              </span>
              <QAAvatar name={p.name} seed={p.seed} size={28} />
              <span className="flex-1 font-display text-xs font-semibold">
                {p.name}
              </span>
              <span className="font-display font-mono text-[13px] font-bold">
                {p.elo}
              </span>
              <span
                className={cn(
                  "w-7 text-right font-mono text-[10px]",
                  p.change > 0
                    ? "text-success"
                    : p.change < 0
                      ? "text-danger"
                      : "text-fg-3",
                )}
              >
                {p.change > 0 ? "+" : ""}
                {p.change}
              </span>
            </div>
          ))}
        </div>

        {/* Sticky my row */}
        <div
          className="flex items-center gap-2.5 border-t px-3.5 py-3"
          style={{
            background:
              "linear-gradient(90deg, rgba(124,92,255,0.18), rgba(124,92,255,0.04))",
            borderTopColor: "rgba(124,92,255,0.4)",
          }}
        >
          <span className="font-display font-mono text-[13px] font-bold text-gold">
            #{MY_LEADERBOARD_ROW.rank}
          </span>
          <QAAvatar
            name={MY_LEADERBOARD_ROW.name}
            seed={MY_LEADERBOARD_ROW.seed}
            size={28}
            ring="#FFD166"
          />
          <span className="flex-1 font-display text-xs font-bold">
            {tCommon("you")}
          </span>
          <span className="font-display font-mono text-[13px] font-bold">
            {MY_LEADERBOARD_ROW.elo}
          </span>
          <span className="w-7 text-right font-mono text-[10px] text-success">
            +{MY_LEADERBOARD_ROW.change}
          </span>
        </div>

        <HomeMobileBottomNav active="leaderboard" />
      </div>
    </main>
  );
}
