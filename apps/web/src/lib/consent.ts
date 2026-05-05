"use client";

/**
 * Cookie consent storage. Persists in localStorage rather than a
 * cookie so we don't need to set a cookie *to record consent for
 * cookies* (legal limbo).
 *
 * Schema (versioned so we can re-prompt on policy change):
 *   {
 *     v: 1,
 *     ts: 1715000000000,
 *     analytics: boolean,
 *     marketing: boolean,
 *   }
 *
 * "essential" is implicit and always true — Auth.js cookies and
 * Stripe payment iframes don't require consent under ePrivacy
 * because they're strictly necessary for the service the user
 * requested.
 */

const KEY = "quizelo.consent.v1";
/** ePrivacy-aligned re-prompt window: 13 months. */
const TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000;

export interface ConsentState {
  v: 1;
  ts: number;
  analytics: boolean;
  marketing: boolean;
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.v !== 1) return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(
  next: Omit<ConsentState, "v" | "ts">,
): ConsentState {
  const value: ConsentState = {
    v: 1,
    ts: Date.now(),
    analytics: !!next.analytics,
    marketing: !!next.marketing,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage might be disabled in private mode; the banner just
    // re-shows on every reload, which is the safe failure mode.
  }
  // Notify any listeners (the cookie banner itself, the re-open
  // button, future analytics gates) so they don't have to poll.
  window.dispatchEvent(new CustomEvent("quizelo:consent-change"));
  return value;
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent("quizelo:consent-change"));
}
