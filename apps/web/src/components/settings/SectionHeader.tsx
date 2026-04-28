import * as React from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** Mono-cap eyebrow with leading glyph, e.g. "◆ ACCOUNT". */
  glyph: string;
  eyebrow: string;
  title: React.ReactNode;
  /** Visual accent — drives eyebrow color. */
  tone?: "violet" | "gold" | "danger";
}

const TONE_COLOR = {
  violet: "text-violet-light",
  gold: "text-gold",
  danger: "text-danger",
} as const;

export function SectionHeader({
  glyph,
  eyebrow,
  title,
  tone = "violet",
}: SectionHeaderProps) {
  return (
    <div>
      <p className={cn("font-mono text-[11px] tracking-[0.25em]", TONE_COLOR[tone])}>
        {glyph} {eyebrow}
      </p>
      <h2 className="m-0 mt-1.5 mb-3.5 font-display text-[22px] font-bold tracking-[-0.02em]">
        {title}
      </h2>
    </div>
  );
}
