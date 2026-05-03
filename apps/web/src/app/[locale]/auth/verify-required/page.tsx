import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@quizelo/auth";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginBrandPanel } from "@/components/auth/LoginBrandPanel";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
import { SignOutLink } from "@/components/auth/SignOutLink";

interface VerifyRequiredPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Hard gate for unverified accounts. The middleware redirects every
 * route here until the JWT carries an `emailVerified` claim.
 *
 * IMPORTANT: this page MUST read the same source of truth as the
 * middleware (the JWT) and not a freshly-fetched DB row. Otherwise an
 * out-of-band verify (admin "Force verify" button, or any DB tweak)
 * creates a redirect loop:
 *   - DB says verified → page redirects to /home
 *   - JWT still says unverified → middleware redirects back here
 *   - …forever.
 * The user has to sign out and back in (or click a magic link) for the
 * JWT to refresh, which is the expected UX on a force-verify.
 */
export default async function VerifyRequiredPage({
  params,
}: VerifyRequiredPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  // Not signed in → middleware shouldn't have sent us here, but fall
  // back gracefully if someone hits the URL directly.
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // JWT says verified → bounce home. Same source the middleware uses,
  // so we don't ping-pong with the gate above.
  if (session.user.emailVerified) {
    redirect("/home");
  }

  const t = await getTranslations("auth.verifyRequired");
  const tBanner = await getTranslations("auth.verifyBanner");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell brand={<LoginBrandPanel />}>
      <p className="font-mono text-[11px] tracking-widest3 text-fg-3">
        ◆ {t("badge")}
      </p>
      <h2 className="mt-2 font-display text-[36px] font-bold leading-[1] tracking-[-0.025em] text-white">
        {t("title")}
      </h2>
      <p className="mt-3 mb-6 text-[14px] leading-relaxed text-fg-2">
        {t("body", { email: session.user.email ?? "" })}
      </p>

      <div
        className="mb-6 rounded-md border border-white/[0.08] bg-surface-2/80 px-4 py-3 text-[12px] text-fg-3"
        role="status"
      >
        {t("hint")}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <ResendVerificationButton
          label={tBanner("resend")}
          sentLabel={tBanner("sent")}
        />
        <SignOutLink label={tCommon("signOut")} />
      </div>

      <Link
        href="/auth/login"
        className="font-semibold text-violet-light no-underline hover:text-white"
      >
        ← {t("backToLogin")}
      </Link>
    </AuthShell>
  );
}
