import * as React from "react";
import { cn } from "@/lib/cn";

interface SettingToggleProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Mockup-only initial state — the underlying input is uncontrolled. */
  defaultOn?: boolean;
  /** Compact (mobile) variant. */
  compact?: boolean;
  /** Render without padding/border (for use inside another container). */
  inline?: boolean;
}

/**
 * Visually styled toggle backed by a native checkbox. The visual layer
 * is driven by CSS peer-checked selectors so no client JS is needed.
 */
export function SettingToggle({
  label,
  hint,
  defaultOn = false,
  compact = false,
  inline = false,
}: SettingToggleProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-4",
        !inline && "border-b border-white/[0.08] last:border-b-0",
        !inline && (compact ? "px-3.5 py-3" : "px-[18px] py-3.5"),
        "cursor-pointer",
      )}
    >
      <div className="flex-1">
        <div
          className={cn(
            "font-display font-medium text-fg-1",
            compact ? "text-xs" : "text-[13px]",
          )}
        >
          {label}
        </div>
        {hint && (
          <div className={cn("mt-0.5 text-fg-3", compact ? "text-[10px]" : "text-[11px]")}>
            {hint}
          </div>
        )}
      </div>

      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />

      <div
        aria-hidden
        className={cn(
          "relative shrink-0 rounded-pill border bg-white/[0.06] transition-colors duration-200",
          compact ? "h-[18px] w-8" : "h-[22px] w-[38px]",
          "border-white/[0.08]",
          "peer-checked:border-violet/70 peer-checked:bg-violet/50",
          "peer-checked:[box-shadow:0_0_14px_-2px_rgba(124,92,255,0.5)]",
          // Move + recolor the thumb when the peer is checked.
          compact
            ? "peer-checked:[&_.thumb]:left-[14px]"
            : "peer-checked:[&_.thumb]:left-[17px]",
          "peer-checked:[&_.thumb]:bg-white",
        )}
      >
        <div
          className={cn(
            "thumb absolute top-px left-px rounded-full bg-fg-3 transition-[left,background-color] duration-200",
            compact ? "h-[14px] w-[14px]" : "h-[18px] w-[18px]",
          )}
        />
      </div>
    </label>
  );
}
