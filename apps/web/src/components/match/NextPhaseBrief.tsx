"use client";

import { useTranslations } from "next-intl";

interface NextPhaseBriefProps {
  /** Which next phase: 1 (start), 2 (after P1), or 3 (finale). */
  phase: 1 | 2 | 3;
}

const TINTS = {
  1: "#7C5CFF",
  2: "#5EC2FF",
  3: "#FFD166",
} as const;

/** Brief card describing rules + scoring + duration of the upcoming phase. */
export function NextPhaseBrief({ phase }: NextPhaseBriefProps) {
  const t = useTranslations(`match.transition.brief.phase${phase}`);
  const tint = TINTS[phase];
  const rules = t.raw("rules") as { label: string; value: string }[];

  return (
    <div
      className="rounded-2xl border p-[22px]"
      style={{
        background: `linear-gradient(180deg, ${tint}15, rgba(11,15,26,0.9))`,
        borderColor: `${tint}40`,
      }}
    >
      <div
        className="mb-2.5 font-mono text-[10px] font-bold tracking-[0.3em]"
        style={{ color: tint }}
      >
        {t("label")}
      </div>
      <div className="mb-3.5 font-display text-lg font-semibold leading-[1.25] tracking-[-0.015em] text-white">
        {t("title")}
      </div>
      <div className="flex flex-col gap-1.5">
        {rules.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-md border border-white/[0.08] bg-black/30 px-2.5 py-[7px]"
          >
            <span className="text-[11px] text-fg-2">{r.label}</span>
            <span
              className="font-mono text-[11px] font-bold tracking-[0.05em]"
              style={{ color: tint }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
