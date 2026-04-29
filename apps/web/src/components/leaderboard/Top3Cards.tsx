import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QARankBadge } from "@/components/shared/QARankBadge";
import type { LeaderboardEntry } from "@/lib/leaderboard-actions";

const PLACE_COLOR = {
  1: "#FFD166",
  2: "#C9CFE0",
  3: "#B07A4A",
} as const;

interface Top3CardsProps {
  locale: Locale;
  entries: LeaderboardEntry[];
}

export function Top3Cards({ locale, entries }: Top3CardsProps) {
  // Pad to length 3 with `null` so the layout stays balanced even if there
  // are fewer than three players in the DB.
  const cells: Array<LeaderboardEntry | null> = [
    entries[0] ?? null,
    entries[1] ?? null,
    entries[2] ?? null,
  ];

  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: "1fr 1.1fr 1fr" }}
    >
      {cells.map((p, idx) => {
        const place = (idx + 1) as 1 | 2 | 3;
        const color = PLACE_COLOR[place];
        if (!p) {
          return (
            <div
              key={`empty-${place}`}
              className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-[18px]"
              style={{
                transform: place === 1 ? "translateY(-8px)" : undefined,
              }}
            >
              <div
                className="mb-3 font-display text-[36px] font-bold leading-none opacity-40"
                style={{ color }}
              >
                #{place}
              </div>
              <div className="font-mono text-[11px] text-fg-3">—</div>
            </div>
          );
        }
        return (
          <div
            key={p.userId}
            className="rounded-lg border p-[18px]"
            style={{
              background: `linear-gradient(180deg, ${color}1A, ${color}03)`,
              borderColor: `${color}55`,
              transform: place === 1 ? "translateY(-8px)" : undefined,
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className="font-display text-[36px] font-bold leading-none"
                style={{ color }}
              >
                #{place}
              </div>
              <QARankBadge elo={p.elo} locale={locale} />
            </div>
            <div className="flex items-center gap-2.5">
              <QAAvatar name={p.name} seed={p.avatarId} size={42} ring={color} />
              <div className="min-w-0">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[15px] font-bold">
                  {p.name}
                </div>
                <div className="font-mono text-[11px] text-fg-3">{p.elo} ELO</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
