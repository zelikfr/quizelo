import { getTranslations } from "next-intl/server";
import { QACatChip } from "@/components/shared/QACatChip";
import { QATimerBar } from "@/components/shared/QATimerBar";

interface NextQuestionCountdownProps {
  /** Number shown in the big circle (seconds remaining). */
  seconds: number;
  /** Category id for the upcoming question. */
  category: string;
  /** Mobile-compact layout. */
  compact?: boolean;
  /** Question type meta — only shown on desktop. */
  meta?: string;
}

const CARD_BG =
  "linear-gradient(90deg, rgba(124,92,255,0.12), rgba(124,92,255,0.02))";
const CARD_BG_MOBILE =
  "linear-gradient(90deg, rgba(124,92,255,0.15), rgba(124,92,255,0.02))";

export async function NextQuestionCountdown({
  seconds,
  category,
  compact = false,
  meta,
}: NextQuestionCountdownProps) {
  const t = await getTranslations("match.interstitial");

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 rounded-[14px] border p-3.5"
        style={{ background: CARD_BG_MOBILE, borderColor: "rgba(124,92,255,0.4)" }}
      >
        <CountdownCircle seconds={seconds} compact />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[9px] tracking-[0.18em] text-fg-3">
            {t("nextQuestion")}
          </div>
          <div className="mt-1">
            <QACatChip cat={category} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-5 rounded-[18px] border p-6"
      style={{ background: CARD_BG, borderColor: "rgba(124,92,255,0.35)" }}
    >
      <CountdownCircle seconds={seconds} />
      <div className="flex-1">
        <div className="font-mono text-[10px] tracking-[0.2em] text-fg-3">
          {t("nextQuestion")}
        </div>
        <div className="mt-1 flex items-center gap-2.5">
          <QACatChip cat={category} />
          {meta && <span className="font-mono text-[11px] text-fg-3">· {meta}</span>}
        </div>
      </div>
      <div className="flex-1">
        <QATimerBar value={0.7} />
      </div>
    </div>
  );
}

function CountdownCircle({ seconds, compact }: { seconds: number; compact?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-violet/[0.18] font-display font-bold text-white"
      style={{
        width: compact ? 44 : 64,
        height: compact ? 44 : 64,
        fontSize: compact ? 22 : 32,
        border: "2px solid #7C5CFF",
        boxShadow: compact
          ? "0 0 16px rgba(124,92,255,0.5)"
          : "0 0 24px rgba(124,92,255,0.5)",
      }}
    >
      {seconds}
    </div>
  );
}
