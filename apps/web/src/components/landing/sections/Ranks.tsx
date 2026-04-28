import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { RANKS, rankLabel, rankRange } from "@/lib/ranks";
import { REWARD_TINTS } from "@/lib/landing-data";
import { RankTier } from "@/components/landing/sections/RankTier";
import { SeasonCard } from "@/components/landing/sections/SeasonCard";
import { RewardCard, type Reward } from "@/components/landing/sections/RewardCard";

export async function Ranks() {
  const t = await getTranslations("ranks");
  const locale = (await getLocale()) as Locale;
  const rewards = t.raw("rewards") as Reward[];

  return (
    <section
      id="ranks"
      className="relative mx-auto max-w-[1240px] px-5 py-10 md:px-14 md:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,209,102,0.10), transparent 60%)",
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-8 md:mb-14 md:text-center">
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-gold md:mb-3.5 md:text-[11px] md:tracking-widest3">
            ★ {t("badge")}
          </p>
          <h2 className="m-0 font-display text-[28px] font-bold leading-[1] tracking-[-0.025em] md:mx-auto md:max-w-[820px] md:text-[56px] md:leading-[0.95] md:tracking-[-0.03em]">
            {t("h2a")} <span className="text-rank-elite">{t("h2b")}</span>
            {t("h2c")}
            <br />
            {t("h2d")}
          </h2>
          <p className="mx-auto mt-[18px] hidden max-w-[600px] text-base leading-relaxed text-fg-2 md:block">
            {t("sub")}
          </p>
        </div>

        {/* ELO Ladder */}
        <div className="mb-6 rounded-[14px] border border-white/[0.08] bg-gradient-surface p-4 md:mb-8 md:rounded-[18px] md:p-7">
          <p className="mb-3 font-mono text-[9px] tracking-widest2 text-fg-3 md:mb-5 md:text-[10px]">
            {t("eloLabel")}
          </p>
          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar md:gap-3 md:overflow-visible md:grid md:pb-0"
            style={{ gridTemplateColumns: `repeat(${RANKS.length}, 1fr)` }}
          >
            {RANKS.map((rank, i) => (
              <RankTier
                key={rank.name}
                rank={rank}
                label={rankLabel(rank, locale)}
                range={rankRange(i)}
              />
            ))}
          </div>
        </div>

        {/* Season + Rewards */}
        <div
          className="flex flex-col gap-4 md:grid md:items-stretch md:gap-6"
          style={{ gridTemplateColumns: "1fr 1.4fr" }}
        >
          <SeasonCard
            badge={t("seasonBadge")}
            title={t("seasonH")}
            body={t("seasonP")}
            daysLeft="23"
            daysLabel={t("days")}
            seasonValue="S03"
            seasonLabel={t("seasonLbl")}
          />

          <div className="flex flex-col gap-2 md:gap-2.5">
            {rewards.map((reward, i) => (
              <RewardCard key={i} reward={reward} tint={REWARD_TINTS[i]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
