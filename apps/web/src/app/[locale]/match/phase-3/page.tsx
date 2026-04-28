import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QACatChip } from "@/components/shared/QACatChip";
import { QAChoice } from "@/components/shared/QAChoice";
import { QATimerRing } from "@/components/shared/QATimerRing";
import { FinalistCard } from "@/components/match/FinalistCard";
import { MatchHeader } from "@/components/match/MatchHeader";
import { ROSTER } from "@/lib/game-data";
import { FINALISTS, getQuestion } from "@/lib/game-questions";

interface PhasePageProps {
  params: Promise<{ locale: string }>;
}

const LETTERS = ["A", "B", "C", "D"] as const;

const FINAL_AMBIENT =
  "radial-gradient(ellipse at 50% 30%, rgba(255,209,102,0.12), transparent 60%)";
const FINAL_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 25%, rgba(255,209,102,0.15), transparent 60%)";

export default async function Phase3Page({ params }: PhasePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("match.phase3");
  const tCommon = await getTranslations("common");

  const question = getQuestion("finale", loc);
  const finalists = FINALISTS.map((f) => {
    const player = ROSTER.find((p) => p.id === f.playerId);
    return player
      ? { player: { ...player, lives: f.lives }, isLast: f.isLast, isMe: player.id === 0 }
      : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: FINAL_AMBIENT }}
        />

        <MatchHeader phase={3} progress={tCommon("victory") ? "FINALE" : "FINALE"} meta={t("rules")} />

        {/* Three finalists */}
        <div className="relative flex justify-center gap-8 px-5 py-6">
          {finalists.map((f) => (
            <FinalistCard
              key={f.player.id}
              player={f.player}
              lives={f.player.lives}
              isLast={f.isLast}
              isMe={f.isMe}
              lastBadgeLabel={t("lastBadge")}
            />
          ))}
        </div>

        {/* Question */}
        <div className="relative flex justify-center px-14">
          <div className="w-full max-w-[720px]">
            <div className="mb-4 flex items-center justify-between">
              <QACatChip cat={question.category} />
              <QATimerRing value={6} max={12} size={64} label="SEC" danger />
            </div>

            <h2 className="m-0 mb-6 font-display text-[32px] font-semibold leading-[1.15] tracking-[-0.015em]">
              {question.text}
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {question.choices.map((c, i) => (
                <QAChoice
                  key={c}
                  letter={LETTERS[i]}
                  text={c}
                  state={i === 2 ? "selected" : "idle"}
                />
              ))}
            </div>

            <div className="mt-3.5 flex items-center gap-2.5 rounded-md border border-danger/25 bg-danger/[0.08] p-3">
              <span aria-hidden className="text-base text-danger">⚠</span>
              <span className="font-mono text-[11px]" style={{ color: "#FFB0BD" }}>
                {t("warning")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: FINAL_AMBIENT_MOBILE }}
        />

        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-gold">
            P3 — FINALE
          </span>
          <QATimerRing value={6} max={12} size={36} danger />
        </div>

        {/* Finalists row */}
        <div className="flex gap-2 px-3.5 pt-3">
          {finalists.map((f) => (
            <FinalistCard
              key={f.player.id}
              player={f.player}
              lives={f.player.lives}
              isLast={f.isLast}
              isMe={f.isMe}
              lastBadgeLabel={t("lastBadgeShort")}
              compact
            />
          ))}
        </div>

        {/* Question */}
        <div className="px-[18px] pt-5">
          <QACatChip cat={question.category} />
          <h2 className="m-0 mt-2.5 mb-4 font-display text-[20px] font-semibold leading-[1.2]">
            {question.text}
          </h2>
          <div className="flex flex-col gap-2">
            {question.choices.map((c, i) => (
              <QAChoice
                key={c}
                letter={LETTERS[i]}
                text={c}
                state={i === 2 ? "selected" : "idle"}
              />
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="px-[18px] pb-[18px] pt-2.5">
          <div className="rounded-md border border-danger/25 bg-danger/[0.08] p-2.5">
            <span className="font-mono text-[10px]" style={{ color: "#FFB0BD" }}>
              {t("warningShort")}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
