interface TransitionCountdownProps {
  value: string;
  /** Hex tint color, e.g. "#FFD166". Drives glow + ring. */
  tint?: string;
  size?: number;
}

/** Big circular countdown digit with concentric rings + glow. */
export function TransitionCountdown({
  value,
  tint = "#FFD166",
  size = 88,
}: TransitionCountdownProps) {
  const outer = size + 24;
  const inner = size + 16;
  const radius = size / 2;

  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: outer,
        height: outer,
        background: `radial-gradient(circle, ${tint}28, transparent 70%)`,
      }}
    >
      <svg
        width={inner}
        height={inner}
        className="absolute inset-1"
        aria-hidden
      >
        <circle
          cx={inner / 2}
          cy={inner / 2}
          r={radius}
          fill="none"
          stroke={`${tint}44`}
          strokeWidth={1}
        />
        <circle
          cx={inner / 2}
          cy={inner / 2}
          r={radius - 6}
          fill="none"
          stroke={`${tint}22`}
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      </svg>
      <span
        className="font-display font-mono font-bold leading-none"
        style={{
          fontSize: size * 0.85,
          color: tint,
          letterSpacing: "-0.04em",
          textShadow: `0 0 24px ${tint}66`,
        }}
      >
        {value}
      </span>
    </div>
  );
}
