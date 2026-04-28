import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { REFERRAL_CODE, SHARE_PLATFORMS } from "@/lib/referral-data";

const CARD_BG =
  "linear-gradient(135deg, rgba(124,92,255,0.18), rgba(255,209,102,0.06))";
const CARD_BG_MOBILE =
  "linear-gradient(135deg, rgba(124,92,255,0.20), rgba(255,209,102,0.08))";

interface ReferralCodeCardProps {
  compact?: boolean;
}

export async function ReferralCodeCard({ compact = false }: ReferralCodeCardProps) {
  const t = await getTranslations("referral.code");

  if (compact) {
    return (
      <div
        className="rounded-[14px] border p-3.5"
        style={{ background: CARD_BG_MOBILE, borderColor: "rgba(124,92,255,0.4)" }}
      >
        <div className="font-mono text-[9px] tracking-[0.18em] text-fg-3">
          {t("titleShort")}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="flex-1 rounded-[10px] border-dashed border bg-black/40 px-3.5 py-3 text-center font-mono text-lg font-bold tracking-[0.15em] text-gold"
            style={{ borderColor: "rgba(255,209,102,0.4)" }}
          >
            {REFERRAL_CODE}
          </div>
          <Button variant="ghost" size="sm" className="px-3 py-2.5" aria-label={t("copy")}>
            ⧉
          </Button>
        </div>
        <Button variant="primary" size="full" className="mt-2.5 justify-center py-2.5 text-xs">
          {t("share")} ▸
        </Button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-5"
      style={{ background: CARD_BG, borderColor: "rgba(124,92,255,0.4)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.2em] text-fg-3">
        {t("title")}
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <div
          className="flex-1 rounded-xl border-dashed border bg-black/40 px-[18px] py-3.5 font-mono text-[26px] font-bold tracking-[0.15em] text-gold"
          style={{ borderColor: "rgba(255,209,102,0.4)" }}
        >
          {REFERRAL_CODE}
        </div>
        <Button variant="ghost" size="md" className="px-3.5 py-3">
          ⧉ {t("copy")}
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        {SHARE_PLATFORMS.map((p) => (
          <Button
            key={p}
            variant="ghost"
            size="full"
            className="flex-1 justify-center py-2 text-[11px]"
          >
            {p}
          </Button>
        ))}
      </div>
    </div>
  );
}
