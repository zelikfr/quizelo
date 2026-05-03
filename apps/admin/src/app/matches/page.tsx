import { desc, sql } from "drizzle-orm";
import Link from "next/link";
import { db, matchPlayers, matches } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, TD, TH, THead, TR, Table } from "@/components/ui";
import { formatDate, formatRelative } from "@/lib/format";
import { fetchLiveMatches } from "@/lib/api";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [live, history, [{ total } = { total: 0 }]] = await Promise.all([
    fetchLiveMatches(),
    db
      .select({
        id: matches.id,
        mode: matches.mode,
        status: matches.status,
        locale: matches.locale,
        createdAt: matches.createdAt,
        startedAt: matches.startedAt,
        endedAt: matches.endedAt,
        playerCount: sql<number>`(select count(*)::int from ${matchPlayers} where ${matchPlayers.matchId} = ${matches.id})`,
      })
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(matches),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Matches"
        description="Live rooms held in memory by the API + a paginated history pulled from Postgres."
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
          Live · {live.rooms.length} room{live.rooms.length === 1 ? "" : "s"}
        </h2>

        {live.error ? (
          <Card className="border-warn/30 bg-warn/5 p-4 text-sm text-warn">
            Could not reach API: {live.error}
          </Card>
        ) : live.rooms.length === 0 ? (
          <Card className="p-4 text-sm text-fg-3">No live match right now.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {live.rooms.map((r) => {
              const realPlayers = r.players.filter((p) => !p.isShadow);
              return (
                <Card key={r.matchId} className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge tone={r.mode === "ranked" ? "accent" : "info"}>{r.mode}</Badge>
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </div>
                  <div className="mb-3 font-mono text-[11px] text-fg-3 truncate">
                    {r.matchId}
                  </div>
                  <div className="space-y-1 text-sm">
                    {r.players.map((p) => (
                      <div
                        key={p.userId}
                        className="flex items-center justify-between gap-2 text-fg-1"
                      >
                        <span className={p.isShadow ? "text-fg-3 italic" : ""}>
                          {p.name}
                        </span>
                        <span className="font-mono text-xs text-fg-2">{p.score}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-fg-3">
                    {realPlayers.length} real / {r.players.length} total
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
          History · {total.toLocaleString("fr-FR")}
        </h2>

        <Table>
          <THead>
            <TR>
              <TH>Match</TH>
              <TH>Mode</TH>
              <TH>Status</TH>
              <TH>Players</TH>
              <TH>Started</TH>
              <TH>Ended</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {history.length === 0 ? (
              <TR>
                <TD colSpan={7} className="py-8 text-center text-fg-3">
                  No match recorded yet.
                </TD>
              </TR>
            ) : (
              history.map((m) => (
                <TR key={m.id}>
                  <TD>
                    <div className="font-mono text-[11px] text-fg-1">
                      {m.id.slice(0, 8)}…
                    </div>
                    <div className="text-[10px] text-fg-3">
                      created {formatRelative(m.createdAt)}
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={m.mode === "ranked" ? "accent" : "info"}>{m.mode}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                  </TD>
                  <TD className="text-fg-1">{m.playerCount}</TD>
                  <TD className="text-xs text-fg-2">{formatDate(m.startedAt)}</TD>
                  <TD className="text-xs text-fg-2">{formatDate(m.endedAt)}</TD>
                  <TD className="text-right">
                    <Link
                      href={`/matches/${m.id}`}
                      className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-fg-2 hover:bg-bg-3"
                    >
                      View
                    </Link>
                  </TD>
                </TR>
              ))
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-fg-3">
            <div>
              Page {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/matches?page=${page - 1}`}
                  className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-fg-2 hover:bg-bg-3"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/matches?page=${page + 1}`}
                  className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-fg-2 hover:bg-bg-3"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function statusTone(s: string): "success" | "info" | "warn" | "danger" | "default" | "accent" {
  if (s === "results") return "success";
  if (s === "abandoned") return "danger";
  if (s.startsWith("transition")) return "warn";
  if (s.startsWith("phase")) return "accent";
  if (s === "lobby") return "info";
  return "default";
}
