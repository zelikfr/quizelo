import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

interface SubscriptionCardProps {
  isPremium: boolean;
  premiumUntil: Date | null;
}

const CARD_BG_PREMIUM =
  "linear-gradient(135deg, rgba(255,209,102,0.10), rgba(124,92,255,0.06))";
const CARD_BG_FREE =
  "linear-gradient(135deg, rgba(124,92,255,0.06), rgba(255,255,255,0.02))";

export async function SubscriptionCard({
  isPremium,
  premiumUntil,
}: SubscriptionCardProps) {
  const t = await getTranslations("settings.subscription");
  const locale = await getLocale();

  const formatted = premiumUntil
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(premiumUntil)
    : null;

  if (!isPremium) {
    return (
      <div
        className="flex items-center gap-[18px] rounded-lg border border-white/[0.08] p-[18px]"
        style={{ background: CARD_BG_FREE }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[22px] text-fg-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          ☆
        </div>
        <div className="flex-1">
          <div className="font-display text-sm font-semibold text-fg-1">
            {t("freePlan")}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-fg-3">
            {t("upsellLine")}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-3 py-2 text-[11px] text-gold"
          style={{ borderColor: "rgba(255,209,102,0.4)" }}
          disabled
          title={t("comingSoon")}
        >
          {t("upgrade")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-[18px] rounded-lg border p-[18px]"
      style={{ background: CARD_BG_PREMIUM, borderColor: "rgba(255,209,102,0.3)" }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[22px] text-gold"
        style={{
          background: "rgba(255,209,102,0.18)",
          border: "1px solid rgba(255,209,102,0.5)",
        }}
      >
        ★
      </div>
      <div className="flex-1">
        <div className="font-display text-sm font-semibold text-fg-1">
          {t("plan")}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-fg-3">
          {formatted ? t("renewsOn", { date: formatted }) : t("activeNoExpiry")}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="px-3 py-2 text-[11px]"
        disabled
        title={t("comingSoon")}
      >
        {t("manage")}
      </Button>
    </div>
  );
}
