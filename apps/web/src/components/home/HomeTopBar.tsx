import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { Wordmark } from "@/components/shared/Wordmark";
import { QARankBadge } from "@/components/shared/QARankBadge";
import { UserMenu } from "@/components/home/UserMenu";
import { getCurrentUser } from "@/lib/current-user";

const NAV = [
  { key: "leaderboard", href: "/leaderboard" },
  { key: "shop",        href: "/shop"        },
] as const;

type NavKey = (typeof NAV)[number]["key"];

interface HomeTopBarProps {
  /**
   * Which top-bar item is currently active. The Wordmark itself acts as
   * the home link, so "home" doesn't need an explicit nav entry.
   */
  active?: NavKey;
}

export async function HomeTopBar({ active }: HomeTopBarProps = {}) {
  const t = await getTranslations("home.nav");
  const locale = (await getLocale()) as Locale;
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.08] bg-surface-1/85 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-8">
        <Link href="/home" className="no-underline" aria-label={t("home")}>
          <Wordmark className="text-[20px] tracking-[0.06em]" />
        </Link>
        <nav className="flex gap-6 text-[13px] text-fg-2">
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={
                n.key === active
                  ? "font-semibold text-white no-underline"
                  : "text-fg-2 no-underline transition-colors duration-120 hover:text-fg-1"
              }
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-fg-3">{user.elo} ELO</span>
          <QARankBadge elo={user.elo} locale={locale} />
          <UserMenu name={user.name} seed={user.avatarId} />
        </div>
      )}
    </header>
  );
}
