import { cn } from "@/lib/cn";

interface QATimerBarProps {
  /** Progress in `[0, 1]`. Below 0.25 the bar switches to the danger color. */
  value?: number;
  danger?: boolean;
  height?: number;
  className?: string;
}

export function QATimerBar({
  value = 0.6,
  danger,
  height = 4,
  className,
}: QATimerBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const isDanger = danger ?? clamped < 0.25;

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-pill bg-white/[0.05]", className)}
      style={{ height }}
    >
      <div
        className={cn(
          "h-full rounded-pill transition-[width] duration-300 ease-out",
          isDanger
            ? "bg-danger [box-shadow:0_0_12px_rgba(255,77,109,0.5)]"
            : "bg-violet [box-shadow:0_0_12px_rgba(124,92,255,0.5)]",
        )}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
