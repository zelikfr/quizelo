import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QARankBadge } from "@/components/shared/QARankBadge";
import type { LeaderboardEntry } from "@/lib/leaderboard-actions";
import { cn } from "@/lib/cn";

interface LeaderboardTableProps {
  locale: Locale;
  rows: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

const COLS = "60px 1fr 120px 100px 80px";

/**
 * Visible viewport for the scrollable rows region. Sized to ten data
 * rows: each row is `py-3` (24px) + a 32px avatar + 1px separator,
 * giving ~57px each. Slight padding bump prevents the 10th row from
 * being cropped on hairline-DPR displays.
 */
const SCROLL_VIEWPORT_PX = 580;

export async function LeaderboardTable({
  locale,
  rows,
  me,
}: LeaderboardTableProps) {
  const t = await getTranslations("leaderboard.table");
  const tCommon = await getTranslations("common");

  // If the current user is already in the visible top, no need to repeat them
  // at the bottom — but we still highlight their row inline.
  const meInRows =
    me !== null && rows.some((r) => r.userId === me.userId);

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

      {/* Rows — scroll region capped to ten rows so the page stays
          stable as the leaderboard grows. The header above and the
          pinned "me" row below sit outside the scroll. */}
      {rows.length === 0 ? (
        <div className="px-[18px] py-10 text-center font-mono text-[11px] tracking-[0.15em] text-fg-3">
          {t("empty")}
        </div>
      ) : (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: `${SCROLL_VIEWPORT_PX}px` }}
        >
          {rows.map((p, i) => {
            const isMe = me !== null && p.userId === me.userId;
            return (
              <div
                key={p.userId}
                className={cn(
                  "grid items-center px-[18px] py-3",
                  i < rows.length - 1 && "border-b border-white/[0.08]",
                  isMe && "bg-violet/[0.06]",
                )}
                style={{ gridTemplateColumns: COLS }}
              >
                <div
                  className={cn(
                    "font-display font-mono text-sm font-bold",
                    isMe ? "text-gold" : "text-fg-2",
                  )}
                >
                  {p.rank}
                </div>
                <div className="flex items-center gap-2.5">
                  <QAAvatar
                    name={p.name}
                    seed={p.avatarId}
                    size={32}
                    ring={isMe ? "#FFD166" : undefined}
                  />
                  <span className="font-display text-sm font-semibold">
                    {isMe ? tCommon("you") : p.name}
                  </span>
                </div>
                <div className="font-display font-mono text-base font-bold">
                  {p.elo}
                </div>
                <ChangeCell change={p.change24h} />
                <div className="flex justify-end">
                  <QARankBadge elo={p.elo} locale={locale} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My row pinned at bottom — only when I'm not already in the visible page */}
      {me !== null && !meInRows && (
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
            #{me.rank}
          </div>
          <div className="flex items-center gap-2.5">
            <QAAvatar
              name={me.name}
              seed={me.avatarId}
              size={32}
              ring="#FFD166"
            />
            <span className="font-display text-sm font-bold">
              {tCommon("you")}
            </span>
          </div>
          <div className="font-display font-mono text-base font-bold">
            {me.elo}
          </div>
          <ChangeCell change={me.change24h} />
          <div className="flex justify-end">
            <QARankBadge elo={me.elo} locale={locale} />
          </div>
        </div>
      )}
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
