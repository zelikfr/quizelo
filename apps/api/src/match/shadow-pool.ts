import {
  db,
  makeShadowHandle,
  makeStyledDisplayName,
  users,
  type User,
} from "@quizelo/db";
import { and, eq, isNull, notInArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";

/**
 * Shadow user pool.
 *
 * Shadows are real `users` rows (with `is_shadow = true`) so they have
 * stable ids, ELO that drifts over time, and a leaderboard presence —
 * but they're driven entirely by the server.
 *
 * The pool keeps a small in-memory `busy` set so two simultaneous
 * lobbies can't both grab the same shadow. When the pool is exhausted
 * (every existing shadow is busy) we lazily INSERT a new one, which
 * grows the population organically with traffic.
 *
 * Single-process scope — same constraint as `MatchRegistry`. When we
 * shard the match service we'll move the busy set to Redis and front
 * `acquire` with a SETNX-style lease.
 */

/** Shape returned to callers — only the columns the runtime needs. */
export interface ShadowUserRow {
  id: string;
  name: string | null;
  displayName: string | null;
  handle: string | null;
  avatarId: number | null;
  locale: string;
  elo: number;
}

/**
 * Display-name and handle generation lives in
 * `@quizelo/db/shadow-names` so the offline seed and the runtime
 * mint use the exact same combinatorial pool.
 */

class ShadowPool {
  /** userIds currently allocated to a running room. */
  private busy = new Set<string>();

  /**
   * Pick (and reserve) a shadow user for a room. Reuses an idle one
   * from the DB pool if any; otherwise creates a fresh user row.
   *
   * The optional `excludeIds` is what's already booked into the same
   * lobby in this acquire round — needed because we may issue many
   * `acquire` calls in parallel before any of them have written back
   * to `busy`. Without it, a single `Promise.all` could grab the same
   * idle row N times.
   */
  async acquire(opts?: { excludeIds?: ReadonlySet<string> }): Promise<ShadowUserRow> {
    const reserved = new Set<string>(this.busy);
    if (opts?.excludeIds) for (const id of opts.excludeIds) reserved.add(id);

    const candidate = await this.findIdle(reserved);
    if (candidate) {
      this.busy.add(candidate.id);
      return candidate;
    }

    const fresh = await this.create();
    this.busy.add(fresh.id);
    return fresh;
  }

  /** Release one shadow back to the pool. Safe to call repeatedly. */
  release(userId: string): void {
    this.busy.delete(userId);
  }

  /** Release several shadows in one call (room teardown). */
  releaseAll(userIds: Iterable<string>): void {
    for (const id of userIds) this.busy.delete(id);
  }

  /** Visibility hook for tests / debug pages. */
  busySize(): number {
    return this.busy.size;
  }

  // ─── Internals ────────────────────────────────────────────────

  private async findIdle(reserved: ReadonlySet<string>): Promise<ShadowUserRow | null> {
    const ids = [...reserved];
    const where = ids.length
      ? and(eq(users.isShadow, true), isNull(users.deletedAt), notInArray(users.id, ids))
      : and(eq(users.isShadow, true), isNull(users.deletedAt));

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        displayName: users.displayName,
        handle: users.handle,
        avatarId: users.avatarId,
        locale: users.locale,
        elo: users.elo,
      })
      .from(users)
      .where(where)
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Insert a new shadow user. Retries on handle collision (the
   * column is uniquely indexed) by re-rolling the random suffix.
   */
  private async create(): Promise<ShadowUserRow> {
    const id = randomUUID();
    const display = makeStyledDisplayName();
    // Try a handful of times — collisions are rare with 6 base36 chars
    // on the handle, but cheap to retry if they happen.
    for (let attempt = 0; attempt < 5; attempt++) {
      const handle = makeShadowHandle(display);
      try {
        const inserted = await db
          .insert(users)
          .values({
            id,
            name: display,
            displayName: display,
            handle,
            avatarId: Math.floor(Math.random() * 12),
            locale: Math.random() < 0.5 ? "fr" : "en",
            isShadow: true,
            // ELO defaults to 1000, coins to 0 — we let the schema decide.
          })
          .returning({
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            handle: users.handle,
            avatarId: users.avatarId,
            locale: users.locale,
            elo: users.elo,
          });
        const row = inserted[0];
        if (row) return row;
      } catch (err) {
        // Unique-violation on handle — retry with a new suffix.
        if (isUniqueViolation(err)) continue;
        throw err;
      }
    }
    throw new Error("ShadowPool: failed to mint a unique handle after 5 attempts");
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}

export const shadowPool = new ShadowPool();

// Keep the User import alive for downstream consumers that import this
// module's types. (Drizzle-Kit codegen sometimes drops unreferenced
// type-only imports.)
export type { User };
