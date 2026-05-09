import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "../client";
import { users } from "../schema/auth";
import {
  makeShadowHandle,
  makeStyledDisplayName,
} from "../shadow-names";

/**
 * Seed a population of shadow (bot) accounts so the leaderboard has
 * something on it from day one and the match runtime has a deep pool
 * to pick from. The runtime can also create more on the fly via
 * `shadowPool.acquire()` — this script just gives us a head start.
 *
 * ELO distribution is a truncated normal centered on 1100 (free-tier
 * average) with σ ≈ 380 — it covers every rank band (Bronze through
 * Élite) so the leaderboard top is visible too. A few hand-picked
 * "elite" outliers are added at the high end so podium screenshots
 * don't look like a wall of identical 1100s.
 *
 * Idempotent: re-running with the same `--count` will top up to N
 * (existing shadows are kept). Pass `--reset` to clear non-busy
 * shadows first; busy ones (referenced by a running match) are left
 * alone so we don't trip FK constraints.
 *
 * Usage:
 *   pnpm --filter @quizelo/db seed:shadows           # default 200
 *   pnpm --filter @quizelo/db seed:shadows -- --count 500
 *   pnpm --filter @quizelo/db seed:shadows -- --reset
 */

const DEFAULT_COUNT = 200;

const LOCALES = ["fr", "en"] as const;

interface CliFlags {
  count: number;
  reset: boolean;
}

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = { count: DEFAULT_COUNT, reset: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--reset") flags.reset = true;
    else if (a === "--count") {
      const n = Number.parseInt(argv[++i] ?? "", 10);
      if (Number.isFinite(n) && n > 0) flags.count = n;
    }
  }
  return flags;
}

/** Box–Muller standard normal. */
function gauss(): number {
  const u = Math.max(Math.random(), 1e-9);
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Build a single ELO drawn from a clipped normal centered on 1100.
 * Most shadows land in 700–1500; long tails reach 400 (low) and
 * 2400+ (elite). The hard floor matches `GREATEST(0, …)` in the
 * post-match update so we don't generate values the runtime would
 * later clamp.
 */
function sampleElo(): number {
  const raw = 1100 + gauss() * 380;
  return Math.max(400, Math.min(2600, Math.round(raw)));
}

/** Sprinkle a handful of explicit "podium" elos so the top of the board has variety. */
function eloFor(idx: number, total: number): number {
  // Reserve the last ~3% of entries for explicit elite values so the
  // top page always shows a few high-rank shadows.
  const eliteCount = Math.max(3, Math.floor(total * 0.03));
  if (idx >= total - eliteCount) {
    const tier = idx - (total - eliteCount);
    // 2200, 2280, 2360, 2440, 2520… capped at 2600.
    return Math.min(2600, 2200 + tier * 80);
  }
  return sampleElo();
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Mint a display name unique within this batch and not already used
 * by any existing shadow in the DB.
 */
function makeDisplayName(used: Set<string>, dbExisting: Set<string>): string {
  for (let attempt = 0; attempt < 25; attempt++) {
    const merged = new Set<string>(used);
    for (const v of dbExisting) merged.add(v);
    const styled = makeStyledDisplayName(merged);
    const key = styled.toLowerCase();
    if (used.has(key) || dbExisting.has(key)) continue;
    used.add(key);
    return styled;
  }
  // Worst case (somebody asks for far more shadows than the
  // combinatorial space): suffix with a nonce so we always return a
  // unique value.
  const fallback = `Player_${Math.floor(Math.random() * 0xffffff).toString(36)}`;
  used.add(fallback.toLowerCase());
  return fallback;
}

const main = async () => {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.reset) {
    console.log("→ wiping non-busy shadow rows…");
    // Only delete rows that aren't FK-referenced by an active match
    // player record. This lets us re-seed cleanly without ripping
    // shadows out of in-flight matches.
    const removed = await db
      .delete(users)
      .where(
        sql`${users.isShadow} = true
            AND NOT EXISTS (
              SELECT 1 FROM match_players mp
              JOIN matches m ON m.id = mp.match_id
              WHERE mp.user_id = ${users.id}
                AND m.status NOT IN ('results', 'abandoned')
            )`,
      )
      .returning({ id: users.id });
    console.log(`  removed ${removed.length} shadow rows`);
  }

  const [{ existing } = { existing: 0 }] = await db
    .select({ existing: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.isShadow, true));

  const toCreate = Math.max(0, flags.count - existing);
  if (toCreate === 0) {
    console.log(
      `→ already at ${existing}/${flags.count} shadows — nothing to do.`,
    );
    process.exit(0);
  }

  console.log(
    `→ have ${existing} shadows; minting ${toCreate} more (target ${flags.count})…`,
  );

  // Pull existing shadow displayNames so a top-up run doesn't issue
  // a name that's already on the leaderboard. Lowercased for
  // case-insensitive comparison.
  const dbExisting = new Set<string>();
  if (existing > 0) {
    const existingRows = await db
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.isShadow, true));
    for (const r of existingRows) {
      if (r.displayName) dbExisting.add(r.displayName.toLowerCase());
    }
  }

  const usedThisRun = new Set<string>();
  const rows = Array.from({ length: toCreate }, (_, i) => {
    const display = makeDisplayName(usedThisRun, dbExisting);
    return {
      id: randomUUID(),
      // Keep `name` to the bare display so a future cleanup that
      // wants the "as-displayed" form has it without re-parsing.
      name: display,
      displayName: display,
      handle: makeShadowHandle(display),
      avatarId: Math.floor(Math.random() * 12),
      locale: pick(LOCALES),
      isShadow: true,
      elo: eloFor(existing + i, flags.count),
    };
  });

  // Insert in chunks so we don't blow past Postgres' parameter limit
  // (each row ≈ 8 columns; 1000-row chunks stay well under 65k params).
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    // onConflictDoNothing on `handle` lets us silently retry-via-skip
    // if our random suffix collides with an existing one. The lost
    // rows in a chunk will be picked up on a subsequent run.
    await db.insert(users).values(slice).onConflictDoNothing({
      target: users.handle,
    });
    console.log(`  inserted ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }

  const [{ finalCount } = { finalCount: 0 }] = await db
    .select({ finalCount: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.isShadow, true));

  const [{ minElo, maxElo, avgElo } = { minElo: 0, maxElo: 0, avgElo: 0 }] =
    await db
      .select({
        minElo: sql<number>`min(${users.elo})::int`,
        maxElo: sql<number>`max(${users.elo})::int`,
        avgElo: sql<number>`avg(${users.elo})::int`,
      })
      .from(users)
      .where(eq(users.isShadow, true));

  console.log(`✔ shadow population: ${finalCount}`);
  console.log(`  ELO range: ${minElo} – ${maxElo}  (avg ${avgElo})`);
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
