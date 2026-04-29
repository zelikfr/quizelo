"use client";

import { useEffect } from "react";
import { unlockOnFirstGesture } from "@/lib/sound/engine";

/**
 * Mounted at the locale-layout level so it lives for the entire client-side
 * session and never unmounts on page navigation. Attaches one-shot listeners
 * to `pointerdown` / `keydown` / `touchstart` so the very first click
 * anywhere in the app — even the "Jouer" button on /home, before the match
 * page is mounted — boots the audio engine. By the time the user lands in
 * the lobby, Tone.js is already loaded and the lobby music can start.
 */
export function SoundUnlock() {
  useEffect(() => {
    const cleanup = unlockOnFirstGesture();
    return cleanup;
  }, []);
  return null;
}
