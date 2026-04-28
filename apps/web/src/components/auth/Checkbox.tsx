import * as React from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  /** Visual default — drives the box's initial fill state in the mockup. */
  defaultChecked?: boolean;
}

/**
 * Native checkbox styled with a violet fill. We use the `peer` strategy so
 * the visual layer stays in sync with the actual input state — no client
 * JS needed for the toggle on a static mockup, the browser handles it.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ id, label, className, defaultChecked, ...props }, ref) {
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-fg-2",
          className,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.16] bg-transparent transition-colors duration-120",
            "peer-checked:border-violet peer-checked:bg-violet peer-checked:[&_svg]:opacity-100",
            "peer-focus-visible:[box-shadow:0_0_0_3px_rgba(124,92,255,0.25)]",
          )}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-3 w-3 text-white opacity-0 transition-opacity duration-120"
          >
            <path
              d="M3 8.5l3 3 7-7"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="flex-1">{label}</span>
      </label>
    );
  },
);
