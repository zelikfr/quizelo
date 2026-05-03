"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

const NAV: Array<{ href: string; label: string; icon: string }> = [
  { href: "/", label: "Dashboard", icon: "▤" },
  { href: "/users", label: "Users", icon: "◍" },
  { href: "/questions", label: "Questions", icon: "?" },
  { href: "/matches", label: "Matches", icon: "▶" },
  { href: "/analytics", label: "Analytics", icon: "≡" },
];

export function Sidebar({ userEmail }: { userEmail: string | null | undefined }) {
  const pathname = usePathname();

  return (
    <aside className="relative z-10 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-bg-1">
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="block">
          <div className="text-xs uppercase tracking-[0.3em] text-fg-3">Quizelo</div>
          <div className="mt-1 text-lg font-semibold text-fg-0">Backoffice</div>
        </Link>
      </div>

      <nav className="flex-1 px-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-bg-3 text-fg-0"
                  : "text-fg-2 hover:bg-bg-2 hover:text-fg-1",
              ].join(" ")}
            >
              <span className="w-4 text-center text-fg-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-3 text-xs text-fg-3">
        <div className="truncate text-fg-2">{userEmail ?? "—"}</div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-2 text-fg-3 underline-offset-2 hover:text-fg-1 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
