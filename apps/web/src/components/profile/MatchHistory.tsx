import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { RecentMatch } from "@/lib/profile-stats";
import { cn } from "@/lib/cn";

interface MatchHistoryProps {
  matches: ReadonlyArray<RecentMatch>;
  compact?: boolean;
}

const RANK_COLOR: Record<number, string> = {
  1: "#FFD166",
  2: "#C9CFE0",
  3: "#B07A4A",
};

/** 4–5: phase 2 elimination, 6–10: phase 1 elimination. */
function colorForRank(rank: number): string {
  if (rank in RANK_COLOR) return RANK_COLOR[rank as 1 | 2 | 3];
  if (rank <= 5) return "#A18BFF";
  return "#FF8B5C";
}

/** "Il y a 5 min" / "Il y a 2 h" / "Hier" / "12 mars" — locale-aware. */
function formatRelative(d: Date, locale: Locale): string {
  const now = Date.now();
  const diffMs = now - d.getTime();
  const minutes = Math.round(diffMs / 60_000);
  const hours = Math.round(diffMs / 3_600_000);
  const days = Math.round(diffMs / 86_400_000);

  const tag = locale === "en" ? "en-US" : "fr-FR";
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });

  if (minutes < 1) return locale === "en" ? "just now" : "à l'instant";
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (hours < 24) return rtf.format(-hours, "hour");
  if (days <= 6) return rtf.format(-days, "day");
  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
  }).format(d);
}

export async function MatchHistory({
  matches,
  compact = false,
}: MatchHistoryProps) {
  const t = await getTranslations("profile.history");
  const tLobby = await getTranslations("match.lobby");
  const locale = (await getLocale()) as Locale;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-gradient-surface",
        compact ? "p-3.5" : "p-[18px]",
      )}
    >
      <div
        className={cn(
          "mb-3 font-mono tracking-[0.15em] text-fg-3",
          compact ? "text-[9px]" : "text-[10px]",
        )}
      >
        {t("title")}
      </div>

      {matches.length === 0 ? (
        <div
          className={cn(
            "py-3 text-center font-mono text-fg-3",
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
          {t("empty")}
        </div>
      ) : (
        <ul className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
          {matches.map((m) => {
            const rankColor = colorForRank(m.finalRank);
            const isWin = m.finalRank === 1;
            const ranked = m.mode === "ranked";
            const eloPositive = ranked && m.eloDelta != null && m.eloDelta > 0;
            const eloNegative = ranked && m.eloDelta != null && m.eloDelta < 0;
            return (
              <li
                key={m.matchId}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.06] bg-surface-2/40",
                  compact ? "px-2.5 py-2" : "px-3 py-2.5",
                )}
              >
                {/* Rank badge */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded font-display font-bold tabular-nums",
                    compact
                      ? "h-7 w-7 text-[12px]"
                      : "h-9 w-9 text-[14px]",
                  )}
                  style={{
                    background: `${rankColor}1A`,
                    border: `1px solid ${rankColor}55`,
                    color: rankColor,
                  }}
                >
                  #{m.finalRank}
                </div>

                {/* Mode + relative date */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      compact ? "text-[11px]" : "text-xs",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-[3px] border px-1.5 py-px font-mono tracking-[0.1em]",
                        compact ? "text-[8px]" : "text-[9px]",
                        ranked
                          ? "border-gold/40 bg-gold/[0.12] text-gold"
                          : "border-white/[0.12] bg-white/[0.04] text-fg-2",
                      )}
                    >
                      {ranked ? tLobby("modeRanked") : tLobby("modeQuick")}
                    </span>
                    {isWin && (
                      <span className="font-mono text-[9px] tracking-[0.1em] text-success">
                        ★ {t("win")}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-mono text-fg-3",
                      compact ? "text-[10px]" : "text-[11px]",
                    )}
                  >
                    {formatRelative(m.endedAt, locale)}
                  </span>
                </div>

                {/* ELO delta — only ranked */}
                {ranked && m.eloDelta != null && (
                  <span
                    className={cn(
                      "shrink-0 text-right font-mono font-semibold tabular-nums",
                      compact ? "text-[11px]" : "text-[12px]",
                      eloPositive
                        ? "text-success"
                        : eloNegative
                          ? "text-danger"
                          : "text-fg-3",
                    )}
                  >
                    {m.eloDelta > 0 ? `+${m.eloDelta}` : m.eloDelta}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
