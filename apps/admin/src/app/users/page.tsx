import { and, asc, desc, ilike, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";
import { db, users } from "@quizelo/db";
import { PageHeader } from "@/components/PageHeader";
import { TD, TH, THead, TR, Table, TextInput } from "@/components/ui";
import { UserRow } from "./UserRow";

const PAGE_SIZE = 25;

type Search = {
  q?: string;
  page?: string;
  filter?: "all" | "premium" | "unverified" | "free";
  /**
   * Account kind. Defaults to "humans" so the admin user list isn't
   * polluted by the few hundred shadow (bot) accounts the match
   * runtime mints to fill empty seats.
   */
  kind?: "humans" | "shadows" | "all";
  sort?: "recent" | "elo";
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const filter = sp.filter ?? "all";
  const kind = sp.kind ?? "humans";
  const sort = sp.sort ?? "recent";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: SQL[] = [];
  if (kind === "humans") {
    conditions.push(sql`${users.isShadow} = false`);
  } else if (kind === "shadows") {
    conditions.push(sql`${users.isShadow} = true`);
  }
  if (q) {
    const search = or(
      ilike(users.email, `%${q}%`),
      ilike(users.displayName, `%${q}%`),
      ilike(users.name, `%${q}%`),
      ilike(users.handle, `%${q}%`),
    );
    if (search) conditions.push(search);
  }
  if (filter === "premium") {
    conditions.push(
      sql`(${users.isPremium} = true OR (${users.premiumUntil} IS NOT NULL AND ${users.premiumUntil} > now()))`,
    );
  } else if (filter === "unverified") {
    conditions.push(sql`${users.emailVerified} IS NULL`);
  } else if (filter === "free") {
    conditions.push(
      sql`${users.isPremium} = false AND (${users.premiumUntil} IS NULL OR ${users.premiumUntil} <= now())`,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderBy = sort === "elo" ? desc(users.elo) : desc(users.createdAt);

  const [rows, [{ total } = { total: 0 }]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.displayName,
        rawName: users.name,
        emailVerified: users.emailVerified,
        isPremium: users.isPremium,
        premiumUntil: users.premiumUntil,
        elo: users.elo,
        createdAt: users.createdAt,
        passwordHash: users.passwordHash,
        isShadow: users.isShadow,
      })
      .from(users)
      .where(where)
      .orderBy(orderBy, asc(users.id))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(users)
      .where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Users"
        description={`${total.toLocaleString("fr-FR")} ${total === 1 ? "user" : "users"} matching the current filter.`}
      />

      <form className="mb-4 flex flex-wrap items-center gap-2" method="get">
        <TextInput
          name="q"
          defaultValue={q}
          placeholder="Search by email, name, handle…"
          className="max-w-xs"
        />
        <FilterPill href={hrefWith(sp, { filter: "all", page: "1" })} active={filter === "all"}>
          All
        </FilterPill>
        <FilterPill
          href={hrefWith(sp, { filter: "premium", page: "1" })}
          active={filter === "premium"}
        >
          Premium
        </FilterPill>
        <FilterPill
          href={hrefWith(sp, { filter: "free", page: "1" })}
          active={filter === "free"}
        >
          Free
        </FilterPill>
        <FilterPill
          href={hrefWith(sp, { filter: "unverified", page: "1" })}
          active={filter === "unverified"}
        >
          Unverified
        </FilterPill>

        <span className="ml-3 text-xs text-fg-3">Kind:</span>
        <FilterPill
          href={hrefWith(sp, { kind: "humans", page: "1" })}
          active={kind === "humans"}
        >
          Humans
        </FilterPill>
        <FilterPill
          href={hrefWith(sp, { kind: "shadows", page: "1" })}
          active={kind === "shadows"}
        >
          Shadows
        </FilterPill>
        <FilterPill href={hrefWith(sp, { kind: "all", page: "1" })} active={kind === "all"}>
          Both
        </FilterPill>

        <span className="ml-auto text-xs text-fg-3">Sort:</span>
        <FilterPill href={hrefWith(sp, { sort: "recent", page: "1" })} active={sort === "recent"}>
          Recent
        </FilterPill>
        <FilterPill href={hrefWith(sp, { sort: "elo", page: "1" })} active={sort === "elo"}>
          ELO
        </FilterPill>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>User</TH>
            <TH>Email</TH>
            <TH>Premium</TH>
            <TH>ELO</TH>
            <TH>Joined</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {rows.length === 0 ? (
            <TR>
              <TD colSpan={6} className="py-8 text-center text-fg-3">
                No users match the current filter.
              </TD>
            </TR>
          ) : (
            rows.map((r) => (
              <UserRow
                key={r.id}
                u={{
                  id: r.id,
                  email: r.email,
                  name: r.name ?? r.rawName,
                  emailVerified: r.emailVerified,
                  isPremium: r.isPremium,
                  premiumUntil: r.premiumUntil,
                  elo: r.elo,
                  createdAt: r.createdAt,
                  hasPassword: !!r.passwordHash,
                  isShadow: r.isShadow,
                }}
              />
            ))
          )}
        </tbody>
      </Table>

      <Pagination page={page} totalPages={totalPages} sp={sp} />
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-md border px-2.5 py-1 text-xs",
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-line bg-bg-2 text-fg-2 hover:bg-bg-3",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function Pagination({ page, totalPages, sp }: { page: number; totalPages: number; sp: Search }) {
  if (totalPages <= 1) return null;
  return (
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
  );
}

function hrefWith(sp: Search, patch: Partial<Search>): string {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `/users?${qs}` : "/users";
}
