import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");

  return (
    <AuthShell>
      <p className="font-mono text-[11px] tracking-widest3 text-violet-light">
        ◆ {t("forgot.badge")}
      </p>
      <h2 className="mt-2 font-display text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-white">
        {t("forgot.title")}
      </h2>
      <p className="mt-2 mb-7 text-[13px] leading-relaxed text-fg-3">
        {t("forgot.subtitle")}
      </p>

      <ForgotPasswordForm
        labels={{
          email: t("fields.email"),
          submit: t("forgot.submit"),
          sent: t("forgot.sent"),
          error: t("forgot.error"),
        }}
      />

      <p className="mt-6 text-center text-[13px]">
        <Link
          href="/auth/login"
          className="text-violet-light no-underline hover:text-white"
        >
          ← {t("forgot.backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
