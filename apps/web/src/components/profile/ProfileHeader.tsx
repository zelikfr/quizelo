import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QARankBadge } from "@/components/shared/QARankBadge";

interface ProfileHeaderProps {
  user: {
    name: string;
    handle: string | null;
    avatarId: number;
    elo: number;
    joinedAt: Date;
  };
  compact?: boolean;
}

/** "Jan 2026" / "janv. 2026" depending on locale. */
function formatJoined(d: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "short",
  }).format(d);
}

export async function ProfileHeader({ user, compact = false }: ProfileHeaderProps) {
  const t = await getTranslations("profile");
  const locale = (await getLocale()) as Locale;

  const joined = formatJoined(user.joinedAt, locale);
  const displayName = user.name;
  const handleLabel = user.handle ? `@${user.handle}` : "—";

  if (compact) {
    return (
      <div className="flex items-center gap-3.5 px-[18px] pt-5">
        <QAAvatar
          name={displayName}
          seed={user.avatarId}
          size={56}
          ring="#FFD166"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[20px] font-bold">
            {displayName}
          </div>
          <div className="mt-1">
            <QARankBadge elo={user.elo} locale={locale} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <QAAvatar
        name={displayName}
        seed={user.avatarId}
        size={88}
        ring="#FFD166"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="m-0 truncate font-display text-[36px] font-bold tracking-[-0.025em]">
            {displayName}
          </h1>
          <QARankBadge elo={user.elo} locale={locale} />
        </div>
        <div className="mt-1 truncate font-mono text-xs text-fg-3">
          {handleLabel} · {t("joined", { date: joined })}
        </div>
      </div>
    </div>
  );
}
