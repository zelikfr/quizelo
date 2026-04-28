import { setRequestLocale, getTranslations } from "next-intl/server";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { HomeMobileHeader } from "@/components/home/HomeMobileHeader";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { PlayerStatusCard } from "@/components/home/PlayerStatusCard";
import { QuickPlayCard } from "@/components/home/QuickPlayCard";
import { RankedCard } from "@/components/home/RankedCard";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:flex-col md:min-h-screen">
        <HomeTopBar />
        <div className="flex flex-1 items-center gap-8 px-14 py-10">
          {/* Left: hero */}
          <section className="flex max-w-[560px] flex-1 flex-col">
            <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-violet-light">
              ◆ {t("hero.badge")}
            </p>
            <h1 className="m-0 font-display text-[64px] font-bold leading-[0.95] tracking-[-0.03em]">
              {t("hero.line1")}
              <br />
              <span className="text-gold">{t("hero.line2")}</span> {t("hero.line3")}
            </h1>
            <p className="mt-5 max-w-[480px] text-base leading-relaxed text-fg-2">
              {t("hero.copy")}
            </p>
          </section>

          {/* Right: mode cards — stacked on md, side-by-side on lg+ */}
          <section className="ml-auto flex w-[480px] flex-col gap-4 xl:w-auto xl:flex-1 xl:flex-row">
            <QuickPlayCard className="xl:flex-1" />
            <RankedCard className="xl:flex-1" />
          </section>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <HomeMobileHeader />
        <PlayerStatusCard />

        <div className="px-[18px] pb-4 pt-7">
          <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-violet-light">
            ◆ {t("mobile.chooseMode")}
          </p>
          <h1 className="m-0 font-display text-[32px] font-bold leading-[0.95] tracking-[-0.025em]">
            {t("mobile.line1")}
            <br />
            <span className="text-gold">{t("mobile.line2")}</span> {t("mobile.line3")}
          </h1>
        </div>

        <div className="flex flex-col gap-3 px-[18px]">
          <QuickPlayCard compact />
          <RankedCard compact />
        </div>

        <div className="flex-1" />
        <HomeMobileBottomNav />
      </div>
    </main>
  );
}
