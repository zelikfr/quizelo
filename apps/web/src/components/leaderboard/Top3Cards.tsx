import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QARankBadge } from "@/components/shared/QARankBadge";
import { LEADERS } from "@/lib/leaderboard-data";

const PLACE_COLOR = {
  1: "#FFD166",
  2: "#C9CFE0",
  3: "#B07A4A",
} as const;

interface Top3CardsProps {
  locale: Locale;
}

export function Top3Cards({ locale }: Top3CardsProps) {
  const top3 = LEADERS.slice(0, 3);

  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: "1fr 1.1fr 1fr" }}
    >
      {top3.map((p) => {
        const place = p.rank as 1 | 2 | 3;
        const color = PLACE_COLOR[place];
        return (
          <div
            key={p.name}
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
              <QAAvatar name={p.name} seed={p.seed} size={42} ring={color} />
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
