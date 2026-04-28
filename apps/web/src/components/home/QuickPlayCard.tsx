import { getTranslations } from "next-intl/server";
import { PlayButton } from "@/components/home/PlayButton";
import { QATimerBar } from "@/components/shared/QATimerBar";
import { enqueueAndRedirectAction } from "@/lib/match-actions";
import { cn } from "@/lib/cn";

interface QuickPlayCardProps {
  /** Mobile variant — denser layout. */
  compact?: boolean;
  /** Extra classes on the root (e.g. `lg:flex-1` to stretch in a flex row). */
  className?: string;
}

export async function QuickPlayCard({ compact = false, className }: QuickPlayCardProps) {
  const t = await getTranslations("home.modes.quick");
  const tCommon = await getTranslations("common");

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-white/[0.08] bg-gradient-surface",
        compact ? "p-4" : "relative overflow-hidden p-6",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={
            compact
              ? "font-display text-lg font-bold"
              : "font-display text-[28px] font-bold"
          }
        >
          {t("title")}
        </div>
        <span className="rounded border border-success/30 bg-success/[0.12] px-2 py-[3px] font-mono text-[10px] tracking-[0.1em] text-success">
          {t("free")}
        </span>
      </div>

      {!compact && (
        <p className="m-0 mb-4 text-[13px] text-fg-2">{t("description")}</p>
      )}

      {/* Free games left */}
      <div className={compact ? "mb-2 flex items-center gap-2" : "mb-3 flex items-center gap-3"}>
        <div className="flex-1">
          <QATimerBar value={1 / 3} />
        </div>
        <span className="font-mono text-[10px] whitespace-nowrap text-fg-3">
          {compact ? "1/3" : `1 / 3 — ${t("freeLeft")}`}
        </span>
      </div>

      {/* Rewarded video CTA */}
      <div className="mb-3 flex items-center gap-2 rounded-md border border-dashed border-success/30 bg-success/[0.06] px-2.5 py-2">
        <span aria-hidden className="text-sm text-success">▸</span>
        <span className="flex-1 text-[11px] text-fg-2">{t("watchAd")}</span>
        {!compact && <span className="font-mono text-[10px] text-success">30s</span>}
      </div>

      <form action={enqueueAndRedirectAction} className="mt-auto">
        <PlayButton label={tCommon("play")} variant="primary" />
      </form>
    </div>
  );
}
