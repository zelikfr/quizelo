"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useMatchSocket } from "@/match/use-match-socket";
import { DefeatView } from "./views/DefeatView";
import { LobbyView } from "./views/LobbyView";
import { QuestionView } from "./views/QuestionView";
import { ResultsView } from "./views/ResultsView";
import { TransitionView } from "./views/TransitionView";

interface MatchScreenProps {
  matchId: string;
}

const ELIMINATED_STATUSES = new Set([
  "eliminated_p1",
  "eliminated_p2",
  "eliminated_p3",
  "left",
]);

export function MatchScreen({ matchId }: MatchScreenProps) {
  const t = useTranslations("match.shell");
  const router = useRouter();
  const { state, connection, sendAnswer, sendBonus, sendPass, leave } =
    useMatchSocket(matchId);

  const self = state.selfId
    ? state.players.find((p) => p.userId === state.selfId)
    : null;
  // Switch to defeat the instant lives hit zero (phase 1 / phase 3) — the
  // server only re-broadcasts the new status on the next message that
  // carries `players[]`, so we'd otherwise stay on the question screen for
  // ~2s of reveal pause.
  const livesEliminated =
    !!self &&
    self.lives <= 0 &&
    (state.status === "phase1" || state.status === "phase3");
  const selfEliminated = self
    ? ELIMINATED_STATUSES.has(self.status) || livesEliminated
    : false;
  const showDefeat = selfEliminated && state.status !== "results";

  // ── Freeze the WS feed once the local player is out. We keep the page on
  //    the DefeatView (so they see the "you're out" screen) but stop receiving
  //    further server broadcasts that would make the page mutate underneath them.
  const wsFrozenRef = useRef(false);
  // Snapshot of the state at the moment of elimination — DefeatView is
  // rendered from this snapshot so it never mutates after the player is out.
  const defeatSnapshotRef = useRef<typeof state | null>(null);
  if (selfEliminated && !defeatSnapshotRef.current) {
    defeatSnapshotRef.current = state;
  }
  useEffect(() => {
    if (selfEliminated && !wsFrozenRef.current) {
      wsFrozenRef.current = true;
      leave();
    }
  }, [selfEliminated, leave]);

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
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-grid-bg" aria-hidden />

      {/* Hide the connection banner once the page is intentionally frozen
          (otherwise it'd flash "Disconnected" the moment we close the WS). */}
      {connection !== "open" && !wsFrozenRef.current && (
        <div className="absolute top-3 left-1/2 z-50 -translate-x-1/2 rounded-pill border border-white/[0.08] bg-surface-2/90 px-3 py-1 font-mono text-[10px] tracking-widest2 text-fg-3 backdrop-blur">
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
        ) : (
          <>
            {state.status === "lobby" && <LobbyView state={state} onLeave={goHome} />}
            {(state.status === "phase1" ||
              state.status === "phase2" ||
              state.status === "phase3") && (
              <QuestionView
                state={state}
                onAnswer={sendAnswer}
                onBonus={sendBonus}
                onPass={sendPass}
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
