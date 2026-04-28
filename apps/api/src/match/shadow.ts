import { MATCH_CONFIG } from "./config";
import type { MatchPlayer } from "./types";

const NAMES = [
  "Nyra_92",
  "kovax",
  "Léa.S",
  "pixelorca",
  "M3RIDIAN",
  "tofu_king",
  "sun_yi",
  "Drelan",
  "auroraX",
  "raven",
  "echoNova",
  "tachy",
];

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

let counter = 0;

/** Build a shadow MatchPlayer. */
export function makeShadow(seat: number, rand: () => number): MatchPlayer {
  const idx = Math.floor(rand() * NAMES.length);
  const name = NAMES[idx] ?? "shadow";
  counter += 1;
  return {
    userId: `shadow:${counter.toString(36)}-${seat}`,
    seat,
    name,
    handle: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    avatarId: Math.floor(rand() * 10),
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
