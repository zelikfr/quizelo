import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { CATEGORIES } from "@/lib/landing-data";
import { CategoryCard } from "@/components/landing/sections/CategoryCard";

export async function Categories() {
  const t = await getTranslations("categories");
  const locale = (await getLocale()) as Locale;
  const names = t.raw("names") as Record<string, string>;

  return (
    <section
      id="categories"
      className="relative mx-auto max-w-[1240px] px-5 py-10 md:px-14 md:py-20"
    >
      {/* Header */}
      <div className="mb-6 md:mb-10 md:flex md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-gold md:mb-3.5 md:text-[11px] md:tracking-widest3">
            ✦ {t("badge")}
          </p>
          <h2 className="m-0 font-display text-[28px] font-bold leading-[1] tracking-[-0.025em] md:text-[56px] md:leading-[0.95] md:tracking-[-0.03em]">
            {t("h2a")}
            <br />
            {t("h2b")} <span className="text-violet">{t("h2c")}</span>
            {t("h2d")}
          </h2>
        </div>
        <p className="m-0 hidden max-w-[320px] text-sm leading-relaxed text-fg-3 md:block">
          {t("sub")}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {CATEGORIES.map((c, i) => (
          <CategoryCard
            key={c.id}
            index={i}
            icon={c.icon}
            tint={c.tint}
            label={names[c.id] ?? c.id}
            sample={c.sample}
            locale={locale}
          />
        ))}
      </div>

      {/* Daily counter */}
      <div className="mt-3 flex items-center justify-center gap-2 md:mt-5 md:gap-2.5">
        <span className="font-mono text-[9px] tracking-widest2 text-fg-3 md:text-[10px]">
          {t("daily")}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-success [box-shadow:0_0_8px_#4ADE80]" />
      </div>
    </section>
  );
}
