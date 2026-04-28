interface QATimerRingProps {
  value?: number;
  max?: number;
  size?: number;
  label?: string;
  danger?: boolean;
}

export function QATimerRing({
  value = 8,
  max = 15,
  size = 64,
  label,
  danger,
}: QATimerRingProps) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, value / max));
  const isDanger = danger ?? ratio < 0.25;
  const stroke = isDanger ? "var(--danger)" : "var(--violet)";
  const fontSize = Math.round(size * 0.28);
  const labelSize = Math.round(size * 0.13);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={3}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={3}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${stroke}66)` }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-mono font-semibold"
        style={{ color: stroke }}
      >
        <div style={{ fontSize, lineHeight: 1 }}>{value}</div>
        {label && (
          <div className="text-fg-3" style={{ fontSize: labelSize, marginTop: 2 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
