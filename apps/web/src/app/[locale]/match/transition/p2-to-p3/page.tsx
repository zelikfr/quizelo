import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextPhaseBrief } from "@/components/match/NextPhaseBrief";
import { TransitionCountdown } from "@/components/match/TransitionCountdown";
import { TransitionEliminated } from "@/components/match/TransitionEliminated";
import { TransitionSurvivor } from "@/components/match/TransitionSurvivor";
import { ROSTER } from "@/lib/game-data";
import {
  PHASE2_ELIMINATED_IDS,
  PHASE2_FINALIST_IDS,
  SPRINT_SCORES,
} from "@/lib/game-questions";

interface TransitionPageProps {
  params: Promise<{ locale: string }>;
}

const AMBIENT_DESKTOP =
  "radial-gradient(ellipse at 50% 30%, rgba(255,209,102,0.20), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,139,92,0.15), transparent 50%)";
const AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.20), transparent 50%)";

function scoreFor(playerId: number): number {
  return SPRINT_SCORES.find((s) => s.playerId === playerId)?.score ?? 0;
}

export default async function TransitionP2toP3Page({ params }: TransitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("match.transition.p2ToP3");

  const finalists = PHASE2_FINALIST_IDS.map((id) =>
    ROSTER.find((p) => p.id === id),
  ).filter((x): x is NonNullable<typeof x> => x !== undefined);

  const eliminated = PHASE2_ELIMINATED_IDS.map((id) =>
    ROSTER.find((p) => p.id === id),
  ).filter((x): x is NonNullable<typeof x> => x !== undefined);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: AMBIENT_DESKTOP }}
        />

        <div className="relative z-10 flex items-center justify-between px-12 py-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-fg-3">
            ◆ {t("phaseComplete")}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-info">
              SPRINT 60s
            </span>
            <span className="text-fg-4">›</span>
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-gold">
              {t("finale")}
            </span>
          </div>
        </div>

        <div
          className="relative z-10 grid flex-1 gap-7 px-12 pb-6"
          style={{ gridTemplateColumns: "1.4fr 1fr" }}
        >
          {/* LEFT */}
          <div className="flex flex-col gap-5.5">
            <h1 className="m-0 font-display text-[44px] font-bold leading-[0.95] tracking-[-0.03em]">
              {t("titleA")}
              <br />
              <span className="text-gold">{t("titleB")}</span> {t("titleC")}
            </h1>

            {/* Finalist showcase */}
            <div
              className="rounded-[18px] border p-7"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,209,102,0.15), rgba(11,15,26,0.7))",
                borderColor: "rgba(255,209,102,0.4)",
                boxShadow: "0 30px 80px -20px rgba(255,209,102,0.3)",
              }}
            >
              <div className="mb-[22px] flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-gold">
                  ★ {t("finalistsHeading")}
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
                  3 / 5
                </span>
              </div>
              <div className="flex justify-around gap-7">
                {finalists.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-center gap-2.5 itp-scale"
                    style={{ animationDelay: `${i * 140}ms` }}
                  >
                    <TransitionSurvivor player={p} size={92} />
                    <div
                      className="rounded-pill border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-gold"
                      style={{
                        background: "rgba(255,209,102,0.15)",
                        borderColor: "rgba(255,209,102,0.4)",
                      }}
                    >
                      +{scoreFor(p.id)} {t("pts")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eliminated */}
            <div
              className="flex items-center justify-between rounded-[14px] border p-4"
              style={{
                background: "rgba(255,77,109,0.05)",
                borderColor: "rgba(255,77,109,0.18)",
              }}
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-danger">
                ✕ {t("finishPositions")}
              </span>
              <div className="flex gap-3.5">
                {eliminated.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 opacity-60"
                  >
                    <TransitionEliminated player={p} size={36} />
                    <span className="font-mono text-[10px] tracking-[0.1em] text-fg-3">
                      +{scoreFor(p.id)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-fg-3">
                {t("countdownLabel")}
              </div>
              <TransitionCountdown value="03" tint="#FFD166" size={120} />
            </div>
            <NextPhaseBrief phase={3} />
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-[600px]"
          style={{ background: AMBIENT_MOBILE }}
        />

        <div className="relative z-10 px-[22px] pt-12 pb-4">
          <div className="mb-2 font-mono text-[9px] tracking-[0.25em] text-fg-3">
            ◆ {t("phaseComplete")}
          </div>
          <h1 className="m-0 font-display text-[28px] font-bold leading-[0.95] tracking-[-0.025em]">
            {t("titleA")}
            <br />
            <span className="text-gold">{t("titleBShort")}</span> {t("titleC")}
          </h1>
        </div>

        {/* Finalists */}
        <div className="relative z-10 px-[22px]">
          <div
            className="rounded-2xl border p-[18px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,209,102,0.15), rgba(11,15,26,0.7))",
              borderColor: "rgba(255,209,102,0.4)",
              boxShadow: "0 20px 50px -15px rgba(255,209,102,0.3)",
            }}
          >
            <div className="mb-3.5 text-center font-mono text-[9px] font-bold tracking-[0.3em] text-gold">
              ★ {t("finalistsHeading")} · 3/5
            </div>
            <div className="flex justify-around gap-2">
              {finalists.map((p, i) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1.5 itp-scale"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <TransitionSurvivor player={p} size={62} mini />
                  <div
                    className="rounded-pill border px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-gold"
                    style={{
                      background: "rgba(255,209,102,0.18)",
                      borderColor: "rgba(255,209,102,0.4)",
                    }}
                  >
                    +{scoreFor(p.id)} PTS
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eliminated row */}
        <div className="relative z-10 px-[22px] pt-3">
          <div
            className="flex items-center justify-between rounded-xl border p-3"
            style={{
              background: "rgba(255,77,109,0.05)",
              borderColor: "rgba(255,77,109,0.18)",
            }}
          >
            <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-danger">
              ✕ 4ᵉ · 5ᵉ
            </span>
            <div className="flex gap-3">
              {eliminated.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <TransitionEliminated player={p} size={28} />
                  <span className="font-mono text-[9px] text-fg-3">
                    +{scoreFor(p.id)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Countdown + brief */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-[22px] py-5">
          <div className="flex flex-col items-center gap-2">
            <div className="font-mono text-[9px] font-bold tracking-[0.3em] text-fg-3">
              {t("countdownLabel")}
            </div>
            <TransitionCountdown value="03" tint="#FFD166" size={72} />
          </div>
          <div className="w-full">
            <NextPhaseBrief phase={3} />
          </div>
        </div>
      </div>
    </main>
  );
}
