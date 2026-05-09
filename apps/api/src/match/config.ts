/** Per-phase tuning. Tweak here to balance pacing. */
export const MATCH_CONFIG = {
  /** Total seats per match. */
  size: 10,

  lobby: {
    /**
     * Total budget for shadows to trickle in if no real players show
     * up. Wider than the visible countdown so arrivals feel paced —
     * if this is too tight the bot cadence reads as obviously
     * mechanical (one every ~1.5s).
     */
    silentFillMs: 20_000,
    /**
     * Minimum gap before the FIRST shadow arrives, so a real player
     * who just opened the lobby has a beat alone before the room
     * starts filling.
     */
    firstShadowMinMs: 900,
    firstShadowMaxMs: 2_400,
    /** Once full (10/10), the visible "starts in" countdown. */
    startCountdownMs: 15_000,
    /** Lobby tick (broadcast presence) interval (ms). */
    tickMs: 750,
  },

  phase1: {
    /** Fixed 10-question qualification round. */
    questionCount: 10,
    questionMs: 15_000,
    revealMs: 2_000,
    /** Top N by score advance to phase 2. */
    advancing: 5,
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
  transitionMs: 15_000,

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
    eliminatedP2: 0, // ranks 4-5 — making it to phase 2 is neutral
    eliminatedP1: -15, // ranks 6-10
  },
} as const;

export type MatchConfig = typeof MATCH_CONFIG;
