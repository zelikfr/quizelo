/** Per-phase tuning. Tweak here to balance pacing. */
export const MATCH_CONFIG = {
  /** Total seats per match. */
  size: 10,

  lobby: {
    /** Silent shadow-fill if the room hasn't filled with real players yet. */
    silentFillMs: 15_000,
    /** Once full (10/10), the visible "starts in" countdown. */
    startCountdownMs: 5_000,
    /** Lobby tick (broadcast presence) interval (ms). */
    tickMs: 750,
  },

  phase1: {
    questionMs: 15_000,
    revealMs: 2_000,
    /** Each player starts here. */
    startingLives: 3,
    /** Phase ends as soon as active players (lives>0) drops to this. */
    survivorThreshold: 5,
  },

  phase2: {
    /** Total time the phase runs, regardless of question count. */
    totalMs: 60_000,
    questionMs: 12_000,
    revealMs: 1_200,
    /** How many advance to phase 3. */
    finalists: 3,
  },

  phase3: {
    questionMs: 15_000,
    revealMs: 2_500,
    startingLives: 3,
  },

  /** Pause between phases (transition screens). */
  transitionMs: 4_000,

  /** Bonuses available — phase 1 only — granted at match start. */
  bonusInventory: {
    fifty_fifty: 1,
    skip: 1,
    shield: 1,
  },

  /** Score (phase 1 — speed + streak; phase 2 — flat ±1; phase 3 — score not used). */
  score: {
    phase1Base: 100,
    phase1SpeedBonus: 50,
    phase1StreakBonus: 25,
    phase2Correct: 1,
    phase2Wrong: -1,
  },

  /** Simple zero-sum ELO deltas (placeholder until real Elo). */
  elo: {
    rank1: 30,
    rank2: 15,
    rank3: 5,
    eliminatedP2: -5, // ranks 4-5
    eliminatedP1: -15, // ranks 6-10
  },
} as const;

export type MatchConfig = typeof MATCH_CONFIG;
