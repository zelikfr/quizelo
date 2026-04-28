"use client";

import type { PublicPlayer } from "@quizelo/protocol";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { NextPhaseBrief } from "@/components/match/NextPhaseBrief";
import { TransitionCountdown } from "@/components/match/TransitionCountdown";
import { TransitionEliminated } from "@/components/match/TransitionEliminated";
import { TransitionSurvivor } from "@/components/match/TransitionSurvivor";
import type { MatchClientState } from "@/match/match-state";

interface TransitionViewProps {
  state: MatchClientState;
}

const AMBIENT_P1_TO_P2 =
  "radial-gradient(ellipse at 30% 30%, rgba(74,222,128,0.15), transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(94,194,255,0.18), transparent 55%)";
const AMBIENT_P2_TO_P3 =
  "radial-gradient(ellipse at 50% 30%, rgba(255,209,102,0.20), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,139,92,0.15), transparent 50%)";

export function TransitionView({ state }: TransitionViewProps) {
  const isP1 = state.status === "transition_p1_p2";
  if (isP1) return <TransitionP1ToP2 state={state} />;
  return <TransitionP2ToP3 state={state} />;
}

// ─── P1 → P2 ────────────────────────────────────────────────────────
function TransitionP1ToP2({ state }: { state: MatchClientState }) {
  const t = useTranslations("match.transition.p1ToP2");
  const remaining = useCountdown(state.nextPhaseAt, state.serverTimeOffset);

  const survivors = state.players.filter((p) =>
    state.lastPhaseEnd?.survivors.includes(p.userId),
  );
  const eliminated = state.players.filter((p) =>
    state.lastPhaseEnd?.eliminated.includes(p.userId),
  );

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: AMBIENT_P1_TO_P2 }}
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
              <span className="text-success">{survivors.length}</span>{" "}
              {t("survivorsLabel")}.{" "}
              <span className="text-danger">{eliminated.length}</span>{" "}
              {t("eliminatedLabel")}.
            </h1>

            {/* Survivors */}
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
                  {survivors.length} / {state.players.length}
                </span>
              </div>
              <div className="flex flex-wrap justify-around gap-5">
                {survivors.map((p, i) => (
                  <div
                    key={p.userId}
                    className="itp-fade-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <SurvivorAdapter player={p} isSelf={p.userId === state.selfId} />
                  </div>
                ))}
              </div>
            </div>

            {/* Eliminated */}
            {eliminated.length > 0 && (
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
                    {eliminated.length} / {state.players.length}
                  </span>
                </div>
                <div className="flex flex-wrap justify-around gap-4">
                  {eliminated.map((p, i) => (
                    <div
                      key={p.userId}
                      className="itp-fade-up"
                      style={{ animationDelay: `${500 + i * 60}ms` }}
                    >
                      <TransitionEliminated name={p.name} seed={p.avatarId} size={50} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-fg-3">
                {t("countdownLabel")}
              </div>
              <TransitionCountdown
                value={remaining.toString().padStart(2, "0")}
                tint="#5EC2FF"
                size={104}
              />
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
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.18), transparent 50%)" }}
        />

        <div className="relative z-10 px-[22px] pt-12 pb-5">
          <div className="mb-2 font-mono text-[9px] tracking-[0.25em] text-fg-3">
            ◆ {t("phaseComplete")}
          </div>
          <h1 className="m-0 font-display text-[28px] font-bold leading-[0.95] tracking-[-0.025em]">
            <span className="text-success">{survivors.length}</span>{" "}
            {t("survivorsLabel")}.<br />
            <span className="text-danger">{eliminated.length}</span>{" "}
            {t("eliminatedLabel")}.
          </h1>
        </div>

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
            <div className="flex flex-wrap justify-around gap-1.5">
              {survivors.map((p, i) => (
                <div
                  key={p.userId}
                  className="itp-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <SurvivorAdapter
                    player={p}
                    isSelf={p.userId === state.selfId}
                    mini
                    size={48}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {eliminated.length > 0 && (
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
              <div className="flex flex-wrap justify-around gap-1">
                {eliminated.map((p) => (
                  <TransitionEliminated key={p.userId} name={p.name} seed={p.avatarId} size={36} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-4 px-[22px] py-5">
          <div className="flex flex-col items-center gap-2">
            <div className="font-mono text-[9px] font-bold tracking-[0.3em] text-fg-3">
              {t("countdownLabel")}
            </div>
            <TransitionCountdown
              value={remaining.toString().padStart(2, "0")}
              tint="#5EC2FF"
              size={64}
            />
          </div>
          <div className="w-full">
            <NextPhaseBrief phase={2} />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── P2 → P3 ────────────────────────────────────────────────────────
function TransitionP2ToP3({ state }: { state: MatchClientState }) {
  const t = useTranslations("match.transition.p2ToP3");
  const remaining = useCountdown(state.nextPhaseAt, state.serverTimeOffset);

  const finalists = state.players.filter((p) =>
    state.lastPhaseEnd?.survivors.includes(p.userId),
  );
  const eliminated = state.players.filter((p) =>
    state.lastPhaseEnd?.eliminated.includes(p.userId),
  );

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: AMBIENT_P2_TO_P3 }}
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
          <div className="flex flex-col gap-5">
            <h1 className="m-0 font-display text-[44px] font-bold leading-[0.95] tracking-[-0.03em]">
              {t("titleA")}
              <br />
              <span className="text-gold">{t("titleB")}</span> {t("titleC")}
            </h1>

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
                  {finalists.length} / {state.players.length}
                </span>
              </div>
              <div className="flex flex-wrap justify-around gap-7">
                {finalists.map((p, i) => (
                  <div
                    key={p.userId}
                    className="flex flex-col items-center gap-2.5 itp-scale"
                    style={{ animationDelay: `${i * 140}ms` }}
                  >
                    <SurvivorAdapter
                      player={p}
                      isSelf={p.userId === state.selfId}
                      size={92}
                    />
                    <div
                      className="rounded-pill border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-gold"
                      style={{
                        background: "rgba(255,209,102,0.15)",
                        borderColor: "rgba(255,209,102,0.4)",
                      }}
                    >
                      +{p.score} {t("pts")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {eliminated.length > 0 && (
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
                <div className="flex flex-wrap gap-3.5">
                  {eliminated.map((p) => (
                    <div key={p.userId} className="flex items-center gap-2 opacity-60">
                      <TransitionEliminated name={p.name} seed={p.avatarId} size={36} />
                      <span className="font-mono text-[10px] tracking-[0.1em] text-fg-3">
                        +{p.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-fg-3">
                {t("countdownLabel")}
              </div>
              <TransitionCountdown
                value={remaining.toString().padStart(2, "0")}
                tint="#FFD166"
                size={120}
              />
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
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.20), transparent 50%)" }}
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
              ★ {t("finalistsHeading")} · {finalists.length}/{state.players.length}
            </div>
            <div className="flex flex-wrap justify-around gap-2">
              {finalists.map((p, i) => (
                <div
                  key={p.userId}
                  className="flex flex-col items-center gap-1.5 itp-scale"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <SurvivorAdapter
                    player={p}
                    isSelf={p.userId === state.selfId}
                    size={62}
                    mini
                  />
                  <div
                    className="rounded-pill border px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-gold"
                    style={{
                      background: "rgba(255,209,102,0.18)",
                      borderColor: "rgba(255,209,102,0.4)",
                    }}
                  >
                    +{p.score} PTS
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-[22px] py-5">
          <div className="flex flex-col items-center gap-2">
            <div className="font-mono text-[9px] font-bold tracking-[0.3em] text-fg-3">
              {t("countdownLabel")}
            </div>
            <TransitionCountdown
              value={remaining.toString().padStart(2, "0")}
              tint="#FFD166"
              size={72}
            />
          </div>
          <div className="w-full">
            <NextPhaseBrief phase={3} />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────
function SurvivorAdapter({
  player,
  isSelf,
  size = 70,
  mini = false,
}: {
  player: PublicPlayer;
  isSelf: boolean;
  size?: number;
  mini?: boolean;
}) {
  return (
    <TransitionSurvivor
      name={player.name}
      seed={player.avatarId}
      isMe={isSelf}
      size={size}
      mini={mini}
      elo={`${player.score} pts`}
    />
  );
}

function useCountdown(deadlineMs: number | null, offset: number): number {
  const [now, setNow] = useState(() => Date.now() - offset);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() - offset), 200);
    return () => clearInterval(id);
  }, [offset]);
  if (deadlineMs === null) return 0;
  return Math.max(0, Math.ceil((deadlineMs - now) / 1000));
}
