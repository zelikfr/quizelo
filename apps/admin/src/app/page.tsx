import { sql } from "drizzle-orm";
import { db, matchAnswers, matchPlayers, matches, questions, users } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Card, Stat } from "@/components/ui";
import { formatNumber, formatRelative } from "@/lib/format";

/**
 * Dashboard — quick health snapshot.
 *   - Counts: users, premium users, questions, matches.
 *   - Activity over the last 24h.
 *   - 5 most recent signups.
 */
async function getCounts() {
  // We run these in parallel — they're all small aggregates.
  const [
    [usersRow],
    [premiumRow],
    [questionsRow],
    [matchesRow],
    [matches24hRow],
    [signups24hRow],
    [answers24hRow],
    recentSignups,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(
        sql`${users.isPremium} = true OR (${users.premiumUntil} IS NOT NULL AND ${users.premiumUntil} > now())`,
      ),
    db.select({ n: sql<number>`count(*)::int` }).from(questions),
    db.select({ n: sql<number>`count(*)::int` }).from(matches),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(matches)
      .where(sql`${matches.createdAt} > now() - interval '24 hours'`),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(sql`${users.createdAt} > now() - interval '24 hours'`),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(matchAnswers)
      .where(sql`${matchAnswers.answeredAt} > now() - interval '24 hours'`),
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.displayName,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(sql`${users.createdAt} desc`)
      .limit(5),
  ]);

  return {
    users: usersRow?.n ?? 0,
    premium: premiumRow?.n ?? 0,
    questions: questionsRow?.n ?? 0,
    matches: matchesRow?.n ?? 0,
    matches24h: matches24hRow?.n ?? 0,
    signups24h: signups24hRow?.n ?? 0,
    answers24h: answers24hRow?.n ?? 0,
    recentSignups,
  };
}

async function getLiveSeats() {
  // Live seats currently occupied = match_players in non-terminal status
  // for matches that haven't ended.
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(matchPlayers)
    .innerJoin(matches, sql`${matches.id} = ${matchPlayers.matchId}`)
    .where(sql`${matches.endedAt} IS NULL`);
  return row?.n ?? 0;
}

export default async function DashboardPage() {
  const [counts, liveSeats] = await Promise.all([getCounts(), getLiveSeats()]);

  const premiumPct =
    counts.users > 0 ? Math.round((counts.premium / counts.users) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Dashboard"
        description="At-a-glance health of the platform."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Users"
          value={formatNumber(counts.users)}
          sub={`+${counts.signups24h} in 24h`}
        />
        <Stat
          label="Premium"
          value={formatNumber(counts.premium)}
          sub={`${premiumPct}% of users`}
        />
        <Stat label="Questions" value={formatNumber(counts.questions)} />
        <Stat
          label="Matches"
          value={formatNumber(counts.matches)}
          sub={`${counts.matches24h} in 24h`}
        />
        <Stat
          label="Answers (24h)"
          value={formatNumber(counts.answers24h)}
          sub="phases 1-3"
        />
        <Stat label="Live seats" value={formatNumber(liveSeats)} sub="non-ended matches" />
      </div>

      <div className="mt-6">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
            Recent signups
          </h2>
          {counts.recentSignups.length === 0 ? (
            <p className="text-sm text-fg-2">No users yet.</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {counts.recentSignups.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="text-fg-1">{u.name ?? "—"}</div>
                    <div className="text-xs text-fg-3">{u.email ?? "—"}</div>
                  </div>
                  <div className="text-xs text-fg-3">{formatRelative(u.createdAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
