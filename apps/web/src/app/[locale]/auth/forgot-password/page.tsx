import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>;
}

async function forgotAction(_formData: FormData) {
  "use server";
  // TODO: connect to auth provider — send a reset link.
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

      <form action={forgotAction} className="flex flex-col gap-4">
        <AuthInput
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          icon={<span aria-hidden>✉</span>}
          label={t("fields.email")}
          placeholder="alex@quizelo.gg"
        />

        <Button type="submit" variant="primary" size="full" className="mt-2 py-3.5">
          {t("forgot.submit")} ▸
        </Button>
      </form>

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
