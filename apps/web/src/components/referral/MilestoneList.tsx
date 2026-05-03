import { getTranslations } from "next-intl/server";
import {
  MILESTONE_AWARDS,
  type MilestoneId,
  type MilestoneState,
} from "@/lib/referral-config";
import { cn } from "@/lib/cn";

export interface MilestoneEntry {
  id: MilestoneId;
  state: MilestoneState;
  /** 0..1, only meaningful when state === "active". */
  progress: number;
}

interface MilestoneListProps {
  milestones: readonly MilestoneEntry[];
  compact?: boolean;
}

export async function MilestoneList({
  milestones,
  compact = false,
}: MilestoneListProps) {
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
        {milestones.map((m, i) => {
          const award = MILESTONE_AWARDS[m.id];
          return (
            <Row
              key={m.id}
              entry={m}
              index={i}
              label={tLabels(m.id)}
              refereeLabel={t("referee")}
              ownerCredits={award.referrer}
              refereeCredits={award.referee}
              compact={compact}
            />
          );
        })}
      </div>
    </div>
  );
}

interface RowProps {
  entry: MilestoneEntry;
  index: number;
  label: string;
  refereeLabel: string;
  ownerCredits: number;
  refereeCredits: number;
  compact: boolean;
}

function Row({
  entry,
  index,
  label,
  refereeLabel,
  ownerCredits,
  refereeCredits,
  compact,
}: RowProps) {
  const { state, progress } = entry;
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
                width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                background: "linear-gradient(90deg, #7C5CFF, #FFD166)",
              }}
            />
          </div>
        )}
      </div>

      <div className="text-right">
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
