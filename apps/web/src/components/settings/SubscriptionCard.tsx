import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

const CARD_BG =
  "linear-gradient(135deg, rgba(255,209,102,0.10), rgba(124,92,255,0.06))";

export async function SubscriptionCard() {
  const t = await getTranslations("settings.subscription");

  return (
    <div
      className="flex items-center gap-[18px] rounded-lg border p-[18px]"
      style={{ background: CARD_BG, borderColor: "rgba(255,209,102,0.3)" }}
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
          {t("renewsLine")}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="px-3 py-2 text-[11px]">
        {t("manage")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="px-3 py-2 text-[11px] text-danger"
        style={{ borderColor: "rgba(255,77,109,0.3)" }}
      >
        {t("cancel")}
      </Button>
    </div>
  );
}
