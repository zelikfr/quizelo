import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextPhaseBrief } from "@/components/match/NextPhaseBrief";
import { TransitionCountdown } from "@/components/match/TransitionCountdown";
import { TransitionEliminated } from "@/components/match/TransitionEliminated";
import { TransitionSurvivor } from "@/components/match/TransitionSurvivor";
import { ROSTER } from "@/lib/game-data";
import {
  PHASE1_ELIMINATED_IDS,
  PHASE1_SURVIVOR_IDS,
} from "@/lib/game-questions";

interface TransitionPageProps {
  params: Promise<{ locale: string }>;
}

const AMBIENT_DESKTOP =
  "radial-gradient(ellipse at 30% 30%, rgba(74,222,128,0.15), transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(94,194,255,0.18), transparent 55%)";
const AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.18), transparent 50%)";

export default async function TransitionP1toP2Page({ params }: TransitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("match.transition.p1ToP2");

  const survivors = PHASE1_SURVIVOR_IDS.map((id) =>
    ROSTER.find((p) => p.id === id),
  ).filter((x): x is NonNullable<typeof x> => x !== undefined);

  const eliminated = PHASE1_ELIMINATED_IDS.map((id) =>
    ROSTER.find((p) => p.id === id),
  ).filter((x): x is NonNullable<typeof x> => x !== undefined);

  const stats: { value: string; label: string; color: string }[] = [
    { value: "12 / 15", label: t("stats.correct"),   color: "#4ADE80" },
    { value: "80 %",    label: t("stats.accuracy"),  color: "#FFFFFF" },
    { value: "4ᵉ",      label: t("stats.phaseRank"), color: "#FFD166" },
    { value: "2",       label: t("stats.livesLeft"), color: "#FF6BB5" },
  ];

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
            <span className="font-mono text-[10px] tracking-[0.2em] text-violet-light">
              {t("from")}
            </span>
            <span className="text-fg-4">›</span>
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-info">
              {t("to")}
            </span>
          </div>
        </div>

        <div
          className="relative z-10 grid flex-1 items-stretch gap-7 px-12 pb-6"
          style={{ gridTemplateColumns: "1.4fr 1fr" }}
        >
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <h1 className="m-0 font-display text-[44px] font-bold leading-[0.95] tracking-[-0.03em]">
              <span className="text-success">5</span> {t("survivorsLabel")}.{" "}
              <span className="text-danger">5</span> {t("eliminatedLabel")}.
            </h1>

            {/* Survivors card */}
            <div
              className="rounded-2xl border p-[22px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(74,222,128,0.10), rgba(11,15,26,0.7))",
                borderColor: "rgba(74,222,128,0.3)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-success">
                  ✓ {t("advancing")}
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
                  5 / 10
                </span>
              </div>
              <div className="flex justify-around gap-5">
                {survivors.map((p, i) => (
                  <div
                    key={p.id}
                    className="itp-fade-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <TransitionSurvivor player={p} size={70} />
                  </div>
                ))}
              </div>
            </div>

            {/* Eliminated card */}
            <div
              className="rounded-[14px] border p-[18px]"
              style={{
                background: "rgba(255,77,109,0.05)",
                borderColor: "rgba(255,77,109,0.18)",
              }}
            >
              <div className="mb-3.5 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-danger">
                  ✕ {t("eliminatedHeading")}
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
                  5 / 10
                </span>
              </div>
              <div className="flex justify-around gap-4.5">
                {eliminated.map((p, i) => (
                  <div
                    key={p.id}
                    className="itp-fade-up"
                    style={{ animationDelay: `${500 + i * 60}ms` }}
                  >
                    <TransitionEliminated player={p} size={50} />
                  </div>
                ))}
              </div>
            </div>

            {/* My recap */}
            <div className="grid grid-cols-4 gap-2.5">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-white/[0.08] bg-black/30 p-3.5 text-center"
                >
                  <div
                    className="font-display font-mono text-[22px] font-bold leading-none"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1.5 font-mono text-[9px] tracking-[0.2em] text-fg-3">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-fg-3">
                {t("countdownLabel")}
              </div>
              <TransitionCountdown value="04" tint="#5EC2FF" size={104} />
            </div>
            <NextPhaseBrief phase={2} />
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

        <div className="relative z-10 px-[22px] pt-12 pb-5">
          <div className="mb-2 font-mono text-[9px] tracking-[0.25em] text-fg-3">
            ◆ {t("phaseComplete")}
          </div>
          <h1 className="m-0 font-display text-[28px] font-bold leading-[0.95] tracking-[-0.025em]">
            <span className="text-success">5</span> {t("survivorsLabel")}.
            <br />
            <span className="text-danger">5</span> {t("eliminatedLabel")}.
          </h1>
        </div>

        {/* Survivors */}
        <div className="relative z-10 px-[22px]">
          <div
            className="rounded-[14px] border p-3.5"
            style={{
              background:
                "linear-gradient(180deg, rgba(74,222,128,0.10), rgba(11,15,26,0.7))",
              borderColor: "rgba(74,222,128,0.3)",
            }}
          >
            <div className="mb-3 font-mono text-[9px] font-bold tracking-[0.3em] text-success">
              ✓ {t("advancingShort")}
            </div>
            <div className="flex justify-around gap-1.5">
              {survivors.map((p, i) => (
                <div
                  key={p.id}
                  className="itp-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <TransitionSurvivor player={p} size={48} mini />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eliminated */}
        <div className="relative z-10 px-[22px] pt-3">
          <div
            className="rounded-xl border p-3"
            style={{
              background: "rgba(255,77,109,0.05)",
              borderColor: "rgba(255,77,109,0.18)",
            }}
          >
            <div className="mb-2.5 font-mono text-[9px] font-bold tracking-[0.3em] text-danger">
              ✕ {t("eliminatedShort")}
            </div>
            <div className="flex justify-around gap-1">
              {eliminated.map((p) => (
                <TransitionEliminated key={p.id} player={p} size={36} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-4 gap-1.5 px-[22px] pt-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-white/[0.08] bg-black/30 p-2 text-center"
            >
              <div
                className="font-display font-mono text-sm font-bold leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="mt-1 font-mono text-[7px] tracking-[0.2em] text-fg-3">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Countdown + brief */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-[22px] py-5">
          <div className="flex flex-col items-center gap-2">
            <div className="font-mono text-[9px] font-bold tracking-[0.3em] text-fg-3">
              {t("countdownLabel")}
            </div>
            <TransitionCountdown value="04" tint="#5EC2FF" size={64} />
          </div>
          <div className="w-full">
            <NextPhaseBrief phase={2} />
          </div>
        </div>
      </div>
    </main>
  );
}
