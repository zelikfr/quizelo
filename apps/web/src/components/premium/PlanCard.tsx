import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PlanCardProps {
  /** Mono cap eyebrow, e.g. "MONTHLY" / "MENSUEL". */
  eyebrow: string;
  price: string;
  /** Per-period suffix shown next to the price, e.g. "/ month" / "/ mois". */
  perPeriod: string;
  /** Sub-line below the price (cancel terms, monthly equivalent…). */
  hint: string;
  cta: string;
  /** Highlight the card with the gold gradient. */
  highlighted?: boolean;
  /** Optional discount badge, e.g. "−33%". */
  badge?: string;
}

const HIGHLIGHTED_BG =
  "linear-gradient(180deg, rgba(255,209,102,0.18), rgba(124,92,255,0.10))";

export function PlanCard({
  eyebrow,
  price,
  perPeriod,
  hint,
  cta,
  highlighted = false,
  badge,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border p-[22px]",
        highlighted ? "border-gold/50" : "border-white/[0.08] bg-gradient-surface",
      )}
      style={{
        background: highlighted ? HIGHLIGHTED_BG : undefined,
        boxShadow: highlighted ? "0 30px 60px -20px rgba(255,209,102,0.3)" : undefined,
      }}
    >
      {badge && (
        <span
          className="absolute -top-2.5 right-4 rounded-pill px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-surface-0"
          style={{ background: "#FFD166" }}
        >
          {badge}
        </span>
      )}

      <div
        className={cn(
          "font-mono text-[10px] tracking-[0.2em]",
          highlighted ? "text-gold" : "text-fg-3",
        )}
      >
        {eyebrow}
      </div>

      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="font-display text-[36px] font-bold">{price}</span>
        <span className="text-xs text-fg-3">{perPeriod}</span>
      </div>

      <div
        className={cn(
          "mt-1 font-mono text-[10px]",
          highlighted ? "text-gold" : "text-fg-3",
        )}
      >
        {hint}
      </div>

      <Button
        variant={highlighted ? "gold" : "ghost"}
        size="full"
        className="mt-[18px] justify-center py-3 text-xs"
      >
        {cta} {highlighted && "▸"}
      </Button>
    </div>
  );
}
