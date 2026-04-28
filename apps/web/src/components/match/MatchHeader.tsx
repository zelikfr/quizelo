import { getTranslations } from "next-intl/server";

interface MatchHeaderProps {
  /** Drives the accent color (violet for phase 1, gold for 2/3). */
  phase: 1 | 2 | 3;
  /** Right-side meta (e.g. "Survivors 8/10"). */
  meta?: string;
  /** Sub-label shown next to the phase chip ("7/15", "SPRINT", "FINALE"). */
  progress?: string;
}

export async function MatchHeader({ phase, meta, progress }: MatchHeaderProps) {
  const t = await getTranslations("match");

  const isVioletAccent = phase === 1;
  const chipStyle = {
    background: isVioletAccent
      ? "rgba(124,92,255,0.15)"
      : "rgba(255,209,102,0.15)",
    borderColor: isVioletAccent
      ? "rgba(124,92,255,0.35)"
      : "rgba(255,209,102,0.35)",
    color: isVioletAccent ? "#A18BFF" : "#FFD166",
  };

  return (
    <div className="flex items-center justify-between border-b border-white/[0.08] px-7 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className="rounded border px-2 py-1 font-mono text-[10px] tracking-[0.15em]"
          style={chipStyle}
        >
          {t("phaseLabel")} {phase}
        </span>
        {progress && (
          <span className="font-mono text-[11px] text-fg-3">· {progress}</span>
        )}
      </div>

      {meta && <span className="font-mono text-[11px] text-fg-3">{meta}</span>}
    </div>
  );
}
