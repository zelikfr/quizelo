import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { Wordmark } from "@/components/shared/Wordmark";
import { PaywallContent } from "@/components/premium/PaywallContent";
import { PremiumCrown } from "@/components/premium/PremiumCrown";
import { ME } from "@/lib/game-data";

export async function HomeMobileHeader() {
  const t = await getTranslations("premium");
  const tNav = await getTranslations("home.nav");

  return (
    <div className="flex items-center justify-between px-[18px] pt-3">
      <Link href="/profile" aria-label={tNav("profile")} className="no-underline">
        <QAAvatar name={ME.name} seed={ME.seed} size={34} />
      </Link>

      <Link href="/home" className="no-underline">
        <Wordmark className="text-sm" />
      </Link>

      <PremiumCrown ariaLabel={tNav("premium")} closeLabel={t("close")}>
        <PaywallContent />
      </PremiumCrown>
    </div>
  );
}
