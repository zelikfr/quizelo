import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Wordmark } from "@/components/shared/Wordmark";
import { QALangToggle } from "@/components/shared/QALangToggle";

const PANEL_GRADIENT =
  "linear-gradient(135deg, rgba(124,92,255,0.18), rgba(255,209,102,0.06))";

/**
 * Renders three direct children — header, middle, footer — so the parent
 * `<aside>` can space them with `justify-between` like the mockup.
 */
export async function LoginBrandPanel() {
  const t = await getTranslations("auth.login.brand");

  const stats = [
    { value: "12.4k", label: t("stats.active") },
    { value: "38k",   label: t("stats.gamesDay") },
    { value: "8",     label: t("stats.cats") },
  ];

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

      {/* Middle — badge + headline + subtitle */}
      <div>
        <p className="mb-4 font-mono text-[11px] tracking-widest3 text-violet-light">
          ◆ {t("badge")}
        </p>
        <h1 className="m-0 font-display text-[56px] font-bold leading-[0.95] tracking-[-0.03em] text-white">
          {t("titleA")}
          <br />
          <span className="text-gold">{t("titleB")}</span> {t("titleC")}
        </h1>
        <p className="mt-4 max-w-[420px] text-[15px] leading-relaxed text-fg-2">
          {t("subtitle")}
        </p>
      </div>

      {/* Bottom — quick stats */}
      <div className="flex gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 p-3"
          >
            <div className="font-mono text-[9px] tracking-[0.15em] text-fg-3">
              {s.label}
            </div>
            <div className="font-display font-mono text-[22px] font-bold text-white">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
