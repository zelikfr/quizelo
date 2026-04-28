import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { QACatChip } from "@/components/shared/QACatChip";
import { QAChoice } from "@/components/shared/QAChoice";
import { QATimerBar } from "@/components/shared/QATimerBar";
import { MatchHeader } from "@/components/match/MatchHeader";
import { SprintLeaderboard } from "@/components/match/SprintLeaderboard";
import { getQuestion } from "@/lib/game-questions";

interface PhasePageProps {
  params: Promise<{ locale: string }>;
}

const LETTERS = ["A", "B", "C", "D"] as const;

export default async function Phase2Page({ params }: PhasePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("match.phase2");
  const tCommon = await getTranslations("common");

  const question = getQuestion("sprint", loc);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:min-h-screen md:flex-col">
        <MatchHeader phase={2} progress="SPRINT" meta={t("rules")} />

        {/* Big timer */}
        <div className="flex items-center justify-center py-3">
          <span
            className="font-display font-mono text-[72px] font-bold leading-none tracking-[-0.02em] text-gold"
            style={{ textShadow: "0 0 32px rgba(255,209,102,0.4)" }}
          >
            0:23
          </span>
        </div>

        <div className="grid flex-1 gap-8 px-14 pb-10" style={{ gridTemplateColumns: "1fr 320px" }}>
          {/* Question + own stats */}
          <div className="flex flex-col">
            <QATimerBar value={23 / 60} />

            <div className="mt-5 rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-7">
              <QACatChip cat={question.category} />
              <h2 className="m-0 mt-3.5 mb-5 font-display text-[28px] font-semibold leading-[1.2] tracking-[-0.01em]">
                {question.text}
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {question.choices.map((c, i) => (
                  <QAChoice key={c} letter={LETTERS[i]} text={c} state="idle" />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button variant="ghost" size="sm">
                  ↦ {tCommon("skip")} (0)
                </Button>
                <span className="font-mono text-[11px] text-fg-3">{t("solo")}</span>
              </div>
            </div>

            {/* Score row */}
            <div className="mt-4 flex gap-3">
              <ScoreCard label={t("score")} value="+9" />
              <ScoreCard label={t("correct")} value="10" tone="success" />
              <ScoreCard label={t("wrong")} value="1" tone="danger" />
            </div>
          </div>

          <SprintLeaderboard />
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-gold">
            P2 · SPRINT
          </span>
          <span className="font-mono text-[10px] text-fg-3">{t("rules")}</span>
        </div>

        <div className="px-[18px] pt-3.5 text-center">
          <div
            className="font-display font-mono text-[56px] font-bold leading-none tracking-[-0.02em] text-gold"
            style={{ textShadow: "0 0 24px rgba(255,209,102,0.4)" }}
          >
            0:23
          </div>
          <div className="mt-1.5">
            <QATimerBar value={23 / 60} />
          </div>
        </div>

        {/* Score row */}
        <div className="flex gap-1.5 px-[18px] pt-3.5">
          <ScoreCard label={t("scoreShort")} value="+9" compact />
          <ScoreCard label="✓" value="10" tone="success" compact />
          <ScoreCard label="✗" value="1" tone="danger" compact />
        </div>

        {/* Question */}
        <div className="px-[18px] pt-4">
          <QACatChip cat={question.category} />
          <h2 className="m-0 mt-2.5 mb-3.5 font-display text-[18px] font-semibold leading-[1.2]">
            {question.text}
          </h2>
          <div className="flex flex-col gap-2">
            {question.choices.map((c, i) => (
              <QAChoice key={c} letter={LETTERS[i]} text={c} state="idle" />
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <SprintLeaderboard compact />
      </div>
    </main>
  );
}

interface ScoreCardProps {
  label: string;
  value: string;
  tone?: "success" | "danger";
  compact?: boolean;
}

function ScoreCard({ label, value, tone, compact = false }: ScoreCardProps) {
  const valueClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-white";

  return (
    <div
      className={
        compact
          ? "flex-1 rounded-lg border border-white/[0.08] bg-gradient-surface p-2.5 text-center"
          : "flex-1 rounded-lg border border-white/[0.08] bg-gradient-surface p-3.5"
      }
    >
      <div className={`font-mono ${compact ? "text-[9px]" : "text-[10px]"} text-fg-3`}>
        {label}
      </div>
      <div
        className={`font-display font-mono ${compact ? "text-[22px]" : "text-[28px]"} font-bold ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}
