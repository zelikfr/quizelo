import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { QALangToggle } from "@/components/shared/QALangToggle";
import { Wordmark } from "@/components/shared/Wordmark";

export async function Nav() {
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const links = [
    { label: tNav("howItWorks"), href: "#how-it-works" },
    { label: tNav("categories"), href: "#categories"  },
    { label: tNav("ranks"),      href: "#ranks"       },
    { label: tNav("premium"),    href: "#premium"     },
    { label: tNav("discord"),    href: "#discord"     },
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-surface-1/85 px-5 py-3.5 backdrop-blur-xl md:bg-surface-1/70 md:px-14 md:py-5">
      <Wordmark className="text-sm md:text-lg" />

      <ul className="hidden list-none items-center gap-7 p-0 md:flex">
        {links.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              className="text-sm text-fg-2 no-underline transition-colors duration-120 hover:text-fg-1"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 md:gap-3">
        <QALangToggle />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/login">{tCommon("signIn")}</Link>
        </Button>
        <Button variant="primary" size="sm" className="hidden md:inline-flex" asChild>
          <Link href="/auth/signup">{tCommon("play")} ›</Link>
        </Button>
      </div>
    </nav>
  );
}
