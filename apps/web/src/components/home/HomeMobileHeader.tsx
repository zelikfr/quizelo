import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { Wordmark } from "@/components/shared/Wordmark";
import { ME } from "@/lib/game-data";

export async function HomeMobileHeader() {
  const tNav = await getTranslations("home.nav");

  return (
    // Avatar (left) → /profile, wordmark (center) → /home, gear
    // (right) → /settings. The bottom nav handles the four content
    // surfaces (Jouer / Classement / Boutique / Parrainage) so we
    // free header space from duplicate Profile + Settings entries.
    <div className="flex items-center justify-between px-[18px] pt-3">
      <Link href="/profile" aria-label={tNav("profile")} className="no-underline">
        <QAAvatar name={ME.name} seed={ME.seed} size={34} />
      </Link>

      <Link href="/home" className="no-underline">
        <Wordmark className="text-sm" />
      </Link>

      <Link
        href="/settings"
        aria-label={tNav("settings")}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm text-fg-2 no-underline transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-fg-1"
      >
        <span aria-hidden className="font-mono">⚙</span>
      </Link>
    </div>
  );
}
