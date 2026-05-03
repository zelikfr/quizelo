import { and, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import Link from "next/link";
import { db, questions } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { Badge, TD, TH, THead, TR, Table, TextInput } from "@/components/ui";

const PAGE_SIZE = 30;

const CATEGORIES = ["geography", "history", "entertainment", "sport", "art", "web", "science", "fun"] as const;
const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;

type Search = {
  q?: string;
  cat?: string;
  diff?: string;
  loc?: string;
  active?: string;
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
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conds: SQL[] = [];
  if (q) conds.push(ilike(questions.prompt, `%${q}%`));
  if (cat) conds.push(eq(questions.category, cat));
  if (diff)
    conds.push(eq(questions.difficulty, diff as (typeof DIFFICULTIES)[number]));
  if (loc) conds.push(eq(questions.locale, loc));
  if (activeFilter === "yes") conds.push(eq(questions.active, true));
  if (activeFilter === "no") conds.push(eq(questions.active, false));

  const where = conds.length > 0 ? and(...conds) : undefined;

  const [rows, [{ total } = { total: 0 }]] = await Promise.all([
    db
      .select()
      .from(questions)
      .where(where)
      .orderBy(desc(questions.createdAt))
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
      />

      <form className="mb-4 flex flex-wrap items-center gap-2" method="get">
        <TextInput
          name="q"
          defaultValue={q}
          placeholder="Search prompt…"
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
            <TH className="text-right">Edit</TH>
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
                  <div className="mt-0.5 text-[10px] text-fg-3 font-mono">{r.id}</div>
                </TD>
                <TD className="text-xs text-fg-2">{r.category}</TD>
                <TD>
                  <Badge tone={diffTone(r.difficulty)}>{r.difficulty}</Badge>
                </TD>
                <TD className="text-xs text-fg-2">{r.locale}</TD>
                <TD className="font-mono text-xs text-fg-1">{r.eloTarget ?? "—"}</TD>
                <TD>
                  {r.active ? (
                    <Badge tone="success">active</Badge>
                  ) : (
                    <Badge tone="danger">inactive</Badge>
                  )}
                </TD>
                <TD className="text-right">
                  <Link
                    href={`/questions/${r.id}`}
                    className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-fg-2 hover:bg-bg-3"
                  >
                    Edit
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
