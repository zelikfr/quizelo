import { cn } from "@/lib/cn";

interface PasswordStrengthProps {
  /** Strength in `[0, 1]`. */
  value: number;
  weakLabel: string;
  mediumLabel: string;
  strongLabel: string;
}

export function PasswordStrength({
  value,
  weakLabel,
  mediumLabel,
  strongLabel,
}: PasswordStrengthProps) {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * 4);
  const tier =
    value > 0.75
      ? { color: "bg-success", label: strongLabel, text: "text-success" }
      : value > 0.5
        ? { color: "bg-gold",   label: mediumLabel, text: "text-gold" }
        : { color: "bg-gold-warm", label: weakLabel, text: "text-gold-warm" };

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-pill",
              i < filled ? tier.color : "bg-white/[0.08]",
            )}
          />
        ))}
      </div>
      <span className={cn("font-mono text-[10px]", tier.text)}>{tier.label}</span>
    </div>
  );
}
