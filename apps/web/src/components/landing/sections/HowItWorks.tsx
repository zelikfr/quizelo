import { getTranslations } from "next-intl/server";
import { PhaseCard, type Phase } from "@/components/landing/sections/PhaseCard";
import { FlowBar } from "@/components/landing/sections/FlowBar";

export async function HowItWorks() {
  const t = await getTranslations("hiw");
  const phases = t.raw("phases") as Phase[];

  return (
    <section
      id="how-it-works"
      className="relative mx-auto max-w-[1240px] px-5 py-10 md:px-14 md:pt-[120px] md:pb-20"
    >
      {/* Header */}
      <div className="mb-8 md:mb-14 md:grid md:grid-cols-2 md:items-end md:gap-12">
        <div>
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-violet-light md:mb-3.5 md:text-[11px] md:tracking-widest3">
            ◆ {t("badge")}
          </p>
          <h2 className="m-0 font-display text-[28px] font-bold leading-[1] tracking-[-0.025em] md:text-[56px] md:leading-[0.95] md:tracking-[-0.03em]">
            {t("h2a")}
            <br />
            <span className="text-gold">{t("h2b")}</span> {t("h2c")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-fg-2 md:hidden">
            {t("subShort")}
          </p>
        </div>
        <p className="m-0 hidden max-w-[480px] text-base leading-relaxed text-fg-2 md:block">
          {t("sub")}
        </p>
      </div>

      {/* Phase cards */}
      <div className="mb-6 flex flex-col gap-2.5 md:grid md:grid-cols-3 md:gap-4">
        {phases.map((phase, i) => (
          <PhaseCard key={i} phase={phase} index={i} />
        ))}
      </div>

      <FlowBar
        flowLabel={t("flow")}
        startLabel={t("start")}
        championLabel={t("champion")}
      />
    </section>
  );
}
