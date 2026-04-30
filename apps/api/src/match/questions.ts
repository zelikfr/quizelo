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

/**
 * Pull active questions for the locale and pick `WIDE_POOL_SIZE`
 * deterministically from the seed. The pool is later narrowed by ELO at
 * phase 1 start when the lobby's avg ELO is known.
 */
export async function pickQuestionsForMatch(
  locale: string,
  rand: () => number,
): Promise<DbQuestion[]> {
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
    .where(and(eq(questions.locale, locale), eq(questions.active, true)));

  if (rows.length === 0) {
    throw new Error(
      `No active questions for locale=${locale}. Run pnpm db:seed.`,
    );
  }

  const target = Math.max(WIDE_POOL_SIZE, rows.length);
  const out: DbQuestion[] = [];
  let pool: DbQuestion[] = [];
  while (out.length < target) {
    if (pool.length === 0) pool = pickN(rows as DbQuestion[], rows.length, rand);
    const next = pool.shift()!;
    out.push(next);
  }
  return out.slice(0, WIDE_POOL_SIZE);
}

/**
 * Drop from the match's question pool every id any of `userIds` has
 * answered within the last `windowDays` days. This is the cheapest way
 * to make repeats *extremely* rare across matches: a player who just
 * finished a match won't see those exact questions again for two weeks.
 *
 * Fail-safe: if the filter would shrink the pool below `minRemaining`,
 * we keep the wide pool unchanged. Heavy players (who already saw most
 * of the bank) would otherwise end up with too few questions to play.
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
  const seen = new Set(rows.map((r) => r.questionId));

  const filtered = state.questionPool.filter((id) => !seen.has(id));
  if (filtered.length < minRemaining) {
    // Heavy player or tiny bank — accept overlap rather than starve.
    return;
  }

  state.questionPool = filtered;
  const keep = new Set(filtered);
  for (const id of [...state.questions.keys()]) {
    if (!keep.has(id)) state.questions.delete(id);
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

  const scored = state.questionPool.map((id) => {
    const q = state.questions.get(id);
    const elo = q?.eloTarget ?? FALLBACK_ELO;
    return { id, dist: Math.abs(elo - eloAvg) };
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
  const narrowed = admitted.slice(0, NARROW_POOL_SIZE).map((s) => s.id);

  // Mutate state in place.
  state.questionPool = narrowed;
  const keep = new Set(narrowed);
  for (const id of [...state.questions.keys()]) {
    if (!keep.has(id)) state.questions.delete(id);
  }
}
