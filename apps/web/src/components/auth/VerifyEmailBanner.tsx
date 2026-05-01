import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/current-user";
import { ResendVerificationButton } from "./ResendVerificationButton";

interface VerifyEmailBannerProps {
  /** Tighter padding on mobile. */
  compact?: boolean;
  /** Extra classes (e.g. `mx-[18px]` for mobile padding). */
  className?: string;
}

/**
 * Renders a soft warning bar above the home content when the current
 * user hasn't verified their email yet. Hidden when:
 *   - the user is logged out (handled upstream by middleware)
 *   - the user has no email (rare — magic-link only signup edge cases)
 *   - the user has verified
 */
export async function VerifyEmailBanner({
  compact = false,
  className,
}: VerifyEmailBannerProps) {
  const user = await getCurrentUser();
  if (!user || !user.email) return null;

  // The DB row tracks emailVerified; we don't carry it on `user` yet,
  // so we rely on a heuristic: the magic-link verify flow is the only
  // way to ever flip emailVerified, so a freshly-signed-up user is
  // always unverified until they click the link. To check the actual
  // flag we look it up here via getCurrentUser's underlying query —
  // exposed via the `emailVerified` field added to CurrentUser.
  if (user.emailVerified) return null;

  const t = await getTranslations("auth.verifyBanner");

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-lg border border-gold/40 bg-gold/[0.08] ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      } ${className ?? ""}`}
    >
      <span aria-hidden className="text-base text-gold">
        ✉
      </span>
      <div className="flex-1">
        <div className="font-display text-[12px] font-bold text-fg-1">
          {t("title")}
        </div>
        <div className="font-mono text-[10px] text-fg-3">
          {t("hint", { email: user.email })}
        </div>
      </div>
      <ResendVerificationButton label={t("resend")} sentLabel={t("sent")} />
    </div>
  );
}
