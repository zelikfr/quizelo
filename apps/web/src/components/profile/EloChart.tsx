import { getTranslations } from "next-intl/server";
import { ELO_HISTORY } from "@/lib/profile-data";

interface EloChartProps {
  compact?: boolean;
}

const VIEW_W = 600;
const VIEW_H = 200;
const PADDING_Y = 10;

/** Build the path string + area string from a normalized series. */
function buildPaths(values: readonly number[]): { line: string; area: string; points: [number, number][] } {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points: [number, number][] = values.map((v, i) => {
    const x = (i * VIEW_W) / (values.length - 1);
    const y = VIEW_H - PADDING_Y - ((v - min) / range) * (VIEW_H - 2 * PADDING_Y);
    return [x, y];
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  const area = `${line} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`;
  return { line, area, points };
}

export async function EloChart({ compact = false }: EloChartProps) {
  const t = await getTranslations("profile.chart");
  const { line, area, points } = buildPaths(ELO_HISTORY);

  const lastPoint = points[points.length - 1];
  const delta = ELO_HISTORY[ELO_HISTORY.length - 1] - ELO_HISTORY[0];
  const deltaSign = delta >= 0 ? "+" : "";

  if (compact) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-gradient-surface p-3.5">
        <div className="mb-2 font-mono text-[9px] tracking-[0.15em] text-fg-3">
          {t("titleShort")}
        </div>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-20 w-full">
          <defs>
            <linearGradient id="prof-grad-mobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.4" />
              <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#prof-grad-mobile)" />
          <path d={line} stroke="#A18BFF" strokeWidth={2.5} fill="none" />
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r={4} fill="#FFD166" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
          {t("title")}
        </div>
        <div className="font-mono text-[11px] font-semibold text-success">
          {deltaSign}
          {delta} ELO
        </div>
      </div>

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

        {/* Horizontal grid lines */}
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
    </div>
  );
}
