import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { Divider } from "@/components/auth/Divider";
import { SignupBrandPanel } from "@/components/auth/SignupBrandPanel";
import { SignupForm } from "@/components/auth/SignupForm";
import { SocialButtons } from "@/components/auth/SocialButtons";

interface SignupPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function SignupPage({
  params,
  searchParams,
}: SignupPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");
  const { ref } = await searchParams;
  const referralCode = ref?.trim().toUpperCase().slice(0, 16) || null;

  return (
    <AuthShell brand={<SignupBrandPanel />}>
      <h2 className="font-display text-[32px] font-bold leading-[1] tracking-[-0.025em] text-white">
        {t("signup.title")}
      </h2>
      <p className="mt-1.5 text-[13px] text-fg-3">{t("signup.subtitle")}</p>
      <p className="mt-1 mb-6 text-[13px] text-fg-3">
        {t("signup.haveAccount")}{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-violet-light no-underline hover:text-white"
        >
          {t("signup.loginLink")}
        </Link>
      </p>

      <SocialButtons />

      <Divider label={t("signup.orEmail")} />

      <SignupForm referralCode={referralCode} />
    </AuthShell>
  );
}
