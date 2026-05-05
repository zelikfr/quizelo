import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// ─── Enums ──────────────────────────────────────────────────────────
export const matchModeEnum = pgEnum("match_mode", ["quick", "ranked"]);
export const matchStatusEnum = pgEnum("match_status", [
  "lobby",
  "phase1",
  "transition_p1_p2",
  "phase2",
  "transition_p2_p3",
  "phase3",
  "results",
  "abandoned",
]);
export const matchPhaseEnum = pgEnum("match_phase", ["phase1", "phase2", "phase3"]);
export const playerStatusEnum = pgEnum("player_status", [
  "active",
  "eliminated_p1",
  "eliminated_p2",
  "eliminated_p3",
  "finalist",
  "winner",
  "left",
]);
export const questionDifficultyEnum = pgEnum("question_difficulty", [
  "easy",
  "medium",
  "hard",
  "expert",
]);

// ─── Question bank ──────────────────────────────────────────────────
export const questions = pgTable("questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  locale: text("locale").notNull(),
  category: text("category").notNull(),
  difficulty: questionDifficultyEnum("difficulty").notNull(),
  /**
   * Target ELO for this question. The match question picker uses this
   * to serve questions calibrated to the lobby's average ELO. Bands:
   *   <800 Bronze · 800-1199 Argent · 1200-1599 Or · 1600-1999 Platine ·
   *   2000-2399 Diamant · ≥2400 Élite.
   */
  eloTarget: integer("elo_target"),
  prompt: text("prompt").notNull(),
  /** array of { id, label } */
  choices: jsonb("choices").$type<Array<{ id: string; label: string }>>().notNull(),
  correctChoiceId: text("correct_choice_id").notNull(),
  explanation: text("explanation"),
  /** seconds to answer */
  timeLimit: integer("time_limit").default(15).notNull(),
  active: boolean("active").default(true).notNull(),
  /**
   * If non-null, the seed pipeline's shape-leak linter flagged this
   * question and forced `active = false`. The string is short
   * machine-readable code (e.g. "comma-only-on-correct") plus, where
   * applicable, the leaking token in quotes — surfaced to the
   * backoffice "Needs review" page so an admin can decide whether to
   * edit and re-activate, or delete (soft-delete via `active`).
   *
   * NULL on questions that never tripped the linter; the admin
   * toggle in /questions/[id] does NOT clear this on activation
   * (we want the historical reason to remain visible) — clearing
   * happens explicitly via the "approve" action.
   */
  lintReason: text("lint_reason"),
  /**
   * Set by the backoffice every time an admin acts on this question
   * (approve / edit / toggle / delete). Once non-null, the seed
   * pipeline treats the row as reviewed and stops overwriting
   * `lintReason` + `active` — admin decisions become sticky across
   * `pnpm db:seed` runs.
   *
   * If the curator later edits the bank source for this question in
   * a way that should re-trigger review, they can null this column
   * manually (or via a future "request re-review" admin action) so
   * the next seed re-applies the lint.
   */
  lintReviewedAt: timestamp("lint_reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Matches ────────────────────────────────────────────────────────
export const matches = pgTable("matches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  mode: matchModeEnum("mode").notNull(),
  status: matchStatusEnum("status").default("lobby").notNull(),
  locale: text("locale").default("fr").notNull(),
  /** server-authoritative seed so phases can be reproduced */
  seed: text("seed").notNull(),
  /** ordered list of question IDs picked at match start */
  questionIds: jsonb("question_ids").$type<string[]>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Match players ──────────────────────────────────────────────────
export const matchPlayers = pgTable(
  "match_players",
  {
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** seat 0..9 in the lobby */
    seat: integer("seat").notNull(),
    status: playerStatusEnum("status").default("active").notNull(),
    score: integer("score").default(0).notNull(),
    streak: integer("streak").default(0).notNull(),
    lives: integer("lives").default(3).notNull(),
    finalRank: integer("final_rank"),
    eloDelta: integer("elo_delta"),
    coinsDelta: integer("coins_delta"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (mp) => ({
    pk: primaryKey({ columns: [mp.matchId, mp.userId] }),
    seatUq: uniqueIndex("match_players_seat_uq").on(mp.matchId, mp.seat),
  }),
);

// ─── Answers (event log) ────────────────────────────────────────────
export const matchAnswers = pgTable("match_answers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  phase: matchPhaseEnum("phase").notNull(),
  /** index of the question within the match (0-based) */
  roundIndex: integer("round_index").notNull(),
  chosenChoiceId: text("chosen_choice_id"),
  isCorrect: boolean("is_correct").notNull(),
  /** ms from question reveal to answer */
  responseMs: integer("response_ms"),
  scoreDelta: integer("score_delta").default(0).notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ──────────────────────────────────────────────────────
export const matchesRelations = relations(matches, ({ many }) => ({
  players: many(matchPlayers),
  answers: many(matchAnswers),
}));

export const matchPlayersRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, { fields: [matchPlayers.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchPlayers.userId], references: [users.id] }),
}));

export const matchAnswersRelations = relations(matchAnswers, ({ one }) => ({
  match: one(matches, { fields: [matchAnswers.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchAnswers.userId], references: [users.id] }),
  question: one(questions, {
    fields: [matchAnswers.questionId],
    references: [questions.id],
  }),
}));

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type MatchPlayer = typeof matchPlayers.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type MatchAnswer = typeof matchAnswers.$inferSelect;
