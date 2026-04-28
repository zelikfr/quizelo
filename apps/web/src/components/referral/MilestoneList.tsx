import { getTranslations } from "next-intl/server";
import { MILESTONES, type Milestone } from "@/lib/referral-data";
import { cn } from "@/lib/cn";

interface MilestoneListProps {
  compact?: boolean;
}

export async function MilestoneList({ compact = false }: MilestoneListProps) {
  const t = await getTranslations("referral.milestones");
  const tLabels = await getTranslations("referral.milestoneLabels");

  return (
    <div>
      <p
        className={cn(
          "mb-2 font-mono tracking-[0.18em] text-fg-3",
          compact ? "text-[9px]" : "mb-3 text-[10px] tracking-[0.2em]",
        )}
      >
        {compact ? t("titleShort") : t("title")}
      </p>
      <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
        {MILESTONES.map((m, i) => (
          <Row
            key={m.id}
            milestone={m}
            index={i}
            label={tLabels(m.id)}
            refereeLabel={t("referee")}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

interface RowProps {
  milestone: Milestone;
  index: number;
  label: string;
  refereeLabel: string;
  compact: boolean;
}

function Row({ milestone, index, label, refereeLabel, compact }: RowProps) {
  const { state, ownerCredits, refereeCredits, progress = 0 } = milestone;
  const dotSize = compact ? 22 : 26;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border",
        compact ? "px-3 py-2.5" : "p-3",
        state === "active"
          ? "border-violet/40 bg-violet/[0.10]"
          : "border-white/[0.08] bg-gradient-surface",
        state === "done" && "opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-mono text-xs",
          state === "done"
            ? "bg-success text-surface-0"
            : "border border-white/[0.08] bg-white/[0.05] text-fg-3",
        )}
        style={{ width: dotSize, height: dotSize }}
      >
        {state === "done" ? "✓" : index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "font-display font-medium text-fg-1",
            compact ? "text-[11px]" : "text-[13px]",
          )}
        >
          {label}
        </div>
        {state === "active" && !compact && (
          <div className="mt-1.5 h-1 overflow-hidden rounded-pill bg-white/[0.06]">
            <div
              className="h-full rounded-pill"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #7C5CFF, #FFD166)",
              }}
            />
          </div>
        )}
      </div>

      <div className={compact ? "text-right" : "text-right"}>
        <div className="flex items-center gap-1 font-mono font-bold text-gold">
          <span className={compact ? "text-[10px]" : "text-[11px]"}>◈</span>
          <span className={compact ? "text-xs" : "text-[13px]"}>+{ownerCredits}</span>
        </div>
        {!compact && (
          <div className="font-mono text-[9px] text-fg-3">
            +{refereeCredits} {refereeLabel}
          </div>
        )}
      </div>
    </div>
  );
}
