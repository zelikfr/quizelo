import { cn } from "@/lib/cn";

interface FlowBarProps {
  flowLabel: string;
  startLabel: string;
  championLabel: string;
  totalLabel?: string;
}

export function FlowBar({
  flowLabel,
  startLabel,
  championLabel,
  totalLabel = "~5 min",
}: FlowBarProps) {
  const steps = [
    { n: 10, l: startLabel,    win: false },
    { n: 5,  l: "Phase 1",     win: false },
    { n: 3,  l: "Phase 2",     win: false },
    { n: 1,  l: championLabel, win: true  },
  ];

  return (
    <div className="hidden items-center gap-6 rounded-lg border border-white/[0.08] bg-gradient-surface p-[22px] md:flex">
      <span className="shrink-0 font-mono text-[10px] tracking-widest2 text-fg-3">
        {flowLabel}
      </span>

      <div className="flex flex-1 items-center">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-1 items-center last:flex-initial">
            <div className="shrink-0 text-center">
              <div
                className={cn(
                  "font-display font-mono text-[22px] font-bold",
                  s.win ? "text-gold" : "text-white",
                )}
              >
                {s.n}
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-fg-3">
                {s.l}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="relative mx-3.5 h-px flex-1 bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08]">
                <span className="absolute -right-1 -top-1 text-[10px] text-fg-3">›</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 font-mono text-[10px] text-gold">{totalLabel}</div>
    </div>
  );
}
