import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@quizelo/auth";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

interface NewPasswordPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Final step of the password-reset flow: the user lands here after
 * clicking the magic link from `/auth/forgot-password`. They must be
 * signed in (the magic link took care of that). Submitting updates
 * `users.passwordHash` to the new value and signs them out so they
 * re-authenticate with the new credentials.
 */
export default async function NewPasswordPage({ params }: NewPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    // The magic link must have expired or been opened in a different browser.
    redirect("/auth/forgot-password?expired=1");
  }

  const t = await getTranslations("auth");

  return (
    <AuthShell>
      <p className="font-mono text-[11px] tracking-widest3 text-violet-light">
        ◆ {t("newPassword.badge")}
      </p>
      <h2 className="mt-2 font-display text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-white">
        {t("newPassword.title")}
      </h2>
      <p className="mt-2 mb-7 text-[13px] leading-relaxed text-fg-3">
        {t("newPassword.subtitle")}
      </p>

      <NewPasswordForm
        labels={{
          password: t("fields.password"),
          submit: t("newPassword.submit"),
          done: t("newPassword.done"),
          backToLogin: t("forgot.backToLogin"),
          error: t("newPassword.error"),
          tooShort: t("newPassword.tooShort"),
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
