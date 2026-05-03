/**
 * Tiny inline-SVG bar chart. Avoids pulling Chart.js / Recharts for what
 * is essentially a 30-rectangle render. Auto-scales to the largest bin.
 */
export function BarChart({
  bins,
  width = 560,
  height = 80,
  className = "",
}: {
  bins: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (bins.length === 0) {
    return <div className="text-xs text-fg-3">No data.</div>;
  }
  const max = Math.max(1, ...bins.map((b) => b.value));
  const barWidth = width / bins.length;
  const innerHeight = height - 18; // leave space for labels at the bottom

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className={className}
      preserveAspectRatio="none"
    >
      {bins.map((b, i) => {
        const h = (b.value / max) * innerHeight;
        const x = i * barWidth + 1;
        const y = innerHeight - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={Math.max(1, barWidth - 2)}
              height={Math.max(0, h)}
              rx={2}
              fill="#7C5CFF"
              opacity={b.value === 0 ? 0.15 : 0.85}
            />
            <title>{`${b.label}: ${b.value}`}</title>
          </g>
        );
      })}
      {/* Sparse labels to avoid overlap: first, mid, last */}
      <text
        x={2}
        y={height - 4}
        fontSize="9"
        fill="rgba(154,160,191,0.7)"
        textAnchor="start"
      >
        {bins[0]?.label}
      </text>
      <text
        x={width / 2}
        y={height - 4}
        fontSize="9"
        fill="rgba(154,160,191,0.7)"
        textAnchor="middle"
      >
        {bins[Math.floor(bins.length / 2)]?.label}
      </text>
      <text
        x={width - 2}
        y={height - 4}
        fontSize="9"
        fill="rgba(154,160,191,0.7)"
        textAnchor="end"
      >
        {bins[bins.length - 1]?.label}
      </text>
    </svg>
  );
}
