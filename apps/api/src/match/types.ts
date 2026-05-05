import type {
  MatchMode,
  MatchPhase,
  MatchStatus,
  PlayerStatus,
} from "@quizelo/protocol";

export interface DbQuestion {
  id: string;
  locale: string;
  category: string;
  difficulty: string;
  prompt: string;
  choices: Array<{ id: string; label: string }>;
  correctChoiceId: string;
  timeLimit: number;
  /** Target ELO 600–2400; null when not yet classified. */
  eloTarget: number | null;
}

/** A player slot inside a running match — real user or shadow. */
export interface MatchPlayer {
  userId: string;
  /** seat 0..N-1 */
  seat: number;
  name: string;
  handle: string | null;
  avatarId: number;
  /**
   * The player's preferred locale ("fr", "en"…). Lobbies are now
   * mixed-locale — the matchmaker buckets by mode only — so each
   * player's payload is rendered against their personal `locale`
   * while everyone advances through the same shared fact pool.
   * Shadows are seeded with a synthetic locale at creation; it
   * doesn't really matter (they're server-driven) but the room
   * scoring code keys lookups on it.
   */
  locale: string;
  status: PlayerStatus;
  score: number;
  streak: number;
  lives: number;
  /** True if the player passed (phase 2) the current question. */
  skipped: boolean;
  /** Server-recorded timestamp when score reached its current value
   *  (used as phase-2 tiebreaker). */
  lastScoreReachedAt: number;
  /** Server epoch ms when the player was eliminated (status → eliminated_*).
   *  Used to compute final ranks: later death = higher placement, score
   *  is only a tiebreaker for simultaneous eliminations. */
  eliminatedAt: number | null;
  /** Highest score reached during the match — kept around for the score
   *  tiebreaker even after phase 2 resets `score`. */
  peakScore: number;
  /** Phase 2 — each player advances through the question pool independently. */
  phase2Index: number;
  /** Shadows are server-driven — no real WS connection. */
  isShadow: boolean;
  /**
   * Optional boost the player activated before joining the match
   * (consumed from their inventory at enqueue time). Applied at
   * settlement:
   *   - "double-elo": multiplies the player's eloDelta by 2.
   *   - "shield"    : floors a negative eloDelta to 0.
   * Ignored on quick matches (eloDelta is already 0 there).
   */
  activeBoost: "double-elo" | "shield" | null;
}

/** Every answer captured during the match — flushed to DB at phase end. */
export interface AnswerRecord {
  userId: string;
  questionId: string;
  questionIndex: number;
  phase: MatchPhase;
  chosenChoiceId: string | null;
  isCorrect: boolean;
  responseMs: number | null;
  scoreDelta: number;
  answeredAt: Date;
}

export interface MatchState {
  matchId: string;
  status: MatchStatus;
  mode: MatchMode;
  /**
   * The room's "default" locale — used as a fallback for shadows and
   * for any code path that needs a single locale (e.g. persistence
   * writes when a player has no locale of their own). Real players
   * each carry their own `MatchPlayer.locale`, set at enqueue time
   * from the user's web-app locale.
   */
  locale: string;
  seed: string;
  players: MatchPlayer[];
  /**
   * Sequential pool of FACT STEMS (shared suffix without the locale
   * prefix, e.g. `web-easy-051`) used across all phases. The same
   * pool serves every player; what differs is the locale-specific
   * `DbQuestion` we render to them.
   */
  questionPool: string[];
  /**
   * stem → locale → DbQuestion. Built at lobby creation: only stems
   * where every supported locale has an active row are included, so
   * the runtime can serve each player the variant matching their
   * own `MatchPlayer.locale` regardless of who joined.
   */
  questionsByStem: Map<string, Map<string, DbQuestion>>;
  /**
   * Next index in `questionPool` that hasn't been served yet. Increments
   * as phase 1 / phase 3 ask questions, and jumps to the highest
   * phase2Index after phase 2 ends. Guarantees no question repeats
   * across phase 1 → 2 → 3 of the same match.
   */
  poolCursor: number;

  /** Currently active phase (undefined during lobby/transition/results). */
  currentPhase?: MatchPhase;
  /** Index into questionPool of the current question (undefined if none). */
  currentQuestionIndex?: number;
  /** Server epoch ms when the current question was issued. */
  currentQuestionStartedAt?: number;
  /** Server epoch ms when the current question deadline expires. */
  currentQuestionDeadline?: number;
  /** Set of userIds who already answered the current question. */
  currentAnswers: Map<
    string,
    { choiceId: string; responseMs: number; receivedAt: number }
  >;

  /** Phase 2 only: ms epoch when the global 60s clock ends. */
  phase2EndsAt?: number;

  /**
   * ms epoch when the current transition (between phases) ends — set
   * when entering `transition_p1_p2` / `transition_p2_p3`, cleared when
   * the next phase starts. Used to re-emit a `phase_end` with a still-
   * accurate `nextPhaseAt` to a reconnecting client mid-transition.
   */
  transitionEndsAt?: number;

  /**
   * Final podium snapshot — captured once the match enters `results`
   * so a client reconnecting before the room is GC'd can be told the
   * outcome instead of being shown a blank state.
   */
  lastPodium?: Array<{
    userId: string;
    rank: number;
    score: number;
    eloDelta: number;
  }>;

  /** Pending events to persist at next phase boundary. */
  answersBuffer: AnswerRecord[];

  /** ms epoch — set when the lobby is full and the 5s countdown is running. */
  lobbyStartsAt: number | null;

  createdAt: number;
}
