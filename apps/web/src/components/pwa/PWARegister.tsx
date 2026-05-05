"use client";

import { useEffect } from "react";

/**
 * Mounts a service-worker registration on first paint. Only fires
 * in production — the SW caches `_next/static/*` aggressively and
 * would fight Next.js dev HMR otherwise. Failures are swallowed
 * with a console.warn; an offline-incapable build is a degraded
 * experience, not a broken one.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // Defer until the page is idle so SW work doesn't fight initial
    // hydration. `requestIdleCallback` isn't in Safari, fall back to
    // a setTimeout.
    const ric =
      (window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
      }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1));
    const handle = ric(() => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn("[pwa] sw register failed:", err);
        });
    });

    return () => {
      const cic = (window as Window & {
        cancelIdleCallback?: (h: number) => void;
      }).cancelIdleCallback;
      if (cic && typeof handle === "number") cic(handle);
    };
  }, []);

  return null;
}
