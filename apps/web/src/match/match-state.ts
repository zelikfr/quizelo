import type {
  MatchMode,
  MatchPhase,
  MatchStatus,
  PublicPlayer,
  PublicQuestion,
  ServerMessage,
} from "@quizelo/protocol";

export interface MatchClientState {
  matchId: string | null;
  selfId: string | null;
  mode: MatchMode;
  status: MatchStatus;
  serverTimeOffset: number;
  players: PublicPlayer[];
  /** Lobby: ms epoch when phase 1 starts (null while still waiting). */
  lobbyStartsAt: number | null;
  /** Phase 2: ms epoch when the 60s clock ends. */
  phase2EndsAt: number | null;
  /** Transition: ms epoch when next phase begins. */
  nextPhaseAt: number | null;
  lastPhaseEnd: {
    phase: MatchPhase;
    survivors: string[];
    eliminated: string[];
  } | null;
  question: PublicQuestion | null;
  /** Local quick-select state set the moment the user clicks. */
  answer: {
    questionIndex: number;
    choiceId: string | null;
    skipped: boolean;
    locked: boolean;
  } | null;
  /** 50/50 hides — choiceIds the local player should treat as removed. */
  fiftyFiftyHide: { questionIndex: number; hidden: string[] } | null;
  /** Last reveal payload — used for highlight + score deltas display. */
  reveal: {
    questionIndex: number;
    correctChoiceId: string;
    outcomes: Array<{
      userId: string;
      chosenChoiceId: string | null;
      isCorrect: boolean;
      skipped: boolean;
      scoreDelta: number;
      score: number;
      livesDelta: number;
      lives: number;
      shieldUsed: boolean;
    }>;
  } | null;
  podium: Array<{
    userId: string;
    rank: number;
    score: number;
    eloDelta: number;
  }> | null;
  /** Phase-2 self stats accumulated locally from reveal outcomes. */
  phase2Stats: { correct: number; wrong: number };
}

export const initialMatchState: MatchClientState = {
  matchId: null,
  selfId: null,
  mode: "quick",
  status: "lobby",
  serverTimeOffset: 0,
  players: [],
  lobbyStartsAt: null,
  phase2EndsAt: null,
  nextPhaseAt: null,
  lastPhaseEnd: null,
  question: null,
  answer: null,
  fiftyFiftyHide: null,
  reveal: null,
  podium: null,
  phase2Stats: { correct: 0, wrong: 0 },
};

export type MatchAction =
  | {
      type: "_local/answer_pick";
      questionIndex: number;
      choiceId: string;
    }
  | { type: "_local/skip"; questionIndex: number }
  | { type: "_local/use_bonus"; bonus: import("@quizelo/protocol").BonusKind }
  | { type: "_local/reset" }
  | { type: "server"; msg: ServerMessage };

export function matchReducer(
  state: MatchClientState,
  action: MatchAction,
): MatchClientState {
  if (action.type === "_local/reset") return initialMatchState;
  if (action.type === "_local/answer_pick") {
    return {
      ...state,
      answer: {
        questionIndex: action.questionIndex,
        choiceId: action.choiceId,
        skipped: false,
        locked: false,
      },
    };
  }
  if (action.type === "_local/skip") {
    return {
      ...state,
      answer: {
        questionIndex: action.questionIndex,
        choiceId: null,
        skipped: true,
        locked: false,
      },
    };
  }
  if (action.type === "_local/use_bonus") {
    if (!state.selfId) return state;
    return {
      ...state,
      players: state.players.map((p) => {
        if (p.userId !== state.selfId) return p;
        const next = Math.max(0, p.bonuses[action.bonus] - 1);
        return { ...p, bonuses: { ...p.bonuses, [action.bonus]: next } };
      }),
    };
  }

  const m = action.msg;
  switch (m.type) {
    case "hello":
      return {
        ...state,
        matchId: m.matchId,
        selfId: m.selfId,
        mode: m.mode,
        status: m.status,
        serverTimeOffset: Date.now() - m.serverTime,
        players: m.players,
      };

    case "lobby":
      return {
        ...state,
        status: "lobby",
        players: m.players,
        lobbyStartsAt: m.startsAt,
      };

    case "roster":
      // Lightweight player update — does NOT touch question/answer/reveal.
      return {
        ...state,
        players: state.players.map((p) => {
          const next = m.players.find((x) => x.userId === p.userId);
          if (!next) return p;
          return { ...p, ...next };
        }),
      };

    case "phase_start":
      return {
        ...state,
        status: m.phase,
        players: m.players,
        question: null,
        answer: null,
        reveal: null,
        fiftyFiftyHide: null,
        nextPhaseAt: null,
        phase2EndsAt: m.phaseEndsAt ?? state.phase2EndsAt,
        // Reset phase-2 stats when entering phase 2.
        phase2Stats:
          m.phase === "phase2" ? { correct: 0, wrong: 0 } : state.phase2Stats,
      };

    case "question":
      return {
        ...state,
        question: m.question,
        answer: null,
        reveal: null,
        fiftyFiftyHide: null,
      };

    case "answer_ack":
      if (!state.answer || state.answer.questionIndex !== m.questionIndex) return state;
      return { ...state, answer: { ...state.answer, locked: m.locked } };

    case "reveal": {
      // If we're in phase 2, update self stats counters.
      let phase2Stats = state.phase2Stats;
      if (state.status === "phase2" && state.selfId) {
        const self = m.outcomes.find((o) => o.userId === state.selfId);
        if (self && !self.skipped) {
          if (self.isCorrect) {
            phase2Stats = { ...phase2Stats, correct: phase2Stats.correct + 1 };
          } else if (self.chosenChoiceId !== null) {
            phase2Stats = { ...phase2Stats, wrong: phase2Stats.wrong + 1 };
          }
        }
      }
      return {
        ...state,
        reveal: {
          questionIndex: m.questionIndex,
          correctChoiceId: m.correctChoiceId,
          outcomes: m.outcomes,
        },
        phase2Stats,
        players: state.players.map((p) => {
          const out = m.outcomes.find((o) => o.userId === p.userId);
          if (!out) return p;
          return { ...p, score: out.score, lives: out.lives };
        }),
      };
    }

    case "bonus_result":
      if (m.bonus === "fifty_fifty" && m.hide) {
        return {
          ...state,
          fiftyFiftyHide: { questionIndex: m.questionIndex, hidden: m.hide },
        };
      }
      return state;

    case "phase_end":
      return {
        ...state,
        status: m.nextStatus,
        nextPhaseAt: m.nextPhaseAt,
        question: null,
        answer: null,
        reveal: null,
        lastPhaseEnd: {
          phase: m.phase,
          survivors: m.survivors,
          eliminated: m.eliminated,
        },
        players: state.players.map((p) => {
          if (m.eliminated.includes(p.userId)) {
            return {
              ...p,
              status:
                m.phase === "phase1"
                  ? "eliminated_p1"
                  : m.phase === "phase2"
                    ? "eliminated_p2"
                    : "eliminated_p3",
            };
          }
          if (m.phase === "phase2" && m.survivors.includes(p.userId)) {
            return { ...p, status: "finalist" };
          }
          return p;
        }),
      };

    case "match_end":
      return { ...state, status: "results", podium: m.podium };

    case "pong":
    case "error":
      return state;
  }
}
