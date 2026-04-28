import { MATCH_CONFIG } from "./config";

const { score: SC } = MATCH_CONFIG;

export interface Phase1ScoreInputs {
  isCorrect: boolean;
  responseMs: number | null;
  timeLimitMs: number;
  prevStreak: number;
}

export interface Phase1ScoreResult {
  delta: number;
  newStreak: number;
}

/**
 * Phase 1: base + speed bonus + streak (no penalty for wrong).
 */
export function scorePhase1({
  isCorrect,
  responseMs,
  timeLimitMs,
  prevStreak,
}: Phase1ScoreInputs): Phase1ScoreResult {
  if (!isCorrect) {
    return { delta: 0, newStreak: 0 };
  }

  let delta = SC.phase1Base;

  if (responseMs !== null && timeLimitMs > 0) {
    const ratio = Math.max(0, 1 - responseMs / timeLimitMs);
    delta += Math.round(SC.phase1SpeedBonus * ratio);
  }

  const newStreak = prevStreak + 1;
  if (newStreak > 3) {
    delta += SC.phase1StreakBonus * (newStreak - 3);
  }

  return { delta, newStreak };
}

/**
 * Phase 2: simple +1 / -1 / 0 (no answer).
 */
export function scorePhase2(opts: {
  isCorrect: boolean;
  hasAnswer: boolean;
}): { delta: number } {
  if (!opts.hasAnswer) return { delta: 0 };
  return { delta: opts.isCorrect ? SC.phase2Correct : SC.phase2Wrong };
}
