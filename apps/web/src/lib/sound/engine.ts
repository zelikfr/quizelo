"use client";

/**
 * Public sound API — a façade.
 *
 * The actual Tone.js engine lives in `engine-impl.ts` and is loaded dynamically
 * only after a user gesture. This keeps the main bundle small and, more
 * importantly, ensures nothing audio-related runs during SSR / build, which
 * has bitten us before.
 *
 * Public surface (kept stable):
 *   - SfxName            — union of every effect name we can play
 *   - unlockOnFirstGesture()  — attach one-shot listeners that boot the engine
 *   - initAudio()             — force-init from a gesture handler
 *   - setMusicScene(scene)    — request the lobby / match loop, or silence
 *   - playSfx(name)           — fire-and-forget gameplay feedback
 */

import { getSfxMuted } from "./store";

export type SfxName =
  | "click"
  | "correct"
  | "wrong"
  | "lifeLost"
  | "phaseEnd"
  | "victory"
  | "defeat"
  | "lobbyJoin";

export type Scene = "lobby" | "phase1" | "phase2" | "phase3" | null;

let implPromise: Promise<typeof import("./engine-impl")> | null = null;
let pendingScene: Scene = null;

function loadImpl(): Promise<typeof import("./engine-impl")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ssr"));
  }
  if (!implPromise) {
    implPromise = import("./engine-impl").catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[sound] failed to load engine-impl", err);
      // Reset so a retry can happen later.
      implPromise = null;
      throw err;
    });
  }
  return implPromise;
}

/** Force-init the engine. Must be called from a user gesture handler. */
export async function initAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const m = await loadImpl();
    await m.initAudio();
    if (pendingScene !== null) {
      m.setMusicScene(pendingScene);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[sound] init failed", err);
  }
}

/** Attach one-shot listeners that boot audio on the first user interaction. */
export function unlockOnFirstGesture(): () => void {
  if (typeof window === "undefined") return () => {};
  // If init has already started, nothing to do.
  if (implPromise) return () => {};

  const onGesture = () => {
    void initAudio();
    cleanup();
  };
  const cleanup = () => {
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
    window.removeEventListener("touchstart", onGesture);
  };

  // Passive + bubble + once → never interferes with element click handlers.
  const opts: AddEventListenerOptions = { once: true, passive: true };
  window.addEventListener("pointerdown", onGesture, opts);
  window.addEventListener("keydown", onGesture, opts);
  window.addEventListener("touchstart", onGesture, opts);
  return cleanup;
}

/** Switch (or stop) the music loop. Safe to call before init. */
export function setMusicScene(scene: Scene): void {
  pendingScene = scene;
  if (typeof window === "undefined") return;
  if (!implPromise) return; // not loaded yet — applied during init
  implPromise
    .then((m) => m.setMusicScene(scene))
    .catch(() => {
      /* swallow */
    });
}

/** Fire a one-shot gameplay sound. Drops silently if not yet initialised. */
export function playSfx(name: SfxName): void {
  if (typeof window === "undefined") return;
  if (getSfxMuted()) return;
  if (!implPromise) return; // engine not loaded — first click drops, that's fine
  implPromise
    .then((m) => m.playSfx(name))
    .catch(() => {
      /* swallow */
    });
}
