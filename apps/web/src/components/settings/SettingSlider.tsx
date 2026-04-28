import { cn } from "@/lib/cn";

interface SettingSliderProps {
  label: string;
  /** Mockup-only fixed value in `[0, 1]`. */
  value: number;
  /** Optional inline tag next to the label (e.g. "BETA"). */
  hint?: string;
  /** Compact (mobile) variant. */
  compact?: boolean;
}

/**
 * Static slider — no actual input. The track + thumb are positioned
 * with `left:`/`width:` percentage from the value prop.
 */
export function SettingSlider({
  label,
  value,
  hint,
  compact = false,
}: SettingSliderProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);
  const trackHeight = compact ? 5 : 6;
  const thumbSize = compact ? 13 : 16;
  const thumbOffset = thumbSize / 2;

  return (
    <div
      className={cn(
        compact
          ? "border-b border-white/[0.08] last:border-b-0 px-3.5 py-3"
          : "py-2",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-display font-medium text-fg-1",
              compact ? "text-xs" : "text-[13px]",
            )}
          >
            {label}
          </span>
          {hint && (
            <span className="rounded-[3px] bg-gold/10 px-1.5 py-px font-mono text-[9px] tracking-[0.1em] text-gold">
              {hint.toUpperCase()}
            </span>
          )}
        </div>
        <span className={cn("font-mono text-fg-3", compact ? "text-[10px]" : "text-[11px]")}>
          {pct}%
        </span>
      </div>

      <div
        className="relative rounded-pill bg-white/[0.06]"
        style={{ height: trackHeight }}
      >
        <div
          className="h-full rounded-pill bg-gradient-violet"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute rounded-full bg-white"
          style={{
            top: -((thumbSize - trackHeight) / 2),
            left: `calc(${pct}% - ${thumbOffset}px)`,
            width: thumbSize,
            height: thumbSize,
            boxShadow: "0 0 0 3px rgba(124,92,255,0.3)",
          }}
        />
      </div>
    </div>
  );
}
