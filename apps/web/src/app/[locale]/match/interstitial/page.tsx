import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QALives } from "@/components/shared/QALives";
import { MatchHeader } from "@/components/match/MatchHeader";
import { NextQuestionCountdown } from "@/components/match/NextQuestionCountdown";
import {
  PerPlayerResults,
  type AnswerStatus,
  type PlayerResult,
} from "@/components/match/PerPlayerResults";
import { RevealAnswer } from "@/components/match/RevealAnswer";
import { RevealStats } from "@/components/match/RevealStats";
import { ROSTER } from "@/lib/game-data";
import { getQuestion } from "@/lib/game-questions";

interface InterstitialPageProps {
  params: Promise<{ locale: string }>;
}

const LETTERS = ["A", "B", "C", "D"] as const;
const NEXT_CATEGORY = "History";
const COUNTDOWN_SECONDS = 3;

const REVEAL_AMBIENT =
  "radial-gradient(ellipse at 50% 30%, rgba(74,222,128,0.10), transparent 60%)";
const REVEAL_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 25%, rgba(74,222,128,0.12), transparent 60%)";

/** Static fixture — would come from the WS payload at runtime. */
const RESULTS: readonly PlayerResult[] = [
  { playerId: 0, status: "correct", lives: 3 },
  { playerId: 1, status: "correct", lives: 3 },
  { playerId: 5, status: "correct", lives: 3 },
  { playerId: 3, status: "wrong",   lives: 2 },
  { playerId: 9, status: "correct", lives: 3 },
  { playerId: 6, status: "wrong",   lives: 2 },
  { playerId: 8, status: "correct", lives: 3 },
  { playerId: 2, status: "timeout", lives: 0 },
];

const ELIMINATED_ID = 2;

/** Shown in the bottom mobile player strip. */
const STRIP: readonly { id: number; status: AnswerStatus | "out" }[] = [
  { id: 0, status: "correct" },
  { id: 1, status: "correct" },
  { id: 5, status: "correct" },
  { id: 3, status: "wrong"   },
  { id: 9, status: "correct" },
  { id: 6, status: "wrong"   },
  { id: 8, status: "correct" },
  { id: 2, status: "out"     },
];

const STATUS_DOT = {
  correct: { bg: "#4ADE80", icon: "✓" },
  wrong:   { bg: "#FF4D6D", icon: "✗" },
  timeout: { bg: "#FFB020", icon: "⏱" },
  out:     { bg: "#FFB020", icon: "☠" },
} as const;

export default async function InterstitialPage({ params }: InterstitialPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("match.interstitial");
  const tPhase = await getTranslations("match.phase1");

  const prevQuestion = getQuestion("phase1", loc);
  const correctLetter = LETTERS[prevQuestion.answerIndex];
  const correctText = prevQuestion.choices[prevQuestion.answerIndex];

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: REVEAL_AMBIENT }}
        />

        <MatchHeader
          phase={1}
          progress="7/15"
          meta={`${tPhase("survivors")} 6/10`}
        />

        <div
          className="relative grid flex-1 gap-8 px-14 py-8"
          style={{ gridTemplateColumns: "1fr 360px" }}
        >
          {/* Left — reveal */}
          <section className="flex flex-col justify-center">
            <p className="mb-3 font-mono text-[11px] tracking-[0.25em] text-success">
              ◆ {t("correctBadge")}
            </p>
            <p className="m-0 mb-4 max-w-[620px] font-display text-[22px] font-medium leading-[1.2] text-fg-2 text-balance">
              «&nbsp;{prevQuestion.text}&nbsp;»
            </p>

            <div className="self-start">
              <RevealAnswer letter={correctLetter} text={correctText} />
            </div>

            <div className="mt-7">
              <RevealStats />
            </div>

            <div className="mt-8">
              <NextQuestionCountdown
                seconds={COUNTDOWN_SECONDS}
                category={NEXT_CATEGORY}
                meta="QCM · 15s"
              />
            </div>
          </section>

          {/* Right — per-player results */}
          <PerPlayerResults results={RESULTS} eliminatedPlayerId={ELIMINATED_ID} />
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: REVEAL_AMBIENT_MOBILE }}
        />

        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-violet-light">
            P1 · 7/15
          </span>
          <span className="font-mono text-[10px] text-fg-3">
            {tPhase("survivors")} 6/10
          </span>
        </div>

        {/* Reveal centered */}
        <div className="px-[18px] pt-6 text-center">
          <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-success">
            ◆ {t("correctBadgeShort")}
          </p>
          <p className="mb-3.5 text-[13px] leading-[1.3] text-fg-2">
            «&nbsp;{prevQuestion.text}&nbsp;»
          </p>
          <RevealAnswer letter={correctLetter} text={correctText} compact />
        </div>

        {/* Your result card */}
        <div className="px-[18px] pt-[18px]">
          <div
            className="flex items-center gap-3 rounded-lg border p-3.5"
            style={{
              background: "rgba(124,92,255,0.08)",
              borderColor: "rgba(124,92,255,0.3)",
            }}
          >
            <QAAvatar name="Toi" seed={0} size={36} ring="#FFD166" />
            <div className="flex-1">
              <div className="font-mono text-[9px] tracking-[0.15em] text-violet-light">
                {t("yourResult")}
              </div>
              <div className="font-display text-base font-bold text-success">
                ✓ {t("correctText")} · 4.1s
              </div>
            </div>
            <QALives count={3} max={3} size={9} gap={3} />
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-1.5 px-[18px] pt-3">
          <MiniStat label={t("stats.gotShort")} value="5/8" valueClass="text-success" />
          <MiniStat label={t("stats.livesShort")} value="3" valueClass="text-danger" />
          <MiniStat label={t("stats.outShort")} value="1" valueClass="text-warn" />
        </div>

        {/* Player strip with status dots */}
        <div className="flex justify-center gap-1 px-3.5 pt-3.5">
          {STRIP.map(({ id, status }) => {
            const player = ROSTER.find((p) => p.id === id);
            if (!player) return null;
            const dot = STATUS_DOT[status];
            return (
              <div
                key={id}
                className="relative flex flex-col items-center gap-[3px]"
              >
                <QAAvatar
                  name={player.name}
                  seed={player.seed}
                  size={28}
                  dim={status === "out"}
                />
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full font-display text-[8px] font-bold text-surface-0"
                  style={{
                    background: dot.bg,
                    border: "2px solid #0B0F1A",
                  }}
                >
                  {dot.icon}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="px-[18px] pb-[18px] pt-3.5">
          <NextQuestionCountdown
            seconds={COUNTDOWN_SECONDS}
            category={NEXT_CATEGORY}
            compact
          />
        </div>
      </div>
    </main>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  valueClass?: string;
}

function MiniStat({ label, value, valueClass = "text-white" }: MiniStatProps) {
  return (
    <div className="flex-1 rounded-lg border border-white/[0.08] bg-gradient-surface p-2.5 text-center">
      <div className="font-mono text-[9px] text-fg-3">{label}</div>
      <div className={`font-display font-mono text-[18px] font-bold ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}
