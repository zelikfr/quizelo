"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { playSfx } from "@/lib/sound/engine";
import { useMatchSound } from "@/lib/sound/use-match-sound";
import { useMatchSocket } from "@/match/use-match-socket";
import { SoundControls } from "./SoundControls";
import { DefeatView } from "./views/DefeatView";
import { FinaleWaitingView } from "./views/FinaleWaitingView";
import { LobbyView } from "./views/LobbyView";
import { QuestionView } from "./views/QuestionView";
import { ResultsView } from "./views/ResultsView";
import { TransitionView } from "./views/TransitionView";

interface MatchScreenProps {
  matchId: string;
}

export function MatchScreen({ matchId }: MatchScreenProps) {
  const t = useTranslations("match.shell");
  const router = useRouter();
  const { state, connection, fatalReason, sendAnswer, sendPass, leave } =
    useMatchSocket(matchId);

  // The server closed the WS with a code we can't recover from
  // (match doesn't exist / GC'd, user kicked out, expired session).
  // Bounce instead of leaving the user on a frozen "Reconnexion" UI.
  // `superseded` (4003) means another tab took over the same match —
  // we deliberately don't redirect there; the user picks which tab
  // to keep.
  useEffect(() => {
    if (!fatalReason || fatalReason === "superseded") return;
    if (fatalReason === "unauthorized") {
      router.replace(`/auth/login?from=/match/${matchId}`);
      return;
    }
    // not_in_match / not_found → home
    router.replace("/home");
  }, [fatalReason, matchId, router]);

  // Drive the music + reveal/transition/match-end SFX from match state.
  useMatchSound(state);

  // Click feedback when picking an answer or pressing pass.
  const handleAnswer = useCallback(
    (questionIndex: number, choiceId: string) => {
      playSfx("click");
      sendAnswer(questionIndex, choiceId);
    },
    [sendAnswer],
  );
  const handlePass = useCallback(
    (questionIndex: number) => {
      playSfx("click");
      sendPass(questionIndex);
    },
    [sendPass],
  );

  const self = state.selfId
    ? state.players.find((p) => p.userId === state.selfId)
    : null;

  // ── Eliminated detection ──────────────────────────────────────
  const phase = state.status;
  const phase3Eliminated =
    !!self &&
    (self.status === "eliminated_p3" ||
      (phase === "phase3" && self.status === "active" && self.lives <= 0));
  const phase12Eliminated =
    !!self &&
    !phase3Eliminated &&
    (self.status === "eliminated_p1" ||
      self.status === "eliminated_p2" ||
      self.status === "left" ||
      (phase === "phase1" && self.status === "active" && self.lives <= 0));

  // Phase 3 elimination → spectator-style "waiting for results"
  // The WS stays open so we receive `match_end` and switch to ResultsView.
  const showFinaleWaiting = phase3Eliminated && phase !== "results";

  // Phase 1/2 elimination → frozen DefeatView, WS closed.
  const showDefeat = phase12Eliminated && phase !== "results";

  // Snapshot the state for DefeatView so it never mutates after elimination.
  const wsFrozenRef = useRef(false);
  const defeatSnapshotRef = useRef<typeof state | null>(null);
  if (showDefeat && !defeatSnapshotRef.current) {
    defeatSnapshotRef.current = state;
  }
  useEffect(() => {
    if (showDefeat && !wsFrozenRef.current) {
      wsFrozenRef.current = true;
      leave();
    }
  }, [showDefeat, leave]);

  const goHome = () => {
    if (!wsFrozenRef.current) {
      wsFrozenRef.current = true;
      try {
        leave();
      } catch {
        /* noop */
      }
    }
    router.push("/home");
  };

  return (
    <main className="bg-surface-1 qa-scan relative isolate min-h-screen overflow-x-clip">
      <div className="qa-grid-bg" aria-hidden />

      <SoundControls className="absolute top-3 right-3 z-50" />

      {connection !== "open" &&
        !wsFrozenRef.current &&
        !showDefeat &&
        // Skip while we're already routing the user away from a dead
        // match — showing "Reconnexion" then flashing /home would feel
        // glitchy.
        !fatalReason &&
        state.status !== "results" && (
          <div className="bg-surface-2/90 border-white/[0.08] text-fg-3 tracking-widest2 absolute top-3 left-1/2 z-50 -translate-x-1/2 rounded-pill border px-3 py-1 font-mono text-[10px] backdrop-blur">
            {connection === "connecting" && t("connecting")}
            {connection === "closed" && t("disconnected")}
            {connection === "error" && t("error")}
          </div>
        )}

      <div className="relative z-10">
        {showDefeat ? (
          <DefeatView
            state={defeatSnapshotRef.current ?? state}
            onLeave={goHome}
          />
        ) : showFinaleWaiting ? (
          <FinaleWaitingView state={state} onLeave={goHome} />
        ) : (
          <>
            {state.status === "lobby" && <LobbyView state={state} onLeave={goHome} />}
            {(state.status === "phase1" ||
              state.status === "phase2" ||
              state.status === "phase3") && (
              <QuestionView
                state={state}
                onAnswer={handleAnswer}
                onPass={handlePass}
              />
            )}
            {(state.status === "transition_p1_p2" ||
              state.status === "transition_p2_p3") && (
              <TransitionView state={state} />
            )}
            {state.status === "results" && <ResultsView state={state} />}
          </>
        )}
      </div>
    </main>
  );
}
