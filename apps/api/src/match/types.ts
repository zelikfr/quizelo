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
  locale: string;
  seed: string;
  players: MatchPlayer[];
  /** Sequential pool of questions used across all phases. */
  questionPool: string[];
  questions: Map<string, DbQuestion>;

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

  /** Pending events to persist at next phase boundary. */
  answersBuffer: AnswerRecord[];

  /** ms epoch — set when the lobby is full and the 5s countdown is running. */
  lobbyStartsAt: number | null;

  createdAt: number;
}
