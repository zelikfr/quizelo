import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QACatChip } from "@/components/shared/QACatChip";
import { QAChoice } from "@/components/shared/QAChoice";
import { QALives } from "@/components/shared/QALives";
import { QAPlayerChip } from "@/components/shared/QAPlayerChip";
import { QATimerRing } from "@/components/shared/QATimerRing";
import { BonusDock } from "@/components/match/BonusDock";
import { MatchHeader } from "@/components/match/MatchHeader";
import { ROSTER } from "@/lib/game-data";
import { getQuestion } from "@/lib/game-questions";

interface PhasePageProps {
  params: Promise<{ locale: string }>;
}

const LETTERS = ["A", "B", "C", "D"] as const;

export default async function Phase1Page({ params }: PhasePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("match");
  const tPhase = await getTranslations("match.phase1");

  const question = getQuestion("phase1", loc);
  const survivorsLeft = ROSTER.slice(0, 5);
  const survivorsRight = ROSTER.slice(5, 8);
  const eliminated = ROSTER.slice(8);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:min-h-screen md:flex-col">
        <MatchHeader
          phase={1}
          progress={`${t("question")} 7`}
          meta={`${tPhase("survivors")} 8/10`}
        />

        <div className="grid flex-1" style={{ gridTemplateColumns: "240px 1fr 240px" }}>
          {/* Left — survivors */}
          <aside className="flex flex-col gap-2 border-r border-white/[0.08] p-5">
            <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {tPhase("survivors")}
            </p>
            {survivorsLeft.map((p) => (
              <QAPlayerChip
                key={p.id}
                player={p}
                compact
                highlight={p.id === 0}
                status={p.id === 5 ? "answering" : p.id === 2 ? "correct" : "alive"}
              />
            ))}
          </aside>

          {/* Center — question */}
          <section className="flex flex-col px-10 py-8">
            <div className="mb-6 flex items-center justify-between">
              <QACatChip cat={question.category} />
              <QATimerRing value={9} max={15} size={68} label="SEC" />
            </div>

            <h2 className="m-0 mb-8 font-display text-[36px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance">
              {question.text}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {question.choices.map((c, i) => (
                <QAChoice
                  key={c}
                  letter={LETTERS[i]}
                  text={c}
                  state={i === 1 ? "selected" : "idle"}
                />
              ))}
            </div>

            <div className="mt-auto pt-6">
              <BonusDock />
            </div>
          </section>

          {/* Right — others + eliminated */}
          <aside className="flex flex-col gap-2 border-l border-white/[0.08] p-5">
            <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {tPhase("others")}
            </p>
            {survivorsRight.map((p) => (
              <QAPlayerChip
                key={p.id}
                player={p}
                compact
                status={p.id === 4 ? "wrong" : "alive"}
              />
            ))}

            <p className="mb-1 mt-3 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {tPhase("eliminated")}
            </p>
            {eliminated.map((p) => (
              <QAPlayerChip
                key={p.id}
                player={{ ...p, lives: 0 }}
                compact
                status="eliminated"
              />
            ))}
          </aside>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5 pb-3">
          <span className="font-mono text-[10px] tracking-[0.18em] text-violet-light">
            P1 · 7/15
          </span>
          <span className="font-mono text-[10px] text-fg-3">
            {tPhase("survivors")} 8/10
          </span>
        </div>

        {/* Mini player strip */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3.5 pb-3">
          {ROSTER.map((p) => (
            <div
              key={p.id}
              className="flex shrink-0 flex-col items-center gap-[3px]"
            >
              <QAAvatar
                name={p.name}
                seed={p.seed}
                size={28}
                dim={p.id >= 8}
                ring={p.id === 0 ? "#7C5CFF" : undefined}
              />
              <QALives count={p.id >= 8 ? 0 : p.lives} max={3} size={4} gap={2} />
            </div>
          ))}
        </div>

        {/* Cat + timer */}
        <div className="mt-1.5 flex items-center justify-between px-[18px]">
          <QACatChip cat={question.category} />
          <QATimerRing value={9} max={15} size={52} />
        </div>

        {/* Question */}
        <div className="px-[18px] pt-5">
          <h2 className="m-0 font-display text-[22px] font-semibold leading-[1.18] tracking-[-0.01em]">
            {question.text}
          </h2>
        </div>

        {/* Choices */}
        <div className="flex flex-col gap-2 px-[18px] pt-5">
          {question.choices.map((c, i) => (
            <QAChoice
              key={c}
              letter={LETTERS[i]}
              text={c}
              state={i === 1 ? "selected" : "idle"}
            />
          ))}
        </div>

        <div className="flex-1" />

        <BonusDock compact />
      </div>
    </main>
  );
}
