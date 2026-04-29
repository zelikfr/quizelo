import { getTranslations } from "next-intl/server";

interface EloChartProps {
  /** Chronological ascending series. May contain a single point. */
  history: ReadonlyArray<{ at: Date; elo: number }>;
  compact?: boolean;
}

const VIEW_W = 600;
const VIEW_H = 200;
const PADDING_Y = 10;

interface BuiltPaths {
  line: string;
  area: string;
  points: Array<[number, number]>;
}

/** Build the SVG path strings + screen-space points from a normalized series. */
function buildPaths(values: ReadonlyArray<number>): BuiltPaths {
  if (values.length === 0) return { line: "", area: "", points: [] };
  if (values.length === 1) {
    const y = VIEW_H / 2;
    return {
      line: `M 0 ${y} L ${VIEW_W} ${y}`,
      area: `M 0 ${y} L ${VIEW_W} ${y} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`,
      points: [[VIEW_W / 2, y]],
    };
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points: Array<[number, number]> = values.map((v, i) => {
    const x = (i * VIEW_W) / (values.length - 1);
    const y =
      VIEW_H - PADDING_Y - ((v - min) / range) * (VIEW_H - 2 * PADDING_Y);
    return [x, y];
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`)
    .join(" ");
  const area = `${line} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`;
  return { line, area, points };
}

export async function EloChart({ history, compact = false }: EloChartProps) {
  const t = await getTranslations("profile.chart");

  const values = history.map((p) => p.elo);
  const { line, area, points } = buildPaths(values);
  const lastPoint = points.at(-1);

  // Delta = newest – oldest. 0 when we don't have enough history.
  const first = values[0];
  const last = values.at(-1);
  const delta =
    typeof first === "number" && typeof last === "number" ? last - first : 0;
  const deltaSign = delta >= 0 ? "+" : "";
  const deltaColor =
    delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-fg-3";

  if (compact) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-gradient-surface p-3.5">
        <div className="mb-2 font-mono text-[9px] tracking-[0.15em] text-fg-3">
          {t("titleShort")}
        </div>
        {points.length > 0 ? (
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-20 w-full">
            <defs>
              <linearGradient
                id="prof-grad-mobile"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.4" />
                <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#prof-grad-mobile)" />
            <path d={line} stroke="#A18BFF" strokeWidth={2.5} fill="none" />
            {lastPoint && (
              <circle cx={lastPoint[0]} cy={lastPoint[1]} r={4} fill="#FFD166" />
            )}
          </svg>
        ) : (
          <div className="flex h-20 items-center justify-center font-mono text-[10px] text-fg-3">
            {t("empty")}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
          {t("title")}
        </div>
        <div className={`font-mono text-[11px] font-semibold ${deltaColor}`}>
          {deltaSign}
          {delta} ELO
        </div>
      </div>

      {points.length > 0 ? (
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-[220px] w-full flex-1"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="prof-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.4" />
              <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 50, 100, 150, 200].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2={VIEW_W}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
            />
          ))}

          <path d={area} fill="url(#prof-grad)" />
          <path d={line} stroke="#A18BFF" strokeWidth={2} fill="none" />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={3}
              fill={i === points.length - 1 ? "#FFD166" : "#A18BFF"}
            />
          ))}
        </svg>
      ) : (
        <div className="flex h-[220px] items-center justify-center font-mono text-[11px] tracking-[0.15em] text-fg-3">
          {t("empty")}
        </div>
      )}
    </div>
  );
}
