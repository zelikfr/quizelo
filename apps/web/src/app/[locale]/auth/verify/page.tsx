import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginBrandPanel } from "@/components/auth/LoginBrandPanel";

interface VerifyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth.verify");

  return (
    <AuthShell brand={<LoginBrandPanel />}>
      <p className="font-mono text-[11px] tracking-widest3 text-fg-3">
        ◆ {t("badge")}
      </p>
      <h2 className="mt-2 font-display text-[36px] font-bold leading-[1] tracking-[-0.025em] text-white">
        {t("title")}
      </h2>
      <p className="mt-3 mb-6 text-[14px] leading-relaxed text-fg-2">{t("body")}</p>

      <div
        className="mb-6 rounded-md border border-white/[0.08] bg-surface-2/80 px-4 py-3 text-[12px] text-fg-3"
        role="status"
      >
        {t("hint")}
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
