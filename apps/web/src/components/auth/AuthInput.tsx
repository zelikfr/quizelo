import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "idle" | "focus" | "valid" | "warn";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Optional element rendered to the right of the label (e.g. "Forgot?"). */
  hint?: React.ReactNode;
  /** Single character glyph rendered inside the field on the left. */
  icon?: React.ReactNode;
  /** Element rendered inside the field on the right (eye toggle, badge…). */
  trailing?: React.ReactNode;
  /** Visual tone — drives border + background color. */
  tone?: Tone;
  /** Helper text under the field. */
  helper?: React.ReactNode;
}

const FIELD_BY_TONE: Record<Tone, string> = {
  idle:  "border-white/[0.08] bg-white/[0.03] focus-within:border-violet/60 focus-within:bg-violet/[0.06] focus-within:[box-shadow:0_0_0_4px_rgba(124,92,255,0.08)]",
  focus: "border-violet/40 bg-violet/[0.06] [box-shadow:0_0_0_4px_rgba(124,92,255,0.08)]",
  valid: "border-success/40 bg-success/[0.05]",
  warn:  "border-warn/40 bg-warn/[0.05]",
};

const ICON_BY_TONE: Record<Tone, string> = {
  idle:  "text-fg-3",
  focus: "text-violet-light",
  valid: "text-fg-3",
  warn:  "text-warn",
};

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    { id, label, hint, icon, trailing, tone = "idle", helper, className, ...props },
    ref,
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor={id}
            className="font-mono text-[10px] font-bold tracking-widest2 text-fg-3"
          >
            {label}
          </label>
          {hint && <div className="text-[11px] text-fg-3">{hint}</div>}
        </div>

        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md border px-3.5 py-3 transition-colors duration-120",
            FIELD_BY_TONE[tone],
          )}
        >
          {icon && (
            <span
              aria-hidden
              className={cn("text-base leading-none", ICON_BY_TONE[tone])}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "flex-1 min-w-0 bg-transparent font-body text-sm text-fg-1 placeholder:text-fg-4 outline-none",
              className,
            )}
            {...props}
          />
          {trailing && <div className="shrink-0 text-fg-3">{trailing}</div>}
        </div>

        {helper && <p className="m-0 mt-1 text-[10px] text-fg-3">{helper}</p>}
      </div>
    );
  },
);
