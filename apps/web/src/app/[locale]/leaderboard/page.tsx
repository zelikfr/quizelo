import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Top3Cards } from "@/components/leaderboard/Top3Cards";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { fetchLeaderboard } from "@/lib/leaderboard-actions";
import { formatSeasonNumber, getCurrentSeason } from "@/lib/season";
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

  const { top, me } = await fetchLeaderboard(50);
  const season = getCurrentSeason();
  const seasonNumber = formatSeasonNumber(season.number);

  const top3 = top.slice(0, 3);
  const tableRows = top.slice(3);

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
                {t("season")} <span className="text-gold">{seasonNumber}</span>
              </h1>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-gradient-surface px-5 py-3.5 text-right">
              <div className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
                {t("seasonEnds")}
              </div>
              <div className="font-display font-mono text-[22px] font-bold text-gold">
                {season.daysLeft} {t("daysLeftShort")}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Top3Cards locale={loc} entries={top3} />
          </div>

          <LeaderboardTable locale={loc} rows={tableRows} me={me} />
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
              {t("season")} <span className="text-gold">{seasonNumber}</span>
            </h1>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] text-fg-3">{t("seasonEndsShort")}</div>
            <div className="font-display font-mono text-sm font-bold text-gold">
              {season.daysLeft}j
            </div>
          </div>
        </div>

        {/* Top 3 row — visual stair (2nd, 1st, 3rd). Padded with placeholders. */}
        <div className="flex items-end justify-around gap-2 px-3.5 py-5">
          {[top3[1] ?? null, top3[0] ?? null, top3[2] ?? null].map(
            (p, idx) => {
              const place = (idx === 0 ? 2 : idx === 1 ? 1 : 3) as 1 | 2 | 3;
              const color = PLACE_COLOR[place];
              if (!p) {
                return (
                  <div
                    key={`empty-${place}`}
                    className="flex flex-col items-center gap-1 opacity-40"
                  >
                    <div
                      className="rounded-full bg-white/[0.04]"
                      style={{
                        width: place === 1 ? 52 : 40,
                        height: place === 1 ? 52 : 40,
                      }}
                    />
                    <div
                      className="font-mono text-[10px] font-bold"
                      style={{ color }}
                    >
                      #{place}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={p.userId}
                  className="flex flex-col items-center gap-1"
                >
                  <QAAvatar
                    name={p.name}
                    seed={p.avatarId}
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
            },
          )}
        </div>

        {/* Mobile list (rows 4+ — first 4 of them) */}
        <div className="flex-1 overflow-hidden px-3.5">
          {tableRows.slice(0, 4).map((p) => {
            const isMe = me !== null && p.userId === me.userId;
            return (
              <div
                key={p.userId}
                className={cn(
                  "mb-1.5 flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
                  isMe
                    ? "border-violet/40 bg-violet/[0.08]"
                    : "border-white/[0.08] bg-white/[0.025]",
                )}
              >
                <span
                  className={cn(
                    "w-6 font-display font-mono text-[13px] font-bold",
                    isMe ? "text-gold" : "text-fg-3",
                  )}
                >
                  {p.rank}
                </span>
                <QAAvatar
                  name={p.name}
                  seed={p.avatarId}
                  size={28}
                  ring={isMe ? "#FFD166" : undefined}
                />
                <span className="flex-1 font-display text-xs font-semibold">
                  {isMe ? tCommon("you") : p.name}
                </span>
                <span className="font-display font-mono text-[13px] font-bold">
                  {p.elo}
                </span>
                <span
                  className={cn(
                    "w-7 text-right font-mono text-[10px]",
                    p.change24h > 0
                      ? "text-success"
                      : p.change24h < 0
                        ? "text-danger"
                        : "text-fg-3",
                  )}
                >
                  {p.change24h > 0 ? "+" : ""}
                  {p.change24h}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sticky my row — only when I'm not already in the visible top */}
        {me !== null &&
          !top.some((r) => r.userId === me.userId) && (
            <div
              className="flex items-center gap-2.5 border-t px-3.5 py-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(124,92,255,0.18), rgba(124,92,255,0.04))",
                borderTopColor: "rgba(124,92,255,0.4)",
              }}
            >
              <span className="font-display font-mono text-[13px] font-bold text-gold">
                #{me.rank}
              </span>
              <QAAvatar
                name={me.name}
                seed={me.avatarId}
                size={28}
                ring="#FFD166"
              />
              <span className="flex-1 font-display text-xs font-bold">
                {tCommon("you")}
              </span>
              <span className="font-display font-mono text-[13px] font-bold">
                {me.elo}
              </span>
              <span
                className={cn(
                  "w-7 text-right font-mono text-[10px]",
                  me.change24h > 0
                    ? "text-success"
                    : me.change24h < 0
                      ? "text-danger"
                      : "text-fg-3",
                )}
              >
                {me.change24h > 0 ? "+" : ""}
                {me.change24h}
              </span>
            </div>
          )}

        <HomeMobileBottomNav active="leaderboard" />
      </div>
    </main>
  );
}
