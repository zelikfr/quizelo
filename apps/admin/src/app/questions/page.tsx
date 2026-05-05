import { and, desc, eq, ilike, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";
import { db, questions } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Badge, TD, TH, THead, TR, Table, TextInput } from "@/components/ui";
import { ApproveButton } from "./ApproveButton";
import { DeleteButton } from "./DeleteButton";

const PAGE_SIZE = 30;

const CATEGORIES = ["geography", "history", "entertainment", "sport", "art", "web", "science", "fun"] as const;
const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;

type Search = {
  q?: string;
  cat?: string;
  diff?: string;
  loc?: string;
  active?: string;
  /** "yes" → only questions flagged by the seed-time shape-leak lint. */
  flagged?: string;
  /**
   * "yes" → only questions an admin has acted on (lint_reviewed_at
   *          set), useful for auditing what's been touched and won't
   *          revert on next `db:seed`.
   * "no"  → only un-reviewed rows (still mirroring the bank file).
   */
  reviewed?: string;
  page?: string;
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const cat = sp.cat ?? "";
  const diff = sp.diff ?? "";
  const loc = sp.loc ?? "";
  const activeFilter = sp.active ?? "";
  const flaggedOnly = sp.flagged === "yes";
  const reviewedFilter = sp.reviewed ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conds: SQL[] = [];
  if (q) {
    // Search hits both the prompt text (free-text content lookup)
    // and the question id (handy when you already know the row,
    // e.g. you copied the id from a flagged-question log line or
    // from a match's `match_answers` row).
    const pattern = `%${q}%`;
    const promptOrId = or(
      ilike(questions.prompt, pattern),
      ilike(questions.id, pattern),
    );
    if (promptOrId) conds.push(promptOrId);
  }
  if (cat) conds.push(eq(questions.category, cat));
  if (diff)
    conds.push(eq(questions.difficulty, diff as (typeof DIFFICULTIES)[number]));
  if (loc) conds.push(eq(questions.locale, loc));
  if (activeFilter === "yes") conds.push(eq(questions.active, true));
  if (activeFilter === "no") conds.push(eq(questions.active, false));
  if (flaggedOnly) conds.push(isNotNull(questions.lintReason));
  // Reviewed = the admin has touched this row (approve / edit /
  // toggle / delete) and therefore the seed pipeline now leaves it
  // alone. Useful audit lens — "show me everything I've signed off".
  if (reviewedFilter === "yes") conds.push(isNotNull(questions.lintReviewedAt));
  if (reviewedFilter === "no") conds.push(isNull(questions.lintReviewedAt));

  const where = conds.length > 0 ? and(...conds) : undefined;

  // Header counter — total questions in the bank still flagged by the
  // shape-leak linter and pending admin review. Drives the "Needs
  // review" pill at the top of the page.
  const [{ flaggedCount } = { flaggedCount: 0 }] = await db
    .select({ flaggedCount: sql<number>`count(*)::int` })
    .from(questions)
    .where(isNotNull(questions.lintReason));

  const [rows, [{ total } = { total: 0 }]] = await Promise.all([
    db
      .select()
      .from(questions)
      .where(where)
      // Show flagged questions first when the user is in "Needs review"
      // mode — otherwise default to creation date desc as before.
      .orderBy(
        flaggedOnly ? desc(questions.lintReason) : desc(questions.createdAt),
      )
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(questions)
      .where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Questions"
        description={`${total.toLocaleString("fr-FR")} questions matching the current filter.`}
        actions={
          flaggedCount > 0 ? (
            <Link
              href={
                flaggedOnly ? "/questions" : "/questions?flagged=yes"
              }
              className="inline-flex items-center gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-1.5 text-xs font-medium text-warn hover:bg-warn/20"
            >
              {flaggedOnly ? "← All questions" : `⚠ ${flaggedCount} need review`}
            </Link>
          ) : null
        }
      />

      {flaggedOnly && (
        <div className="mb-4 rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-xs text-warn">
          <strong>Shape-leak review queue.</strong> These questions
          were flagged by the seed-time lint because their correct
          answer is shaped differently from the distractors enough
          that a player could guess by elimination. Review the
          reason, then either approve as-is, edit the choices, or
          leave inactive.
        </div>
      )}

      <form className="mb-4 flex flex-wrap items-center gap-2" method="get">
        <TextInput
          name="q"
          defaultValue={q}
          placeholder="Search prompt or id…"
          className="max-w-xs"
        />
        <select
          name="cat"
          defaultValue={cat}
          className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="diff"
          defaultValue={diff}
          className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
        >
          <option value="">All difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          name="loc"
          defaultValue={loc}
          className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
        >
          <option value="">All locales</option>
          <option value="fr">fr</option>
          <option value="en">en</option>
        </select>
        <select
          name="active"
          defaultValue={activeFilter}
          className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
        >
          <option value="">Any status</option>
          <option value="yes">Active</option>
          <option value="no">Inactive</option>
        </select>
        <select
          name="reviewed"
          defaultValue={reviewedFilter}
          className="rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
        >
          <option value="">Any review state</option>
          <option value="yes">Reviewed</option>
          <option value="no">Not reviewed</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-fg-2">
          <input
            type="checkbox"
            name="flagged"
            value="yes"
            defaultChecked={flaggedOnly}
            className="h-3.5 w-3.5 accent-warn"
          />
          Flagged only
        </label>
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Apply
        </button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH className="w-2/5">Prompt</TH>
            <TH>Category</TH>
            <TH>Diff.</TH>
            <TH>Locale</TH>
            <TH>ELO</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {rows.length === 0 ? (
            <TR>
              <TD colSpan={7} className="py-8 text-center text-fg-3">
                No questions match.
              </TD>
            </TR>
          ) : (
            rows.map((r) => (
              <TR key={r.id}>
                <TD>
                  <div className="line-clamp-2 max-w-md text-fg-1">{r.prompt}</div>
                  {/* Answers inline so the reviewer can decide
                      Approve / Edit without opening the detail page —
                      the correct one is highlighted, the distractors
                      come after so the shape comparison is obvious at
                      a glance. */}
                  <ul className="mt-1.5 space-y-0.5 text-[11px] leading-snug">
                    {r.choices.map((c) => {
                      const isCorrect = c.id === r.correctChoiceId;
                      return (
                        <li
                          key={c.id}
                          className={
                            isCorrect
                              ? "text-success font-medium"
                              : "text-fg-3"
                          }
                        >
                          <span className="mr-1 font-mono">
                            {isCorrect ? "✓" : "·"}
                          </span>
                          {c.label}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-1 text-[10px] text-fg-3 font-mono">{r.id}</div>
                  {r.lintReason && (
                    <div className="mt-1 text-[10px] text-warn font-mono">
                      ⚠ {r.lintReason}
                    </div>
                  )}
                </TD>
                <TD className="text-xs text-fg-2">{r.category}</TD>
                <TD>
                  <Badge tone={diffTone(r.difficulty)}>{r.difficulty}</Badge>
                </TD>
                <TD className="text-xs text-fg-2">{r.locale}</TD>
                <TD className="font-mono text-xs text-fg-1">{r.eloTarget ?? "—"}</TD>
                <TD>
                  <div className="flex flex-col items-start gap-1">
                    {r.active ? (
                      <Badge tone="success">active</Badge>
                    ) : (
                      <Badge tone="danger">inactive</Badge>
                    )}
                    {r.lintReviewedAt && (
                      <Badge tone="info">reviewed</Badge>
                    )}
                  </div>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.lintReason && <ApproveButton id={r.id} />}
                    <Link
                      href={`/questions/${r.id}`}
                      className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-fg-2 hover:bg-bg-3"
                    >
                      Edit
                    </Link>
                    {/* Delete only shown on flagged rows to keep the
                        list calm — once a question is approved /
                        active, the edit page handles deletes via
                        the active toggle. */}
                    {r.lintReason && <DeleteButton id={r.id} />}
                  </div>
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
                href={hrefWith(sp, { page: String(page - 1) })}
                className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-fg-2 hover:bg-bg-3"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={hrefWith(sp, { page: String(page + 1) })}
                className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-fg-2 hover:bg-bg-3"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function diffTone(d: string): "success" | "info" | "warn" | "danger" | "default" {
  if (d === "easy") return "success";
  if (d === "medium") return "info";
  if (d === "hard") return "warn";
  if (d === "expert") return "danger";
  return "default";
}

function hrefWith(sp: Search, patch: Partial<Search>): string {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `/questions?${qs}` : "/questions";
}
