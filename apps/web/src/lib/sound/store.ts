"use client";

import { useSyncExternalStore } from "react";

/**
 * Persisted sound preferences. Two independent toggles:
 *  - music: ambient soundtrack
 *  - sfx:   gameplay feedback (click, correct, wrong, …)
 */

const KEY_MUSIC = "quizelo:music_muted";
const KEY_SFX = "quizelo:sfx_muted";

type SoundState = {
  musicMuted: boolean;
  sfxMuted: boolean;
};

let state: SoundState = { musicMuted: false, sfxMuted: false };
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    state = {
      musicMuted: window.localStorage.getItem(KEY_MUSIC) === "1",
      sfxMuted: window.localStorage.getItem(KEY_SFX) === "1",
    };
  } catch {
    /* ignore — private mode etc. */
  }
}

function emit(): void {
  for (const l of listeners) l();
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_MUSIC, state.musicMuted ? "1" : "0");
    window.localStorage.setItem(KEY_SFX, state.sfxMuted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function getMusicMuted(): boolean {
  return state.musicMuted;
}

export function getSfxMuted(): boolean {
  return state.sfxMuted;
}

export function setMusicMuted(next: boolean): void {
  if (state.musicMuted === next) return;
  state = { ...state, musicMuted: next };
  persist();
  emit();
}

export function setSfxMuted(next: boolean): void {
  if (state.sfxMuted === next) return;
  state = { ...state, sfxMuted: next };
  persist();
  emit();
}

export function toggleMusicMuted(): void {
  setMusicMuted(!state.musicMuted);
}

export function toggleSfxMuted(): void {
  setSfxMuted(!state.sfxMuted);
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const SSR_DEFAULT: SoundState = { musicMuted: false, sfxMuted: false };

/** SSR-safe hook, returns the latest state. */
export function useSoundState(): SoundState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SSR_DEFAULT,
  );
}
