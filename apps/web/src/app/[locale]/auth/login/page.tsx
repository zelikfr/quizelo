import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { Divider } from "@/components/auth/Divider";
import { LoginBrandPanel } from "@/components/auth/LoginBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { SocialButtons } from "@/components/auth/SocialButtons";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("auth");

  return (
    <AuthShell brand={<LoginBrandPanel />}>
      <p className="font-mono text-[11px] tracking-widest3 text-fg-3">
        ◆ {t("login.badge")}
      </p>
      <h2 className="mt-2 font-display text-[36px] font-bold leading-[1] tracking-[-0.025em] text-white">
        {t("login.title")}
      </h2>
      <p className="mt-2 mb-7 text-[13px] text-fg-3">
        {t("login.noAccount")}{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-violet-light no-underline hover:text-white"
        >
          {t("login.signupLink")}
        </Link>
      </p>

      <SocialButtons redirectTo={from} />

      <Divider label={t("orWith")} />

      <LoginForm redirectTo={from} />

      <Divider label={t("magicLink.divider")} />

      <MagicLinkForm redirectTo={from} />

      <p className="mt-5 text-center text-[11px] leading-relaxed text-fg-3">
        {t("login.legalPrefix")}{" "}
        <a className="cursor-pointer text-fg-2 underline">{t("login.legalTerms")}</a>{" "}
        {t("login.legalAnd")}{" "}
        <a className="cursor-pointer text-fg-2 underline">{t("login.legalPrivacy")}</a>
        .
      </p>
    </AuthShell>
  );
}
