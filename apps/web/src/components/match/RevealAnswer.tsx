interface RevealAnswerProps {
  letter: string;
  text: string;
  /** Compact variant for mobile. */
  compact?: boolean;
}

const REVEAL_BG =
  "linear-gradient(180deg, rgba(74,222,128,0.18), rgba(74,222,128,0.04))";
const REVEAL_BORDER = "rgba(74,222,128,0.5)";
const REVEAL_GLOW = "0 0 40px -10px rgba(74,222,128,0.4)";
const REVEAL_GLOW_SM = "0 0 32px -10px rgba(74,222,128,0.4)";

export function RevealAnswer({ letter, text, compact = false }: RevealAnswerProps) {
  return (
    <div
      className={
        compact
          ? "inline-flex items-center gap-2.5 rounded-[14px] border px-5 py-3.5"
          : "inline-flex max-w-full items-center gap-3.5 rounded-[18px] border px-7 py-5"
      }
      style={{
        background: REVEAL_BG,
        borderColor: REVEAL_BORDER,
        boxShadow: compact ? REVEAL_GLOW_SM : REVEAL_GLOW,
      }}
    >
      <span
        className={
          compact
            ? "flex h-6 w-6 items-center justify-center rounded-md bg-success font-display text-xs font-bold text-surface-0"
            : "flex h-9 w-9 items-center justify-center rounded-lg bg-success font-display text-base font-bold text-surface-0"
        }
      >
        {letter}
      </span>
      <span
        className={
          compact
            ? "font-display text-[22px] font-bold text-white"
            : "font-display text-[36px] font-bold tracking-[-0.015em] text-white"
        }
      >
        {text}
      </span>
      {!compact && (
        <span aria-hidden className="ml-1 text-[28px] text-success">✓</span>
      )}
    </div>
  );
}
