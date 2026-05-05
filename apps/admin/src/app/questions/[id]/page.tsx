import { and, count, eq, ilike, ne, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, matchAnswers, questions } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { QuestionEditForm } from "./QuestionEditForm";

export default async function QuestionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  // Validate the `from` param to make sure we never push the user
  // off-site or to an unrelated route. We only honor URLs that stay
  // inside `/questions...`.
  const backHref =
    from && from.startsWith("/questions") ? from : "/questions";

  const [q] = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  if (!q) notFound();

  // Cross-locale siblings — IDs share the same suffix after the
  // locale prefix (e.g. `fr-web-easy-051` ↔ `en-web-easy-051`).
  // Surfaced below the form so the reviewer doesn't disable one side
  // and forget the other; the seed pipeline doesn't enforce parity.
  const dashIdx = q.id.indexOf("-");
  const sharedSuffix = dashIdx >= 0 ? q.id.substring(dashIdx) : null;
  const siblings = sharedSuffix
    ? await db
        .select({
          id: questions.id,
          locale: questions.locale,
          active: questions.active,
          lintReason: questions.lintReason,
          lintReviewedAt: questions.lintReviewedAt,
          prompt: questions.prompt,
        })
        .from(questions)
        .where(
          and(
            ne(questions.id, q.id),
            ilike(questions.id, `%${sharedSuffix}`),
          ),
        )
    : [];

  const [usageRow] = await db
    .select({
      total: count(),
      correct: sql<number>`sum(case when ${matchAnswers.isCorrect} then 1 else 0 end)::int`,
      avgMs: sql<number>`coalesce(avg(${matchAnswers.responseMs})::int, 0)`,
    })
    .from(matchAnswers)
    .where(eq(matchAnswers.questionId, id));

  const usage = {
    total: usageRow?.total ?? 0,
    correct: usageRow?.correct ?? 0,
    avgMs: usageRow?.avgMs ?? 0,
  };
  const correctPct = usage.total > 0 ? Math.round((usage.correct / usage.total) * 100) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Edit question"
        description={`Created ${formatDate(q.createdAt)} · Updated ${formatDate(q.updatedAt)}`}
        actions={
          <Link
            // Honor `?from=` so a reviewer who came in from
            // `/questions?flagged=yes` lands back on that same queue.
            href={backHref}
            className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-2 hover:bg-bg-3"
          >
            ← Back
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Times asked</div>
          <div className="mt-1 text-xl font-semibold text-fg-0">
            {usage.total.toLocaleString("fr-FR")}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Correct rate</div>
          <div className="mt-1 text-xl font-semibold text-fg-0">
            {correctPct == null ? "—" : `${correctPct}%`}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-fg-3">Avg response</div>
          <div className="mt-1 text-xl font-semibold text-fg-0">
            {usage.avgMs > 0 ? `${(usage.avgMs / 1000).toFixed(1)} s` : "—"}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Badge>{q.locale}</Badge>
          <Badge tone="accent">{q.category}</Badge>
          <Badge>{q.difficulty}</Badge>
          {q.eloTarget != null && <Badge tone="info">ELO {q.eloTarget}</Badge>}
          {!q.active && <Badge tone="danger">inactive</Badge>}
          {q.lintReason && <Badge tone="warn">flagged</Badge>}
          {q.lintReviewedAt && <Badge tone="info">reviewed</Badge>}
        </div>

        {q.lintReason && (
          <div className="mb-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
            <strong className="font-semibold">Shape-leak lint:</strong>{" "}
            {q.lintReason}. Cette question a été désactivée
            automatiquement par le seed. Vérifie que la bonne réponse
            n&rsquo;est pas devinable par forme, puis sauvegarde avec{" "}
            <em>active = true</em> pour la réactiver — ou utilise
            l&rsquo;action “Approuver” ci-dessous pour effacer le drapeau
            sans toucher au contenu.
          </div>
        )}

        <QuestionEditForm question={q} backHref={backHref} />
      </Card>

      {siblings.length > 0 && (
        <Card className="mt-6 p-5">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-fg-1">Locale siblings</h2>
            <span className="text-[10px] text-fg-3">
              same fact in other languages
            </span>
          </div>
          <p className="mb-3 text-xs text-fg-3">
            The match runtime queries one locale at a time, so disabling
            this row only blocks {q.locale.toUpperCase()} players. Check
            below if the sibling needs the same treatment — the seed
            pipeline does NOT auto-mirror your decision.
          </p>
          <ul className="space-y-2">
            {siblings.map((s) => {
              const desync = s.active !== q.active;
              return (
                <li
                  key={s.id}
                  className={
                    "flex items-center gap-3 rounded-md border px-3 py-2 " +
                    (desync
                      ? "border-warn/40 bg-warn/5"
                      : "border-line bg-bg-2")
                  }
                >
                  <Badge>{s.locale}</Badge>
                  {s.active ? (
                    <Badge tone="success">active</Badge>
                  ) : (
                    <Badge tone="danger">inactive</Badge>
                  )}
                  {s.lintReason && <Badge tone="warn">flagged</Badge>}
                  {s.lintReviewedAt && <Badge tone="info">reviewed</Badge>}
                  {desync && (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-warn">
                      ⚠ desynced
                    </span>
                  )}
                  <span className="line-clamp-1 flex-1 text-xs text-fg-2">
                    {s.prompt}
                  </span>
                  <Link
                    href={`/questions/${s.id}?from=${encodeURIComponent(backHref)}`}
                    className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-fg-2 hover:bg-bg-3"
                  >
                    Open
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
