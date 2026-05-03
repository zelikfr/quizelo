import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QARankBadge } from "@/components/shared/QARankBadge";
import { getCurrentUser } from "@/lib/current-user";
import { formatSeasonNumber, getCurrentSeason } from "@/lib/season";

const CARD_BG =
  "linear-gradient(135deg, rgba(124,92,255,0.12), rgba(255,209,102,0.06))";

/** Mobile-only — combined rank + ELO + season indicator card. */
export async function PlayerStatusCard() {
  const [t, locale, user, season] = await Promise.all([
    getTranslations("home.status"),
    getLocale() as Promise<Locale>,
    getCurrentUser(),
    Promise.resolve(getCurrentSeason()),
  ]);

  // Fallback to a sensible neutral ELO when there's no session — keeps
  // the card meaningful on the marketing variant of /home.
  const elo = user?.elo ?? 1000;

  return (
    <div className="px-[18px] pt-5">
      <div
        className="flex items-center gap-3 rounded-[14px] border border-white/[0.08] p-3.5"
        style={{ background: CARD_BG }}
      >
        <QARankBadge elo={elo} locale={locale} />
        <div className="flex-1">
          <div className="font-mono text-[10px] text-fg-3">{t("yourElo")}</div>
          <div className="font-mono text-[18px] font-semibold text-white">{elo}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] text-fg-3">
            S{formatSeasonNumber(season.number)}
          </div>
          <div className="font-mono text-[12px] text-gold">
            {season.daysLeft}
            {t("daysShort")}
          </div>
        </div>
      </div>
    </div>
  );
}
