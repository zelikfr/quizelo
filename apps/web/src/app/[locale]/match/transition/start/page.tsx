import { setRequestLocale, getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { NextPhaseBrief } from "@/components/match/NextPhaseBrief";
import { TransitionCountdown } from "@/components/match/TransitionCountdown";
import { ROSTER } from "@/lib/game-data";

interface TransitionPageProps {
  params: Promise<{ locale: string }>;
}

const AMBIENT_DESKTOP =
  "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.30), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(124,92,255,0.15), transparent 50%)";
const AMBIENT_MOBILE = "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.30), transparent 55%)";

export default async function TransitionStartPage({ params }: TransitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("match.transition.start");

  return (
    <main className="bg-surface-1 qa-scan relative isolate min-h-screen overflow-x-clip">
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: AMBIENT_DESKTOP }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-14 py-6">
          <div className="flex items-center gap-3.5">
            <span className="text-violet-light font-mono text-[10px] font-bold tracking-[0.3em]">
              ◆ {t("room")}
            </span>
            <span className="bg-fg-3 h-1 w-1 rounded-full" />
            <span className="text-fg-3 font-mono text-[10px] tracking-[0.2em]">
              {t("rankedRange")}
            </span>
          </div>
          <span className="text-danger flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em]">
            <span
              aria-hidden
              className="bg-danger h-1.5 w-1.5 rounded-full"
              style={{ boxShadow: "0 0 8px #FF4D6D" }}
            />
            LIVE
          </span>
        </div>

        {/* Main */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-14">
          <div className="text-center">
            <p className="tracking-widest3 text-violet-light mb-3.5 font-mono text-[11px] font-bold">
              ◆ {t("badge")}
            </p>
            <h1 className="font-display m-0 text-balance text-[64px] font-bold leading-[0.95] tracking-[-0.035em]">
              {t("titleA")} <span className="text-gold">{t("titleB")}</span>
            </h1>
          </div>

          {/* Roster — 10 in a row */}
          <div className="flex justify-center gap-3.5">
            {ROSTER.map((p, i) => (
              <div
                key={p.id}
                className="itp-pulse-in flex flex-col items-center gap-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative">
                  <div
                    className="rounded-[14px] p-0.5"
                    style={{
                      background:
                        p.id === 0
                          ? "linear-gradient(135deg, #FFD166, #FF8B5C)"
                          : "linear-gradient(135deg, #7C5CFF, #5EC2FF)",
                    }}
                  >
                    <div className="bg-surface-0 overflow-hidden rounded-full">
                      <QAAvatar name={p.name} seed={p.seed} size={64} />
                    </div>
                  </div>
                  {p.id === 0 && (
                    <div
                      className="rounded-pill text-surface-0 absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.2em]"
                      style={{
                        background: "linear-gradient(135deg, #FFD166, #FF8B5C)",
                      }}
                    >
                      {t("you")}
                    </div>
                  )}
                </div>
                <div className="font-display max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium text-white">
                  {p.name}
                </div>
                <div className="text-fg-3 font-mono text-[8px] tracking-[0.15em]">{p.elo}</div>
              </div>
            ))}
          </div>

          {/* Countdown + brief */}
          <div
            className="mt-3 grid w-full max-w-[800px] items-center gap-8"
            style={{ gridTemplateColumns: "auto 1fr" }}
          >
            <div className="flex flex-col items-center gap-2.5">
              <div className="text-fg-3 font-mono text-[10px] font-bold tracking-[0.25em]">
                {t("phase1In")}
              </div>
              <TransitionCountdown value="03" tint="#A18BFF" size={88} />
            </div>
            <NextPhaseBrief phase={1} />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] bg-black/30 px-14 py-4">
          <span className="text-fg-3 font-mono text-[10px] tracking-[0.2em]">{t("tip")}</span>
          <span className="text-fg-3 font-mono text-[10px] tracking-[0.2em]">QUIZELO · S03</span>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: AMBIENT_MOBILE }}
        />

        <div className="relative z-10 flex items-center justify-between px-[22px] pt-12">
          <span className="text-violet-light font-mono text-[9px] font-bold tracking-[0.25em]">
            ◆ {t("roomShort")}
          </span>
          <span className="text-danger flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.25em]">
            <span aria-hidden className="bg-danger h-[5px] w-[5px] rounded-full" />
            LIVE
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-[22px] pb-6">
          <div className="text-center">
            <p className="text-violet-light mb-2 font-mono text-[9px] font-bold tracking-[0.35em]">
              ◆ {t("badge")}
            </p>
            <h1 className="font-display m-0 text-balance text-[30px] font-bold leading-[0.95] tracking-[-0.03em]">
              {t("titleA")}
              <br />
              <span className="text-gold">{t("titleB")}</span>
            </h1>
          </div>

          {/* 5×2 grid */}
          <div className="grid w-full grid-cols-5 gap-2">
            {ROSTER.map((p, i) => (
              <div
                key={p.id}
                className="itp-pulse-in flex flex-col items-center gap-1"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="rounded-[10px] p-0.5"
                  style={{
                    background:
                      p.id === 0
                        ? "linear-gradient(135deg, #FFD166, #FF8B5C)"
                        : "linear-gradient(135deg, #7C5CFF, #5EC2FF)",
                  }}
                >
                  <div className="bg-surface-0 overflow-hidden rounded-lg">
                    <QAAvatar name={p.name} seed={p.seed} size={48} />
                  </div>
                </div>
                <div
                  className="max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[8px] tracking-[0.05em]"
                  style={{ color: p.id === 0 ? "#FFD166" : "var(--fg-2)" }}
                >
                  {p.id === 0 ? t("you") : p.name}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-fg-3 font-mono text-[9px] font-bold tracking-[0.25em]">
              {t("phase1In")}
            </div>
            <TransitionCountdown value="03" tint="#A18BFF" size={64} />
          </div>

          <div className="w-full">
            <NextPhaseBrief phase={1} />
          </div>
        </div>
      </div>
    </main>
  );
}
