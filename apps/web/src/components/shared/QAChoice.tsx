"use client";

import { cn } from "@/lib/cn";

export type ChoiceState = "idle" | "hover" | "selected" | "correct" | "wrong" | "dimmed";

interface QAChoiceProps {
  letter: string;
  text: string;
  state?: ChoiceState;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const STATE_BUTTON: Record<ChoiceState, string> = {
  idle:     "bg-white/[0.04] border-white/[0.08] text-fg-1",
  hover:    "bg-violet/[0.12] border-violet/45 text-white",
  selected: "bg-violet/20 border-violet text-white shadow-choice-selected",
  correct:  "bg-success/[0.18] border-success text-white shadow-choice-correct",
  wrong:    "bg-danger/[0.15] border-danger text-white",
  dimmed:   "bg-white/[0.02] border-white/[0.04] text-fg-4 line-through cursor-not-allowed",
};

const STATE_LETTER: Record<ChoiceState, string> = {
  idle:     "bg-white/[0.06] text-fg-2",
  hover:    "bg-white/[0.06] text-fg-2",
  selected: "bg-white/[0.06] text-fg-2",
  correct:  "bg-success text-surface-0",
  wrong:    "bg-danger text-surface-0",
  dimmed:   "bg-white/[0.04] text-fg-4",
};

export function QAChoice({
  letter,
  text,
  state = "idle",
  onClick,
  disabled,
  className,
}: QAChoiceProps) {
  const isDisabled = disabled || state === "dimmed";
  return (
    <button
      type="button"
      onClick={(e) => {
        console.info("[QAChoice] click", { letter, state, isDisabled });
        if (onClick) onClick();
      }}
      disabled={isDisabled}
      aria-pressed={state === "selected"}
      className={cn(
        "flex w-full items-center gap-3 rounded-[14px] border px-4 py-3.5 text-left font-body text-sm font-medium transition-all duration-120",
        !isDisabled && "cursor-pointer hover:border-violet/40 hover:bg-violet/[0.08]",
        isDisabled && "cursor-default",
        STATE_BUTTON[state],
        className,
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] font-display text-xs font-bold",
          STATE_LETTER[state],
        )}
      >
        {letter}
      </span>
      <span className="flex-1">{text}</span>
      {state === "correct" && <span className="text-success">✓</span>}
      {state === "wrong"   && <span className="text-danger">✗</span>}
    </button>
  );
}
