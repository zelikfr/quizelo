import { getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QACatChip } from "@/components/shared/QACatChip";
import { QATimerBar } from "@/components/shared/QATimerBar";
import { cn } from "@/lib/cn";
import {
  HERO_CHOICES,
  HERO_CORRECT_INDEX,
  HERO_ROSTER,
} from "@/lib/landing-data";

const LETTERS = ["A", "B", "C", "D"] as const;

const HERO_CARD_CLASS =
  "rounded-[18px] border border-white/[0.08] bg-live-card shadow-hero-card";

const ELO_BADGE_CLASS =
  "absolute -right-3.5 -top-3.5 flex items-center gap-1.5 rounded-pill px-3.5 py-2 font-display text-xs font-bold text-[#06080F] bg-gradient-gold-warm shadow-elo-badge";

function AnswerGrid() {
  return (
    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
      {HERO_CHOICES.map((choice, i) => {
        const isCorrect = i === HERO_CORRECT_INDEX;
        return (
          <div
            key={choice}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-[7px] font-display text-[11px] font-medium md:gap-2 md:px-3.5 md:py-3 md:text-sm",
              isCorrect
                ? "border-success/40 bg-success/10"
                : "border-white/[0.08] bg-white/[0.03]",
            )}
          >
            <span className="font-mono text-[9px] text-fg-3">{LETTERS[i]}</span>
            <span className="text-fg-1">{choice}</span>
            {isCorrect && <span className="ml-auto text-xs text-success">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

export async function LiveMatchCard() {
  const t = await getTranslations("hero");

  return (
    <div className="relative">
      <div className={cn(HERO_CARD_CLASS, "p-3.5 md:p-[22px]")}>
        {/* Top row */}
        <div className="mb-2.5 flex items-center justify-between md:mb-3.5">
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-widest2 text-danger md:gap-1.5 md:text-[10px]">
            <span className="inline-block h-[5px] w-[5px] rounded-full bg-danger animate-live-dot [box-shadow:0_0_8px_#FF4D6D] md:h-1.5 md:w-1.5" />
            {t("liveLabel")}
          </span>
          <span className="font-mono text-[10px] text-fg-3">Q 7/15</span>
        </div>

        {/* Category + timer — desktop only */}
        <div className="mb-3.5 hidden items-center gap-2 md:flex">
          <QACatChip cat="Geography" />
          <span className="font-mono text-[10px] text-fg-3">· QCM · 15s</span>
          <span className="ml-auto font-mono text-[22px] font-bold text-gold">09</span>
        </div>

        {/* Mobile compact header */}
        <div className="mb-2 flex items-center justify-between md:hidden">
          <span className="font-mono text-[9px] text-fg-3">Geography · QCM</span>
          <span className="font-mono text-base font-bold text-gold">09</span>
        </div>

        {/* Question */}
        <p className="mb-2.5 font-display text-sm font-semibold leading-tight text-white md:mb-3.5 md:text-[22px]">
          {t("question")}
        </p>

        <div className="mb-2.5 md:mb-3.5">
          <AnswerGrid />
        </div>

        {/* Roster — desktop only */}
        <div className="mb-2.5 hidden gap-1 md:flex">
          {HERO_ROSTER.map((p) => (
            <div key={p.id} className="flex-1">
              <QAAvatar name={p.name} seed={p.seed} size={28} dim={p.dim} />
            </div>
          ))}
        </div>

        {/* Timer bar — desktop only */}
        <div className="hidden md:block">
          <QATimerBar value={0.6} />
        </div>
      </div>

      {/* Floating ELO badge — desktop only */}
      <div className={cn("hidden md:flex", ELO_BADGE_CLASS)}>
        <span>+24 ELO</span>
        <span className="opacity-60">▲</span>
      </div>
    </div>
  );
}
