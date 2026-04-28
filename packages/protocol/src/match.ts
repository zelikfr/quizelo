import { z } from "zod";

// ─── Mode / phases / status ──────────────────────────────────────────
export const MatchMode = z.enum(["quick", "ranked"]);
export type MatchMode = z.infer<typeof MatchMode>;

export const MatchPhase = z.enum(["phase1", "phase2", "phase3"]);
export type MatchPhase = z.infer<typeof MatchPhase>;

export const MatchStatus = z.enum([
  "lobby",
  "phase1",
  "transition_p1_p2",
  "phase2",
  "transition_p2_p3",
  "phase3",
  "results",
  "abandoned",
]);
export type MatchStatus = z.infer<typeof MatchStatus>;

export const PlayerStatus = z.enum([
  "active",
  "eliminated_p1",
  "eliminated_p2",
  "eliminated_p3",
  "finalist",
  "winner",
  "left",
]);
export type PlayerStatus = z.infer<typeof PlayerStatus>;

// ─── Bonuses (phase 1 only) ──────────────────────────────────────────
export const BonusKind = z.enum(["fifty_fifty", "skip", "shield"]);
export type BonusKind = z.infer<typeof BonusKind>;

export const BonusInventory = z.object({
  fifty_fifty: z.number().int().min(0),
  skip: z.number().int().min(0),
  shield: z.number().int().min(0),
});
export type BonusInventory = z.infer<typeof BonusInventory>;

// ─── Public DTOs ─────────────────────────────────────────────────────
export const PublicPlayer = z.object({
  userId: z.string(),
  seat: z.number().int().min(0).max(9),
  name: z.string(),
  handle: z.string().nullable(),
  avatarId: z.number().int(),
  status: PlayerStatus,
  score: z.number().int(),
  streak: z.number().int(),
  lives: z.number().int(),
  bonuses: BonusInventory,
  isShadow: z.boolean(),
  isSelf: z.boolean().optional(),
});
export type PublicPlayer = z.infer<typeof PublicPlayer>;

export const PublicChoice = z.object({
  id: z.string(),
  label: z.string(),
});
export type PublicChoice = z.infer<typeof PublicChoice>;

export const PublicQuestion = z.object({
  index: z.number().int(),
  phase: MatchPhase,
  category: z.string(),
  prompt: z.string(),
  choices: z.array(PublicChoice),
  /** ms epoch — server-issued deadline for this question */
  deadline: z.number().int(),
});
export type PublicQuestion = z.infer<typeof PublicQuestion>;

// ─── Server → Client ─────────────────────────────────────────────────
export const ServerMessage = z.discriminatedUnion("type", [
  /** First message after WS handshake — full state. */
  z.object({
    type: z.literal("hello"),
    matchId: z.string(),
    selfId: z.string(),
    status: MatchStatus,
    mode: MatchMode,
    serverTime: z.number().int(),
    players: z.array(PublicPlayer),
  }),

  /**
   * Lobby presence broadcast.
   * `startsAt` is null while we're still waiting for players, and switches
   * to a 5s deadline once the lobby is full (10/10).
   */
  z.object({
    type: z.literal("lobby"),
    players: z.array(PublicPlayer),
    startsAt: z.number().int().nullable(),
  }),

  /** Phase begins — clients should switch UI. */
  z.object({
    type: z.literal("phase_start"),
    phase: MatchPhase,
    players: z.array(PublicPlayer),
    /** Phase-2 only: ms epoch when the global 60s clock hits zero. */
    phaseEndsAt: z.number().int().optional(),
  }),

  /**
   * Lightweight roster update — used in phase 2 to keep the live
   * leaderboard up to date as players progress at their own pace,
   * without resetting per-client question state.
   */
  z.object({
    type: z.literal("roster"),
    players: z.array(PublicPlayer),
  }),

  /** New question pushed. */
  z.object({
    type: z.literal("question"),
    question: PublicQuestion,
  }),

  /** Acknowledges that the server received your answer. Private to sender. */
  z.object({
    type: z.literal("answer_ack"),
    questionIndex: z.number().int(),
    locked: z.boolean(),
  }),

  /**
   * Per-question reveal — broadcast to all connected clients.
   * Outcomes carry post-question lives, score, and any consumed bonus.
   */
  z.object({
    type: z.literal("reveal"),
    questionIndex: z.number().int(),
    correctChoiceId: z.string(),
    outcomes: z.array(
      z.object({
        userId: z.string(),
        chosenChoiceId: z.string().nullable(),
        isCorrect: z.boolean(),
        skipped: z.boolean(),
        responseMs: z.number().int().nullable(),
        scoreDelta: z.number().int(),
        score: z.number().int(),
        livesDelta: z.number().int(),
        lives: z.number().int(),
        shieldUsed: z.boolean(),
      }),
    ),
  }),

  /**
   * Bonus activation outcome.
   *  - fifty_fifty: private to the activator, `hide` lists 2 wrong choiceIds
   *  - skip: private ack, server records skip in the next reveal
   *  - shield: private ack, server suppresses the next life loss
   */
  z.object({
    type: z.literal("bonus_result"),
    bonus: BonusKind,
    questionIndex: z.number().int(),
    hide: z.array(z.string()).optional(),
  }),

  /** End of a phase — survivors continue, others marked eliminated. */
  z.object({
    type: z.literal("phase_end"),
    phase: MatchPhase,
    survivors: z.array(z.string()), // userIds
    eliminated: z.array(z.string()),
    nextStatus: MatchStatus,
    nextPhaseAt: z.number().int(),
  }),

  /** Final podium + ELO deltas. */
  z.object({
    type: z.literal("match_end"),
    podium: z.array(
      z.object({
        userId: z.string(),
        rank: z.number().int(),
        score: z.number().int(),
        eloDelta: z.number().int(),
      }),
    ),
  }),

  z.object({ type: z.literal("pong"), ts: z.number().int() }),

  z.object({
    type: z.literal("error"),
    code: z.string(),
    message: z.string().optional(),
  }),
]);
export type ServerMessage = z.infer<typeof ServerMessage>;

// ─── Client → Server ─────────────────────────────────────────────────
export const ClientMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ready") }),

  z.object({
    type: z.literal("answer"),
    questionIndex: z.number().int(),
    choiceId: z.string(),
    clientTime: z.number().int(),
  }),

  /** Phase 2 only — skip the current question without scoring. */
  z.object({
    type: z.literal("pass"),
    questionIndex: z.number().int(),
  }),

  z.object({
    type: z.literal("use_bonus"),
    bonus: BonusKind,
    questionIndex: z.number().int(),
  }),

  z.object({ type: z.literal("ping") }),
  z.object({ type: z.literal("leave") }),
]);
export type ClientMessage = z.infer<typeof ClientMessage>;
