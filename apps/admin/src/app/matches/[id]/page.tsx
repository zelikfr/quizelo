import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  db,
  matchAnswers,
  matchPlayers,
  matches,
  questions,
  users,
} from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, TD, TH, THead, TR, Table } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [m] = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  if (!m) notFound();

  const [players, answers] = await Promise.all([
    db
      .select({
        userId: matchPlayers.userId,
        seat: matchPlayers.seat,
        status: matchPlayers.status,
        score: matchPlayers.score,
        finalRank: matchPlayers.finalRank,
        eloDelta: matchPlayers.eloDelta,
        coinsDelta: matchPlayers.coinsDelta,
        userName: users.displayName,
        userEmail: users.email,
        userElo: users.elo,
      })
      .from(matchPlayers)
      .leftJoin(users, eq(users.id, matchPlayers.userId))
      .where(eq(matchPlayers.matchId, id))
      .orderBy(asc(matchPlayers.seat)),
    db
      .select({
        id: matchAnswers.id,
        userId: matchAnswers.userId,
        questionId: matchAnswers.questionId,
        phase: matchAnswers.phase,
        roundIndex: matchAnswers.roundIndex,
        chosenChoiceId: matchAnswers.chosenChoiceId,
        isCorrect: matchAnswers.isCorrect,
        responseMs: matchAnswers.responseMs,
        scoreDelta: matchAnswers.scoreDelta,
        answeredAt: matchAnswers.answeredAt,
        prompt: questions.prompt,
        category: questions.category,
        userName: users.displayName,
      })
      .from(matchAnswers)
      .leftJoin(questions, eq(questions.id, matchAnswers.questionId))
      .leftJoin(users, eq(users.id, matchAnswers.userId))
      .where(eq(matchAnswers.matchId, id))
      .orderBy(asc(matchAnswers.answeredAt)),
  ]);

  const totalAnswers = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const accuracy = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Match detail"
        description={`${m.mode} · ${m.locale} · ${players.length} players`}
        actions={
          <Link
            href="/matches"
            className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-2 hover:bg-bg-3"
          >
            ← Back
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Status</div>
          <div className="mt-1">
            <Badge tone={m.status === "results" ? "success" : "warn"}>{m.status}</Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Started</div>
          <div className="mt-1 text-sm text-fg-1">{formatDate(m.startedAt)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Ended</div>
          <div className="mt-1 text-sm text-fg-1">{formatDate(m.endedAt)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Accuracy</div>
          <div className="mt-1 text-lg text-fg-0">
            {accuracy == null ? "—" : `${accuracy}%`}
          </div>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
          Players
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Seat</TH>
              <TH>Player</TH>
              <TH>Status</TH>
              <TH>Score</TH>
              <TH>Rank</TH>
              <TH>ΔELO</TH>
              <TH>ΔCoins</TH>
            </TR>
          </THead>
          <tbody>
            {players.map((p) => (
              <TR key={p.userId}>
                <TD className="font-mono text-fg-2">{p.seat}</TD>
                <TD>
                  <div className="text-fg-1">{p.userName ?? "—"}</div>
                  <div className="text-xs text-fg-3">{p.userEmail ?? "—"}</div>
                </TD>
                <TD>
                  <Badge tone={p.status === "winner" ? "success" : "default"}>
                    {p.status}
                  </Badge>
                </TD>
                <TD className="font-mono text-fg-1">{p.score}</TD>
                <TD className="text-fg-1">{p.finalRank ?? "—"}</TD>
                <TD
                  className={`font-mono ${
                    (p.eloDelta ?? 0) > 0
                      ? "text-success"
                      : (p.eloDelta ?? 0) < 0
                        ? "text-danger"
                        : "text-fg-2"
                  }`}
                >
                  {p.eloDelta == null ? "—" : (p.eloDelta > 0 ? "+" : "") + p.eloDelta}
                </TD>
                <TD className="font-mono text-fg-2">{p.coinsDelta ?? "—"}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-fg-3">
          Answers timeline · {totalAnswers}
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Phase</TH>
              <TH>#</TH>
              <TH>Player</TH>
              <TH>Question</TH>
              <TH>Result</TH>
              <TH>RT</TH>
              <TH>Δ</TH>
            </TR>
          </THead>
          <tbody>
            {answers.length === 0 ? (
              <TR>
                <TD colSpan={7} className="py-8 text-center text-fg-3">
                  No answer recorded.
                </TD>
              </TR>
            ) : (
              answers.map((a) => (
                <TR key={a.id}>
                  <TD>
                    <Badge>{a.phase}</Badge>
                  </TD>
                  <TD className="font-mono text-fg-2">{a.roundIndex}</TD>
                  <TD className="text-fg-1">{a.userName ?? "—"}</TD>
                  <TD className="max-w-md">
                    <div className="line-clamp-1 text-fg-1">{a.prompt}</div>
                    <div className="text-[10px] text-fg-3">{a.category}</div>
                  </TD>
                  <TD>
                    {a.isCorrect ? (
                      <Badge tone="success">correct</Badge>
                    ) : a.chosenChoiceId == null ? (
                      <Badge tone="warn">timeout</Badge>
                    ) : (
                      <Badge tone="danger">wrong</Badge>
                    )}
                  </TD>
                  <TD className="font-mono text-xs text-fg-2">
                    {a.responseMs != null ? `${(a.responseMs / 1000).toFixed(1)}s` : "—"}
                  </TD>
                  <TD
                    className={`font-mono text-xs ${
                      a.scoreDelta > 0
                        ? "text-success"
                        : a.scoreDelta < 0
                          ? "text-danger"
                          : "text-fg-3"
                    }`}
                  >
                    {a.scoreDelta > 0 ? "+" : ""}
                    {a.scoreDelta}
                  </TD>
                </TR>
              ))
            )}
          </tbody>
        </Table>
      </section>
    </div>
  );
}

