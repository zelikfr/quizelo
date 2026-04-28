import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const ITEMS = [
  { key: "play",        href: "/home",        glyph: "◆" },
  { key: "leaderboard", href: "/leaderboard", glyph: "☰" },
  { key: "profile",     href: "/profile",     glyph: "○" },
] as const;

type ItemKey = (typeof ITEMS)[number]["key"];

interface HomeMobileBottomNavProps {
  active?: ItemKey;
}

export async function HomeMobileBottomNav({
  active = "play",
}: HomeMobileBottomNavProps = {}) {
  const t = await getTranslations("home.nav");

  return (
    <nav className="flex border-t border-white/[0.08] bg-black/40 px-0 pb-6 pt-3">
      {ITEMS.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={cn(
            "flex-1 text-center no-underline",
            it.key === active ? "text-violet" : "text-fg-3",
          )}
        >
          <div className="font-mono text-base">{it.glyph}</div>
          <div className="mt-0.5 font-mono text-[9px] uppercase">{t(it.key)}</div>
        </Link>
      ))}
    </nav>
  );
}
