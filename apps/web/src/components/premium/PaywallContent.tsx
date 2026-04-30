import { getTranslations } from "next-intl/server";
import { FeatureList } from "@/components/premium/FeatureList";
import { PlanCard } from "@/components/premium/PlanCard";

const TOP_AMBIENT =
  "radial-gradient(ellipse at 50% 30%, rgba(255,209,102,0.18), transparent 60%)";
const TOP_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.20), transparent 55%)";

/**
 * Server-rendered paywall content — the same full-screen layout as the
 * original `/premium` page (desktop centered 720px, mobile stacked
 * column). Hosted inside the client `<PaywallDialog>`.
 */
export async function PaywallContent() {
  const t = await getTranslations("premium");
  const features = t.raw("features") as string[];

  return (
    <>
      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:items-center md:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: TOP_AMBIENT }}
        />

        <div className="relative w-[720px] max-w-[90vw] p-10">
          <div className="mb-7 text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-gold">
              ★ QUIZELO {t("badge")}
            </p>
            <h1
              id="paywall-title"
              className="m-0 mt-2.5 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.025em]"
            >
              {t("titleA")} <span className="text-gold">{t("titleB")}</span>{" "}
              {t("titleC")}
            </h1>
            <p className="mx-auto mt-3 max-w-[480px] text-sm leading-relaxed text-fg-2">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <PlanCard
              duration="month"
              eyebrow={t("plans.monthly.eyebrow")}
              price="4,99 €"
              perPeriod={`/ ${t("plans.monthly.period")}`}
              hint={t("plans.monthly.hint")}
              cta={t("plans.monthly.cta")}
            />
            <PlanCard
              duration="year"
              eyebrow={t("plans.yearly.eyebrow")}
              price="39,99 €"
              perPeriod={`/ ${t("plans.yearly.period")}`}
              hint={t("plans.yearly.hint")}
              cta={t("plans.yearly.cta")}
              highlighted
              badge="−33%"
            />
          </div>

          <div className="mt-[22px]">
            <FeatureList features={features} />
          </div>

          <p className="mt-[18px] text-center text-[10px] leading-relaxed text-fg-3">
            {t("disclaimer")}
          </p>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: TOP_AMBIENT_MOBILE }}
        />

        {/* Hero — top padding leaves room for the close × button */}
        <div className="relative px-[18px] pt-16 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-gold">
            ★ {t("badge")}
          </p>
          <h1
            id="paywall-title-mobile"
            className="m-0 mt-2 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.025em]"
          >
            {t("titleA")} <span className="text-gold">{t("titleB")}</span>{" "}
            {t("titleC")}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-fg-2">{t("subtitle")}</p>
        </div>

        {/* Plans stacked, yearly first */}
        <div className="relative flex flex-col gap-2.5 px-[18px] pt-5">
          <PlanCard
            duration="year"
            eyebrow={t("plans.yearly.eyebrow")}
            price="39,99 €"
            perPeriod={`/ ${t("plans.yearly.period")}`}
            hint={t("plans.yearly.hint")}
            cta={t("plans.yearly.cta")}
            highlighted
            badge="−33%"
          />
          <PlanCard
            duration="month"
            eyebrow={t("plans.monthly.eyebrow")}
            price="4,99 €"
            perPeriod={`/ ${t("plans.monthly.period")}`}
            hint={t("plans.monthly.hint")}
            cta={t("plans.monthly.cta")}
          />
        </div>

        {/* Features */}
        <div className="relative px-[18px] pt-5">
          <FeatureList features={features} />
        </div>

        <div className="flex-1" />

        <div className="relative px-[18px] pb-5 pt-4">
          <p className="text-center text-[10px] leading-relaxed text-fg-3">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </>
  );
}
