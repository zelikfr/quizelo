import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { HomeMobileHeader } from "@/components/home/HomeMobileHeader";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { PlayerStatusCard } from "@/components/home/PlayerStatusCard";
import { QuickPlayCard } from "@/components/home/QuickPlayCard";
import { RankedCard } from "@/components/home/RankedCard";
import { getActiveMatchAction } from "@/lib/match-actions";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // If the user is mid-match (lobby, any phase, finalist seat) bounce
  // them straight back to their match. Prevents a player who reloaded
  // or navigated away by mistake from missing the rest of their game.
  // Defeated / winner / left players aren't caught here — the API
  // endpoint filters to status `active|finalist` only.
  const active = await getActiveMatchAction();
  if (active) {
    redirect({ href: `/match/${active.matchId}`, locale });
  }

  const t = await getTranslations("home");

  return (
    <main className="bg-surface-1 qa-scan relative isolate min-h-screen overflow-hidden">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:min-h-screen md:flex-col">
        <HomeTopBar />
        <div className="flex flex-1 items-center gap-8 px-14 py-10">
          {/* Left: hero */}
          <section className="flex max-w-[560px] flex-1 flex-col">
            <p className="text-violet-light mb-4 font-mono text-[11px] tracking-[0.2em]">
              ◆ {t("hero.badge")}
            </p>
            <h1 className="font-display m-0 text-[64px] font-bold leading-[0.95] tracking-[-0.03em]">
              {t("hero.line1")}
              <br />
              <span className="text-gold">{t("hero.line2")}</span> {t("hero.line3")}
            </h1>
            <p className="text-fg-2 mt-5 max-w-[480px] text-base leading-relaxed">
              {t("hero.copy")}
            </p>
          </section>

          {/* Right: mode cards — stacked on md, side-by-side on lg+ */}
          <section className="ml-auto flex w-[480px] flex-col items-start gap-4 xl:w-auto xl:flex-1 xl:flex-row">
            <QuickPlayCard className="xl:flex-1" />
            <RankedCard className="xl:flex-1" />
          </section>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      {/* `pb-24` reserves room for the fixed bottom nav so the last
          card isn't hidden behind it. */}
      <div className="flex min-h-screen flex-col pb-24 md:hidden">
        <HomeMobileHeader />
        <PlayerStatusCard />

        <div className="px-[18px] pb-4 pt-7">
          <p className="text-violet-light mb-2 font-mono text-[10px] tracking-[0.18em]">
            ◆ {t("mobile.chooseMode")}
          </p>
          <h1 className="font-display m-0 text-[32px] font-bold leading-[0.95] tracking-[-0.025em]">
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
        <HomeMobileBottomNav active="play" />
      </div>
    </main>
  );
}
