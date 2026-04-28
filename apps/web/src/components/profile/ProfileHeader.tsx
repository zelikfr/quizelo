import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QARankBadge } from "@/components/shared/QARankBadge";
import { PROFILE_ME } from "@/lib/profile-data";

/** Format a YYYY-MM-DD as e.g. "Jan 2026" / "Janv. 2026". */
function formatJoined(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "short",
  }).format(d);
}

interface ProfileHeaderProps {
  compact?: boolean;
}

export async function ProfileHeader({ compact = false }: ProfileHeaderProps) {
  const t = await getTranslations("profile");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  const joined = formatJoined(PROFILE_ME.joinedAt, locale);
  const displayName = locale === "en" ? "You" : tCommon("you");

  if (compact) {
    return (
      <div className="flex items-center gap-3.5 px-[18px] pt-5">
        <QAAvatar
          name={PROFILE_ME.name}
          seed={PROFILE_ME.seed}
          size={56}
          ring="#FFD166"
        />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[20px] font-bold">{displayName}</div>
          <div className="mt-1">
            <QARankBadge elo={PROFILE_ME.elo} locale={locale} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <QAAvatar
        name={PROFILE_ME.name}
        seed={PROFILE_ME.seed}
        size={88}
        ring="#FFD166"
      />
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="m-0 font-display text-[36px] font-bold tracking-[-0.025em]">
            {displayName}
          </h1>
          <QARankBadge elo={PROFILE_ME.elo} locale={locale} />
        </div>
        <div className="mt-1 font-mono text-xs text-fg-3">
          @{PROFILE_ME.handle} · {t("joined", { date: joined })}
        </div>
      </div>
    </div>
  );
}
