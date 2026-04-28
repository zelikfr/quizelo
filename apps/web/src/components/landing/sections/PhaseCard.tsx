import { PHASE_TINTS } from "@/lib/landing-data";

export interface Phase {
  title: string;
  sub: string;
  text: string;
  kpiLabel: string;
  meta: string;
}

interface PhaseCardProps {
  phase: Phase;
  index: number;
}

export function PhaseCard({ phase, index }: PhaseCardProps) {
  const { tint, glow, kpiValue } = PHASE_TINTS[index];
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[14px] border p-4 md:min-h-[320px] md:rounded-[18px] md:p-7"
      style={{
        background: `linear-gradient(180deg, ${glow}, rgba(11,15,26,0.6))`,
        borderColor: glow.replace("0.18", "0.35"),
      }}
    >
      {/* Watermark — desktop only */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-4 hidden select-none font-display font-bold leading-none md:block"
        style={{ fontSize: 160, color: tint, opacity: 0.08, letterSpacing: "-0.05em" }}
      >
        {num}
      </span>

      <div className="mb-2 flex items-center gap-2 md:mb-[18px] md:gap-2.5">
        <span
          className="rounded-pill px-[7px] py-[3px] font-mono text-[9px] font-bold tracking-widest2 md:px-2 md:py-1 md:text-[10px]"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${tint}40`,
            color: tint,
          }}
        >
          PHASE {num}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-fg-3 md:text-[10px]">
          {phase.sub}
        </span>
      </div>

      <h3 className="relative z-10 m-0 mb-1.5 font-display text-lg font-bold tracking-[-0.025em] text-white md:mb-3 md:text-[30px]">
        {phase.title}
      </h3>
      <p className="relative z-10 m-0 text-xs leading-relaxed text-fg-2 md:text-sm">
        {phase.text}
      </p>

      {/* Footer KPI — desktop only */}
      <div className="relative z-10 mt-auto hidden items-end justify-between border-t border-white/[0.08] pt-[18px] md:flex">
        <div>
          <div
            className="font-display font-mono text-[32px] font-bold leading-none"
            style={{ color: tint }}
          >
            {kpiValue}
          </div>
          <div className="mt-1 font-mono text-[9px] tracking-widest2 text-fg-3">
            {phase.kpiLabel}
          </div>
        </div>
        <div className="max-w-[140px] text-right font-mono text-[10px] text-fg-3">
          {phase.meta}
        </div>
      </div>
    </div>
  );
}
