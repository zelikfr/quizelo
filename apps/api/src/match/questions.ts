import { db, matchAnswers, questions, users } from "@quizelo/db";
import { and, eq, gte, inArray } from "drizzle-orm";
import type { MatchMode } from "@quizelo/protocol";
import { pickN } from "./random";
import type { DbQuestion, MatchState } from "./types";

/** Wide initial pool — narrowed by ELO when phase 1 starts. */
const WIDE_POOL_SIZE = 180;
/** How many questions a match actually consumes across phases. */
const NARROW_POOL_SIZE = 60;
/**
 * Half-width (ELO points) of the acceptance window per mode. Quick is
 * lenient because it's casual; ranked is tight so matched players see
 * questions calibrated to their skill.
 */
const WINDOW_BY_MODE: Record<MatchMode, number> = {
  quick: 500,
  ranked: 150,
};
/** Used when a question hasn't been classified yet. */
const FALLBACK_ELO = 1500;
/** Default avg when no real player ELO can be read (all-shadow lobby). */
const DEFAULT_LOBBY_ELO = 1500;
/** Locales that must be active for a fact to enter the cross-locale pool. */
const REQUIRED_LOCALES: readonly string[] = ["fr", "en"];

/**
 * The stem (= shared suffix) is everything after the leading
 * `<locale>-` part of a question id. `fr-web-easy-051` and
 * `en-web-easy-051` both stem-to `web-easy-051`. The stem is the
 * unit the runtime advances through; each player gets the locale
 * variant that matches their `MatchPlayer.locale`.
 *
 * Falls back to the full id if the format doesn't match — never
 * happens with seeded rows but keeps us safe against hand-inserted
 * ones.
 */
export function stemOf(questionId: string): string {
  const i = questionId.indexOf("-");
  return i >= 0 ? questionId.substring(i + 1) : questionId;
}

export interface BilingualPool {
  /** Ordered list of stems, deterministic from the seed. */
  stems: string[];
  /** stem → locale → question. Only stems with all required locales. */
  byStem: Map<string, Map<string, DbQuestion>>;
}

/**
 * Pull active questions for ALL required locales and group them by
 * stem so the runtime can serve each player their own locale's
 * variant. Only stems where every locale in `REQUIRED_LOCALES` has
 * an active row are kept — guarantees that any joining player can
 * be served regardless of which locale they speak.
 *
 * Returns a deterministic `WIDE_POOL_SIZE` slice, picked from the
 * shuffled stem list under the match seed. The pool is later
 * narrowed by ELO at phase 1 start.
 */
export async function pickQuestionsForMatch(
  rand: () => number,
): Promise<BilingualPool> {
  const rows = await db
    .select({
      id: questions.id,
      locale: questions.locale,
      category: questions.category,
      difficulty: questions.difficulty,
      prompt: questions.prompt,
      choices: questions.choices,
      correctChoiceId: questions.correctChoiceId,
      timeLimit: questions.timeLimit,
      eloTarget: questions.eloTarget,
    })
    .from(questions)
    .where(
      and(
        inArray(questions.locale, [...REQUIRED_LOCALES]),
        eq(questions.active, true),
      ),
    );

  if (rows.length === 0) {
    throw new Error(`No active questions in DB. Run pnpm db:seed.`);
  }

  // Group rows by stem. We then keep only stems that have every
  // required locale present — that's the cross-locale guarantee.
  const grouped = new Map<string, Map<string, DbQuestion>>();
  for (const r of rows as DbQuestion[]) {
    const stem = stemOf(r.id);
    let m = grouped.get(stem);
    if (!m) {
      m = new Map();
      grouped.set(stem, m);
    }
    m.set(r.locale, r);
  }
  const completeStems: string[] = [];
  for (const [stem, m] of grouped) {
    if (REQUIRED_LOCALES.every((l) => m.has(l))) completeStems.push(stem);
  }
  if (completeStems.length === 0) {
    throw new Error(
      `No bilingual fact has all required locales (${REQUIRED_LOCALES.join("/")}) active.`,
    );
  }

  // Deterministic wide-pool slice. The match seed drives the order
  // so re-runs (or audit replays) produce the same first N stems.
  const target = Math.max(WIDE_POOL_SIZE, completeStems.length);
  const out: string[] = [];
  let pool: string[] = [];
  while (out.length < target) {
    if (pool.length === 0)
      pool = pickN(completeStems, completeStems.length, rand);
    const next = pool.shift()!;
    out.push(next);
  }
  const stems = out.slice(0, WIDE_POOL_SIZE);
  // Trim the byStem map to just what's in the wide slice. Saves
  // memory for the 60s+ a room lives in registry.
  const byStem = new Map<string, Map<string, DbQuestion>>();
  for (const s of stems) byStem.set(s, grouped.get(s)!);
  return { stems, byStem };
}

/**
 * Drop from the pool every fact stem any of `userIds` has answered
 * within `windowDays`. We compare by stem so seeing `fr-web-easy-051`
 * also disqualifies `en-web-easy-051` for someone who switches
 * locales mid-week — same fact, same answer, regardless of language.
 *
 * Fail-safe: if the filter would shrink the pool below
 * `minRemaining`, we keep it unchanged. Heavy players otherwise end
 * up with too few questions.
 */
export async function filterPoolBySeen(
  state: MatchState,
  userIds: string[],
  windowDays = 14,
  minRemaining = 60,
): Promise<void> {
  if (userIds.length === 0) return;
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({ questionId: matchAnswers.questionId })
    .from(matchAnswers)
    .where(
      and(
        inArray(matchAnswers.userId, userIds),
        gte(matchAnswers.answeredAt, since),
      ),
    );

  if (rows.length === 0) return;
  const seenStems = new Set(rows.map((r) => stemOf(r.questionId)));

  const filtered = state.questionPool.filter((stem) => !seenStems.has(stem));
  if (filtered.length < minRemaining) {
    // Heavy player or tiny bank — accept overlap rather than starve.
    return;
  }

  state.questionPool = filtered;
  const keep = new Set(filtered);
  for (const s of [...state.questionsByStem.keys()]) {
    if (!keep.has(s)) state.questionsByStem.delete(s);
  }
}

/**
 * Read `users.elo` for the given userIds and average. Falls back to
 * `DEFAULT_LOBBY_ELO` when the list is empty (shadow-only lobby).
 */
export async function computeLobbyEloAvg(userIds: string[]): Promise<number> {
  if (userIds.length === 0) return DEFAULT_LOBBY_ELO;
  const rows = await db
    .select({ elo: users.elo })
    .from(users)
    .where(inArray(users.id, userIds));
  if (rows.length === 0) return DEFAULT_LOBBY_ELO;
  const sum = rows.reduce((acc, r) => acc + (r.elo ?? DEFAULT_LOBBY_ELO), 0);
  return Math.round(sum / rows.length);
}

/**
 * Narrow `state.questionPool` from the wide list to the
 * `NARROW_POOL_SIZE` questions whose ELO target lies closest to
 * `eloAvg`, within an initial mode-dependent window. If the window
 * doesn't yield enough questions, it widens progressively until either
 * the target count is reached or the entire pool is admitted.
 *
 * Mutates `state.questionPool` and prunes `state.questions` so memory
 * stays tight.
 */
export function narrowPoolByElo(
  state: MatchState,
  eloAvg: number,
): void {
  const baseWindow = WINDOW_BY_MODE[state.mode];

  // Each stem's ELO is read from any locale variant — they share the
  // same eloTarget by construction (set per fact, not per locale).
  // We default to the room's "default" locale for the lookup; if
  // missing we fall through to the first variant.
  const scored = state.questionPool.map((stem) => {
    const variants = state.questionsByStem.get(stem);
    let elo: number | null = null;
    const defaultV = variants?.get(state.locale);
    if (defaultV) elo = defaultV.eloTarget ?? null;
    if (elo == null && variants) {
      for (const v of variants.values()) {
        if (v.eloTarget != null) {
          elo = v.eloTarget;
          break;
        }
      }
    }
    return { stem, dist: Math.abs((elo ?? FALLBACK_ELO) - eloAvg) };
  });

  let window = baseWindow;
  let admitted = scored.filter((s) => s.dist <= window);
  while (admitted.length < NARROW_POOL_SIZE && window < 2400) {
    window += 250;
    admitted = scored.filter((s) => s.dist <= window);
  }
  if (admitted.length < NARROW_POOL_SIZE) {
    // Last resort — accept everything sorted by distance.
    admitted = scored;
  }

  admitted.sort((a, b) => a.dist - b.dist);
  const narrowed = admitted.slice(0, NARROW_POOL_SIZE).map((s) => s.stem);

  // Mutate state in place.
  state.questionPool = narrowed;
  const keep = new Set(narrowed);
  for (const s of [...state.questionsByStem.keys()]) {
    if (!keep.has(s)) state.questionsByStem.delete(s);
  }
}
