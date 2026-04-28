import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

interface SettingRowProps {
  label: React.ReactNode;
  /** Current value (mono font). On mobile this becomes the `value` chip. */
  value: React.ReactNode;
  /** Action button label (desktop). On mobile we render a chevron instead. */
  action?: string;
  /** Tiny success indicator next to the value (e.g. "✓ verified"). */
  meta?: React.ReactNode;
  metaColor?: string;
  /** Render the value in muted color (e.g. "Not set"). */
  muted?: boolean;
  /** Compact (mobile) variant — chevron + value on the right. */
  compact?: boolean;
  /** Optional badge after the label (e.g. "PRO"). */
  badge?: React.ReactNode;
}

export function SettingRow({
  label,
  value,
  action,
  meta,
  metaColor,
  muted = false,
  compact = false,
  badge,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-white/[0.08] last:border-b-0",
        compact ? "px-3.5 py-3" : "px-[18px] py-3.5",
      )}
    >
      {compact ? (
        <>
          <span className="flex-1 font-display text-xs font-medium text-fg-1">{label}</span>
          {badge && (
            <span className="rounded-[3px] bg-gold/15 px-1.5 py-px font-mono text-[8px] tracking-[0.1em] text-gold">
              {badge}
            </span>
          )}
          <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-fg-3">
            {value}
          </span>
          {meta && (
            <span className="text-[10px]" style={{ color: metaColor }}>
              {meta}
            </span>
          )}
          <span aria-hidden className="text-sm text-fg-3">
            ›
          </span>
        </>
      ) : (
        <>
          <span className="w-40 shrink-0 font-display text-xs font-medium text-fg-3">
            {label}
          </span>
          <span
            className={cn(
              "flex flex-1 items-center gap-2.5 font-mono text-[13px]",
              muted ? "text-fg-3" : "text-fg-1",
            )}
          >
            {value}
            {meta && (
              <span className="font-mono text-[10px]" style={{ color: metaColor }}>
                {meta}
              </span>
            )}
          </span>
          {action && (
            <Button variant="ghost" size="sm" className="px-2.5 py-1.5 text-[11px]">
              {action}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
