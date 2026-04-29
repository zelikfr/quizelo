"use client";

import { useEffect, useRef } from "react";
import type { MatchClientState } from "@/match/match-state";
import {
  playSfx,
  setMusicScene,
  unlockOnFirstGesture,
} from "./engine";

/**
 * Drive the audio engine from the match state machine.
 *
 *   Music
 *   - lobby                      → lobby track
 *   - phase1 / 2 / 3 / transitions → match track
 *   - results                    → fade out (let SFX breathe)
 *
 *   SFX
 *   - reveal: correct / wrong / lifeLost (lifeLost wins over wrong)
 *   - status flips into transition_*  → phaseEnd
 *   - lobby roster fills (status flips to phase1 from lobby) → handled by phaseEnd? no — separate
 *   - results: victory (rank ≤ 3) / defeat (otherwise)
 */
export function useMatchSound(state: MatchClientState): void {
  /* First-gesture unlock — runs once per page mount */
  useEffect(() => {
    const cleanup = unlockOnFirstGesture();
    return cleanup;
  }, []);

  /* ── Music scene driven by status (and self elimination) ──────────────── */
  const self =
    state.selfId != null
      ? state.players.find((p) => p.userId === state.selfId)
      : null;
  const selfStatus = self?.status ?? null;
  const eliminated =
    selfStatus === "eliminated_p1" ||
    selfStatus === "eliminated_p2" ||
    selfStatus === "eliminated_p3" ||
    selfStatus === "left";

  useEffect(() => {
    if (eliminated) {
      // The match is over for this player → cut the music so the defeat /
      // finale-waiting screen is silent, and a later user gesture (e.g. the
      // Quitter button) can't accidentally resume a suspended audio context.
      setMusicScene(null);
      return;
    }
    switch (state.status) {
      case "lobby":
        setMusicScene("lobby");
        break;
      case "phase1":
        setMusicScene("phase1");
        break;
      // The transition into phase 2 already escalates the music — it's the
      // moment the player crosses the threshold, not when phase 2 questions
      // start coming. Same idea for phase 3.
      case "transition_p1_p2":
      case "phase2":
        setMusicScene("phase2");
        break;
      case "transition_p2_p3":
      case "phase3":
        setMusicScene("phase3");
        break;
      default:
        // results / anything else → silent so the match-end SFX can breathe
        setMusicScene(null);
    }
  }, [state.status, eliminated]);

  /* ── Stop music on unmount (navigation away from the match) ───────────── */
  useEffect(() => {
    return () => {
      setMusicScene(null);
    };
  }, []);

  /* ── Reveal SFX (correct / wrong / lifeLost) ──────────────────────────── */
  const lastRevealKey = useRef<string | null>(null);
  useEffect(() => {
    const reveal = state.reveal;
    if (!reveal || !state.selfId) return;

    const key = `${state.status}:${reveal.questionIndex}`;
    if (lastRevealKey.current === key) return;
    lastRevealKey.current = key;

    const me = reveal.outcomes.find((o) => o.userId === state.selfId);
    if (!me || me.skipped) return;

    if (me.livesDelta < 0) {
      playSfx("lifeLost");
    } else if (me.isCorrect) {
      playSfx("correct");
    } else if (me.chosenChoiceId !== null) {
      playSfx("wrong");
    }
  }, [state.reveal, state.selfId, state.status]);

  /* ── Phase-end whoosh ─────────────────────────────────────────────────── */
  const prevStatus = useRef<MatchClientState["status"] | null>(null);
  useEffect(() => {
    const prev = prevStatus.current;
    const next = state.status;
    prevStatus.current = next;
    if (prev === null || prev === next) return;

    if (
      (prev === "phase1" && next === "transition_p1_p2") ||
      (prev === "phase2" && next === "transition_p2_p3")
    ) {
      playSfx("phaseEnd");
    }
  }, [state.status]);

  /* ── Match end fanfare ────────────────────────────────────────────────── */
  const matchEndPlayed = useRef(false);
  useEffect(() => {
    if (state.status !== "results") return;
    if (matchEndPlayed.current) return;
    if (!state.podium) return;

    matchEndPlayed.current = true;

    if (!state.selfId) {
      playSfx("defeat");
      return;
    }
    const me = state.podium.find((p) => p.userId === state.selfId);
    if (me && me.rank <= 3) {
      playSfx("victory");
    } else {
      playSfx("defeat");
    }
  }, [state.status, state.podium, state.selfId]);
}
