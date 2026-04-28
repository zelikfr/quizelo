import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Wordmark } from "@/components/shared/Wordmark";
import { QALangToggle } from "@/components/shared/QALangToggle";

const PANEL_GRADIENT =
  "linear-gradient(135deg, rgba(255,209,102,0.10), rgba(124,92,255,0.10))";

const PERK_GLYPHS = ["◆", "✦", "☰", "★"] as const;

/**
 * Two direct children — the wordmark/toggle pinned at the top, and the
 * middle content vertically centered in the remaining space (the
 * "already a member?" line lives in the form column instead).
 */
export async function SignupBrandPanel() {
  const t = await getTranslations("auth.signup.brand");
  const perks = t.raw("perks") as string[];

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: PANEL_GRADIENT }}
      />

      {/* Top — wordmark + lang toggle */}
      <header className="flex items-center justify-between font-display text-[22px] font-bold tracking-[0.08em]">
        <Link href="/" className="no-underline">
          <Wordmark />
        </Link>
        <QALangToggle />
      </header>

      {/* Middle — vertically centered in the remaining space */}
      <div className="flex flex-1 flex-col justify-center">
        <div>
          <p className="mb-4 font-mono text-[11px] tracking-widest3 text-gold">
            ◆ {t("badge")}
          </p>
          <h1 className="m-0 font-display text-[52px] font-bold leading-[0.95] tracking-[-0.03em] text-white">
            {t("titleA")} <span className="text-gold">{t("titleB")}</span>
            {t("titleC")}
            <br />
            {t("titleD")}
          </h1>

          <ul className="mt-6 flex list-none flex-col gap-3 p-0">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet/40 bg-violet/[0.18] font-display font-bold text-violet-light"
                >
                  {PERK_GLYPHS[i]}
                </span>
                <span className="text-sm text-fg-1">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
