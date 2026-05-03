import { getTranslations } from "next-intl/server";
import { Paywall } from "@/components/premium/Paywall";
import { PaywallContent } from "@/components/premium/PaywallContent";

interface ShopPremiumGateProps {
  /** Tighter layout for the mobile column. */
  compact?: boolean;
}

/**
 * "Premium-only" lockout shown to free users on /shop. Renders a
 * single card with a Paywall trigger so they can upgrade in-place
 * (the same Paywall used by the ranked CTA on /home).
 *
 * The actual buy buttons (CreditPackCard, BoostCardCard) are
 * intentionally *not* rendered for free users — both because the
 * server actions also reject non-premium clients (defence in depth)
 * and because we don't want to bait clicks on something they can't
 * complete.
 */
export async function ShopPremiumGate({ compact = false }: ShopPremiumGateProps) {
  const t = await getTranslations("shop.premiumGate");
  const tPremium = await getTranslations("premium");

  return (
    <div
      className={
        compact
          ? "mx-[18px] mt-3 rounded-lg border border-gold/30 p-5"
          : // Desktop: constrained width + centered for visual focus,
            // since the card alone replaces the wide grid of plans.
            "mx-auto mt-10 w-full max-w-md rounded-lg border border-gold/30 p-6 text-center"
      }
      style={{
        background:
          "linear-gradient(180deg, rgba(255,209,102,0.10), rgba(124,92,255,0.04))",
        boxShadow: "0 24px 60px -28px rgba(255,209,102,0.4)",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
        ★ {t("badge")}
      </div>
      <h2
        className={
          compact
            ? "mt-1.5 font-display text-[20px] font-bold tracking-[-0.02em] text-white"
            : "mt-2 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-white"
        }
      >
        {t("title")}
      </h2>
      <p
        className={
          compact
            ? "mt-1.5 text-[12px] leading-relaxed text-fg-2"
            : "mt-2 text-[12px] leading-relaxed text-fg-2"
        }
      >
        {t("body")}
      </p>

      <ul
        className={
          compact
            ? "mt-3 space-y-1.5 text-[11px] text-fg-2"
            : "mt-4 inline-flex flex-col items-start gap-1.5 text-[12px] text-fg-2"
        }
      >
        <li className="flex items-center gap-2">
          <span className="text-gold">◆</span>
          {t("perks.coins")}
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gold">◆</span>
          {t("perks.boosts")}
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gold">◆</span>
          {t("perks.ranked")}
        </li>
      </ul>

      <div className={compact ? "mt-4" : "mt-5"}>
        <Paywall
          triggerLabel={`${t("cta")} ▸`}
          triggerVariant="gold"
          closeLabel={tPremium("close")}
        >
          <PaywallContent />
        </Paywall>
      </div>
    </div>
  );
}
