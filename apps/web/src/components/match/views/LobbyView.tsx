"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { NextPhaseBrief } from "@/components/match/NextPhaseBrief";
import { TransitionCountdown } from "@/components/match/TransitionCountdown";
import { cn } from "@/lib/cn";
import type { MatchClientState } from "@/match/match-state";

interface LobbyViewProps {
  state: MatchClientState;
  onLeave: () => void;
}

const AMBIENT_DESKTOP =
  "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.30), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(124,92,255,0.15), transparent 50%)";
const AMBIENT_MOBILE = "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.30), transparent 55%)";

const SEATS = 10;

export function LobbyView({ state, onLeave }: LobbyViewProps) {
  const t = useTranslations("match.lobby");
  const tStart = useTranslations("match.transition.start");
  const remaining = useCountdown(state.lobbyStartsAt, state.serverTimeOffset);
  const filled = state.players.length;
  const isFull = filled >= SEATS;

  const slots = Array.from({ length: SEATS }, (_, i) => state.players[i] ?? null);

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
              ◆ {tStart("room")}
            </span>
            <span className="bg-fg-3 h-1 w-1 rounded-full" />
            <span className="text-fg-3 font-mono text-[10px] tracking-[0.2em]">
              {tStart("rankedRange")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isFull && (
              <Button variant="ghost" size="sm" onClick={onLeave}>
                {t("leave")}
              </Button>
            )}
            <span className="text-danger flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em]">
              <span
                aria-hidden
                className="bg-danger h-1.5 w-1.5 rounded-full"
                style={{ boxShadow: "0 0 8px #FF4D6D" }}
              />
              LIVE
            </span>
          </div>
        </div>

        {/* Main */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-14">
          <div className="text-center">
            <p className="tracking-widest3 text-violet-light mb-3.5 font-mono text-[11px] font-bold">
              ◆ {t("badge")}
            </p>
            <h1 className="font-display m-0 text-balance text-[64px] font-bold leading-[0.95] tracking-[-0.035em]">
              {isFull ? t("titleStarting") : t("title")}
            </h1>
            {!isFull && (
              <p className="text-fg-3 mt-3 text-sm">
                {t("waiting", { remaining: SEATS - filled })}
              </p>
            )}
          </div>

          {/* Roster — 10 in a row */}
          <div className="flex justify-center gap-3.5">
            {slots.map((p, i) => (
              <SlotBig
                key={p?.userId ?? `empty-${i}`}
                player={p}
                isSelf={p?.userId === state.selfId}
                youLabel={tStart("you")}
                index={i}
              />
            ))}
          </div>

          {/* Countdown + brief — only when full */}
          {isFull && (
            <div
              className="mt-3 grid w-full max-w-[800px] items-center gap-8"
              style={{ gridTemplateColumns: "auto 1fr" }}
            >
              <div className="flex flex-col items-center gap-2.5">
                <div className="text-fg-3 font-mono text-[10px] font-bold tracking-[0.25em]">
                  {t("startsIn")}
                </div>
                <TransitionCountdown
                  value={remaining.toString().padStart(2, "0")}
                  tint="#A18BFF"
                  size={88}
                />
              </div>
              <NextPhaseBrief phase={1} />
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] bg-black/30 px-14 py-4">
          <span className="text-fg-3 font-mono text-[10px] tracking-[0.2em]">{tStart("tip")}</span>
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
            ◆ {tStart("roomShort")}
          </span>
          <div className="flex items-center gap-2.5">
            {!isFull && (
              <button
                type="button"
                onClick={onLeave}
                className="text-fg-3 hover:text-fg-1 cursor-pointer font-mono text-[9px] tracking-[0.15em]"
              >
                {t("leave")}
              </button>
            )}
            <span className="text-danger flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.25em]">
              <span aria-hidden className="bg-danger h-[5px] w-[5px] rounded-full" />
              LIVE
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-[22px] pb-6">
          <div className="text-center">
            <p className="text-violet-light mb-2 font-mono text-[9px] font-bold tracking-[0.35em]">
              ◆ {t("badge")}
            </p>
            <h1 className="font-display m-0 text-balance text-[30px] font-bold leading-[0.95] tracking-[-0.03em]">
              {isFull ? t("titleStarting") : t("title")}
            </h1>
            {!isFull && (
              <p className="text-fg-3 mt-2 text-xs">
                {t("waiting", { remaining: SEATS - filled })}
              </p>
            )}
          </div>

          {/* 5×2 grid */}
          <div className="grid w-full grid-cols-5 gap-2">
            {slots.map((p, i) => (
              <SlotSmall
                key={p?.userId ?? `empty-${i}`}
                player={p}
                isSelf={p?.userId === state.selfId}
                youLabel={tStart("you")}
                index={i}
              />
            ))}
          </div>

          {isFull && (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="text-fg-3 font-mono text-[9px] font-bold tracking-[0.25em]">
                  {t("startsIn")}
                </div>
                <TransitionCountdown
                  value={remaining.toString().padStart(2, "0")}
                  tint="#A18BFF"
                  size={64}
                />
              </div>
              <div className="w-full">
                <NextPhaseBrief phase={1} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Slots ──────────────────────────────────────────────────────────
function SlotBig({
  player,
  isSelf,
  youLabel,
  index,
}: {
  player: { userId: string; name: string; avatarId: number; score: number } | null;
  isSelf: boolean;
  youLabel: string;
  index: number;
}) {
  const ring = isSelf
    ? "linear-gradient(135deg, #FFD166, #FF8B5C)"
    : "linear-gradient(135deg, #7C5CFF, #5EC2FF)";

  if (!player) {
    return (
      <div className="flex w-[72px] flex-col items-center gap-2">
        <div className="rounded-[14px] p-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.02]">
            <span aria-hidden className="text-fg-4 text-[18px] opacity-40">
              ◌
            </span>
          </div>
        </div>
        <div className="h-4" />
      </div>
    );
  }

  return (
    <div
      className="itp-pulse-in flex w-[72px] flex-col items-center gap-2"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative">
        <div className="rounded-[14px] p-0.5" style={{ background: ring }}>
          <div className="bg-surface-0 overflow-hidden rounded-xl">
            <QAAvatar rounded={false} name={player.name} seed={player.avatarId} size={64} />
          </div>
        </div>
        {isSelf && (
          <div
            className="rounded-pill text-surface-0 absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.2em]"
            style={{ background: "linear-gradient(135deg, #FFD166, #FF8B5C)" }}
          >
            {youLabel}
          </div>
        )}
      </div>
      <div className="font-display max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium text-white">
        {player.name}
      </div>
    </div>
  );
}

function SlotSmall({
  player,
  isSelf,
  youLabel,
  index,
}: {
  player: { userId: string; name: string; avatarId: number } | null;
  isSelf: boolean;
  youLabel: string;
  index: number;
}) {
  const ring = isSelf
    ? "linear-gradient(135deg, #FFD166, #FF8B5C)"
    : "linear-gradient(135deg, #7C5CFF, #5EC2FF)";

  if (!player) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="rounded-[10px] p-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.02]">
            <span aria-hidden className="text-fg-4 text-[14px] opacity-40">
              ◌
            </span>
          </div>
        </div>
        <div className="h-3" />
      </div>
    );
  }

  return (
    <div
      className="itp-pulse-in flex flex-col items-center gap-1"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="rounded-[10px] p-0.5" style={{ background: ring }}>
        <div className="bg-surface-0 overflow-hidden rounded-lg">
          <QAAvatar name={player.name} seed={player.avatarId} size={48} />
        </div>
      </div>
      <div
        className="max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[8px] tracking-[0.05em]"
        style={{ color: isSelf ? "#FFD166" : "var(--fg-2)" }}
      >
        {isSelf ? youLabel : player.name}
      </div>
    </div>
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
