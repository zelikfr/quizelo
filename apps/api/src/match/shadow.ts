import { MATCH_CONFIG } from "./config";
import type { ShadowUserRow } from "./shadow-pool";
import type { MatchPlayer } from "./types";

export interface ShadowProfile {
  /** Probability this shadow answers correctly on a given question (0..1). */
  accuracy: number;
  /** Mean response time in ms. */
  meanResponseMs: number;
  /** Std dev of response time in ms. */
  stdResponseMs: number;
}

const PROFILES: ShadowProfile[] = [
  { accuracy: 0.78, meanResponseMs: 4500, stdResponseMs: 1500 },
  { accuracy: 0.65, meanResponseMs: 6000, stdResponseMs: 2000 },
  { accuracy: 0.55, meanResponseMs: 7500, stdResponseMs: 2500 },
  { accuracy: 0.7, meanResponseMs: 5500, stdResponseMs: 1800 },
  { accuracy: 0.6, meanResponseMs: 7000, stdResponseMs: 2200 },
];

/**
 * Build a shadow `MatchPlayer` from a DB-backed shadow user. The user
 * row is acquired upstream from `shadowPool.acquire()`; this builder
 * just stamps in the per-match runtime fields (seat, lives, etc.).
 *
 * The `MatchPlayer.locale` is the room default, not the shadow's
 * stored locale — the room is locale-mixed and shadows are server-
 * driven, so pinning to the room locale keeps scoring deterministic.
 */
export function buildShadowPlayer(opts: {
  user: ShadowUserRow;
  seat: number;
  locale: string;
}): MatchPlayer {
  const { user, seat, locale } = opts;
  const display = user.displayName ?? user.name ?? user.handle ?? "shadow";
  return {
    userId: user.id,
    seat,
    name: display,
    handle: user.handle,
    avatarId: user.avatarId ?? 0,
    locale,
    status: "active",
    score: 0,
    streak: 0,
    lives: MATCH_CONFIG.phase3.startingLives,
    skipped: false,
    lastScoreReachedAt: 0,
    eliminatedAt: null,
    peakScore: 0,
    phase2Index: 0,
    isShadow: true,
    activeBoost: null,
  };
}

export function shadowProfileFor(player: MatchPlayer): ShadowProfile {
  return PROFILES[player.seat % PROFILES.length]!;
}

/** Roll a shadow's response — returns choice id + response time. */
export function shadowAnswer(
  player: MatchPlayer,
  choiceIds: string[],
  correctIdx: number,
  timeLimitMs: number,
  rand: () => number,
): { choiceId: string; responseMs: number } {
  const profile = shadowProfileFor(player);

  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  let responseMs = Math.round(profile.meanResponseMs + z * profile.stdResponseMs);
  responseMs = Math.max(800, Math.min(timeLimitMs - 200, responseMs));

  const correct = rand() < profile.accuracy;
  const choiceIdx = correct
    ? correctIdx
    : pickWrong(correctIdx, choiceIds.length, rand);
  return { choiceId: choiceIds[choiceIdx]!, responseMs };
}

function pickWrong(correctIdx: number, total: number, rand: () => number): number {
  if (total <= 1) return correctIdx;
  let idx = Math.floor(rand() * (total - 1));
  if (idx >= correctIdx) idx += 1;
  return idx;
}
