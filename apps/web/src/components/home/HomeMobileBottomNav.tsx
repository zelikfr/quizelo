import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/cn";

// Four entry points for the mobile bottom nav. Profile lives in the
// top-left avatar of `HomeMobileHeader` and Settings in its top-right
// gear, so we don't duplicate them here. The bottom nav focuses on
// the four content surfaces a player navigates between mid-session.
const ITEMS = [
  { key: "play",        href: "/home",        glyph: "◆" },
  { key: "leaderboard", href: "/leaderboard", glyph: "☰" },
  { key: "shop",        href: "/shop",        glyph: "◇" },
  { key: "referral",    href: "/referral",    glyph: "⇆" },
] as const;

type ItemKey = (typeof ITEMS)[number]["key"];

interface HomeMobileBottomNavProps {
  /** Highlight one item; pass nothing on pages that aren't in the nav (e.g. /settings, /profile). */
  active?: ItemKey;
}

export async function HomeMobileBottomNav({
  active,
}: HomeMobileBottomNavProps = {}) {
  const t = await getTranslations("home.nav");

  return (
    <nav
      // Fixed to the viewport bottom on mobile so the nav stays
      // reachable even when the page content overflows. We pad the
      // bottom with `env(safe-area-inset-bottom)` for iOS home-bar
      // devices, with a 1rem floor so non-notch phones still get
      // breathing room. Pages that mount this nav need `pb-20` (or
      // more) on their mobile content container so the last row of
      // content isn't hidden behind it.
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/[0.08] bg-black/80 px-0 pt-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
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
          {/* whitespace-nowrap + truncate so 6 items fit on narrow
              phones without wrapping a label across two lines. */}
          <div className="mt-0.5 truncate whitespace-nowrap font-mono text-[9px] uppercase">
            {t(it.key)}
          </div>
        </Link>
      ))}
    </nav>
  );
}
