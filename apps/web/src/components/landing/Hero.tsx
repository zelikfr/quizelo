import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LiveMatchCard } from "@/components/landing/LiveMatchCard";
import { cn } from "@/lib/cn";

type Stat = { value: string; labelKey: "playersOnline" | "gamesDay" | "rating"; gold?: boolean };

const STATS: readonly Stat[] = [
  { value: "12.4k", labelKey: "playersOnline" },
  { value: "38k",   labelKey: "gamesDay" },
  { value: "4.9★",  labelKey: "rating", gold: true },
];

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <header className="relative z-10 mx-auto max-w-[1240px] px-5 pt-8 pb-10 md:px-14 md:pt-[60px] md:pb-[100px]">
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-12">
        {/* Copy */}
        <div>
          <p className="mb-2.5 font-mono text-[9px] tracking-[0.25em] text-violet-light md:mb-3.5 md:text-[11px] md:tracking-widest3">
            ◆ {t("seasonBadge")}
          </p>

          <h1 className="m-0 font-display text-[44px] font-bold leading-[0.92] tracking-[-0.03em] md:text-[78px] md:tracking-[-0.035em]">
            {t("line1")}
            <br />
            {t("line2")}
            <br />
            <span className="text-gold">{t("line3")}</span>
          </h1>

          <p className="mt-[22px] hidden max-w-[460px] text-[17px] leading-relaxed text-fg-2 md:block">
            {t("copy")}
          </p>
          <p className="mt-3 text-[13px] leading-[1.45] text-fg-2 md:hidden">
            {t("copyShort")}
          </p>

          {/* CTA — width-matched to the copy above */}
          <div className="mt-5 md:mt-[26px] md:max-w-[460px]">
            <Button variant="gold" size="full" asChild>
              <Link href="/auth/signup">{t("ctaPlay")} ▸</Link>
            </Button>
          </div>

          {/* Stats */}
          <ul className="mt-4 flex list-none gap-2 p-0 md:mt-7 md:gap-7">
            {STATS.map((s) => (
              <li
                key={s.labelKey}
                className="flex-1 rounded-lg border border-white/[0.08] bg-gradient-surface p-2.5 text-center md:flex-none md:border-0 md:bg-transparent md:p-0 md:text-left"
              >
                <div
                  className={cn(
                    "font-display text-base font-bold tabular-nums md:text-[28px]",
                    s.gold ? "text-gold" : "text-white",
                  )}
                >
                  {s.value}
                </div>
                <div className="font-mono text-[8px] tracking-[0.18em] text-fg-3 md:text-[9px] md:tracking-widest2">
                  {t(`stats.${s.labelKey}`)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Live match card */}
        <div className="mt-2 md:mt-0">
          <LiveMatchCard />
        </div>
      </div>
    </header>
  );
}
