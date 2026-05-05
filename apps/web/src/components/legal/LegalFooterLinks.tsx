import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const LINKS = [
  { href: "/legal/terms", key: "terms" },
  { href: "/legal/cgv", key: "cgv" },
  { href: "/legal/privacy", key: "privacy" },
  { href: "/legal/mentions", key: "mentions" },
  { href: "/legal/cookies", key: "cookies" },
] as const;

interface LegalFooterLinksProps {
  /** Visual alignment — defaults to centered, the most common case. */
  align?: "center" | "start";
}

/**
 * Compact footer row of legal page links — TOS / Privacy / Legal /
 * Cookies. Lifted into its own component so AuthShell, the landing
 * footer, and any future public-facing surface can drop them in
 * without re-implementing the i18n + nav scaffolding.
 */
export async function LegalFooterLinks({
  align = "center",
}: LegalFooterLinksProps) {
  const t = await getTranslations("legalNav");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="font-mono text-[10px] tracking-widest2 text-fg-3 no-underline transition-colors duration-120 hover:text-fg-1"
        >
          {t(l.key)}
        </Link>
      ))}
    </nav>
  );
}
