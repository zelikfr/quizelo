import { sql } from "drizzle-orm";
import { db, matchPlayers, matches, users } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Card, Stat } from "@/components/ui";
import { BarChart } from "@/components/Sparkline";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Build a 30-day series with zeros for empty days. */
function fillDays(
  series: Array<{ day: string; n: number }>,
  days: number,
): Array<{ label: string; value: number }> {
  const map = new Map(series.map((s) => [s.day, s.n]));
  const out: Array<{ label: string; value: number }> = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push({ label: iso.slice(5), value: map.get(iso) ?? 0 });
  }
  return out;
}

export default async function AnalyticsPage() {
  const [signups30, matches30, dau30, premiumStats, conv30, lifetime] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${users.createdAt}), 'YYYY-MM-DD')`,
        n: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(sql`${users.createdAt} > now() - interval '30 days'`)
      .groupBy(sql`date_trunc('day', ${users.createdAt})`),

    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${matches.createdAt}), 'YYYY-MM-DD')`,
        n: sql<number>`count(*)::int`,
      })
      .from(matches)
      .where(sql`${matches.createdAt} > now() - interval '30 days'`)
      .groupBy(sql`date_trunc('day', ${matches.createdAt})`),

    // DAU = distinct users that played at least one match-player row that day.
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${matchPlayers.joinedAt}), 'YYYY-MM-DD')`,
        n: sql<number>`count(distinct ${matchPlayers.userId})::int`,
      })
      .from(matchPlayers)
      .where(sql`${matchPlayers.joinedAt} > now() - interval '30 days'`)
      .groupBy(sql`date_trunc('day', ${matchPlayers.joinedAt})`),

    Promise.all([
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(users)
        .where(
          sql`${users.isPremium} = true OR (${users.premiumUntil} IS NOT NULL AND ${users.premiumUntil} > now())`,
        ),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(users)
        .where(
          sql`${users.premiumUntil} IS NOT NULL OR ${users.isPremium} = true`,
        ),
      db.select({ n: sql<number>`count(*)::int` }).from(users),
    ]).then(([a, e, t]) => [
      { active: a[0]?.n ?? 0, ever: e[0]?.n ?? 0, total: t[0]?.n ?? 0 },
    ]),

    // Conversions in the last 30 days = users who became premium recently.
    // Proxy via `updatedAt`: not perfect, but accurate enough until we
    // backfill conversion timestamps from Stripe webhooks.
    db
      .select({
        n: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(
        sql`${users.premiumUntil} IS NOT NULL AND ${users.premiumUntil} > now() AND ${users.updatedAt} > now() - interval '30 days'`,
      ),

    Promise.all([
      db.select({ n: sql<number>`count(*)::int` }).from(matches),
      db.select({ n: sql<number>`count(*)::int` }).from(users),
    ]).then(([m, u]) => [{ totalMatches: m[0]?.n ?? 0, totalUsers: u[0]?.n ?? 0 }]),
  ]);

  const signupsBins = fillDays(signups30, 30);
  const matchesBins = fillDays(matches30, 30);
  const dauBins = fillDays(dau30, 30);

  const totalSignups30 = signupsBins.reduce((a, b) => a + b.value, 0);
  const totalMatches30 = matchesBins.reduce((a, b) => a + b.value, 0);
  const avgDau30 = Math.round(
    dauBins.reduce((a, b) => a + b.value, 0) / Math.max(1, dauBins.length),
  );

  const ps = premiumStats[0];
  const lt = lifetime[0];
  const conv = conv30[0]?.n ?? 0;

  // Naive MRR proxy: assume premium plan = 4.99€/mo. Once Stripe is wired
  // we can swap this for actual subscription data via the Stripe API.
  const PRICE_MONTHLY_CENTS = 499;
  const mrrCents = (ps?.active ?? 0) * PRICE_MONTHLY_CENTS;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Analytics"
        description="Last 30 days · refreshed on every page load."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Signups (30d)"
          value={formatNumber(totalSignups30)}
          sub={`${formatNumber(lt?.totalUsers ?? 0)} lifetime`}
        />
        <Stat
          label="Matches (30d)"
          value={formatNumber(totalMatches30)}
          sub={`${formatNumber(lt?.totalMatches ?? 0)} lifetime`}
        />
        <Stat label="Avg DAU (30d)" value={formatNumber(avgDau30)} />
        <Stat
          label="Premium active"
          value={formatNumber(ps?.active ?? 0)}
          sub={`${conv} new in 30d`}
        />
        <Stat
          label="MRR (proxy)"
          value={
            <span>
              {(mrrCents / 100).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </span>
          }
          sub={`@ ${(PRICE_MONTHLY_CENTS / 100).toFixed(2)}€/mo`}
        />
        <Stat
          label="Premium ever"
          value={formatNumber(ps?.ever ?? 0)}
          sub={`${ps?.total ? Math.round(((ps.ever ?? 0) / ps.total) * 100) : 0}% conversion lifetime`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
            Signups · last 30 days
          </h2>
          <BarChart bins={signupsBins} />
          <div className="mt-2 text-xs text-fg-3">Total: {totalSignups30}</div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
            Matches · last 30 days
          </h2>
          <BarChart bins={matchesBins} />
          <div className="mt-2 text-xs text-fg-3">Total: {totalMatches30}</div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
            DAU · last 30 days
          </h2>
          <BarChart bins={dauBins} height={120} />
          <div className="mt-2 text-xs text-fg-3">
            Distinct players per UTC day. Avg {avgDau30}.
          </div>
        </Card>
      </div>

      <Card className="mt-4 border-warn/20 bg-warn/5 p-4 text-xs text-fg-2">
        <strong className="text-warn">Note · </strong>
        MRR is a proxy (active premiums × 4.99€). Hooking Stripe&apos;s subscription
        API in here will give true ARR/MRR including refunds. Conversions in the
        last 30 days currently track <em>updatedAt</em>, not the moment Stripe
        confirmed the payment — accurate enough for a launch, swap to webhook
        events for the real number.
      </Card>
    </div>
  );
}
