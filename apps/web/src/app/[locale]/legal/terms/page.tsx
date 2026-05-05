import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalShell } from "@/components/legal/LegalShell";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Terms of Service. Plain placeholder copy — replace with the version
 * your legal team signs off on before going live.
 */
export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const tt = await getTranslations("legal.terms");

  return (
    <LegalShell
      title={tt("title")}
      updatedAt={tt("updatedAt")}
      backLabel={t("back")}
    >
      <p>{tt("intro")}</p>

      <h2>{tt("h.acceptance")}</h2>
      <p>{tt("p.acceptance")}</p>

      <h2>{tt("h.account")}</h2>
      <p>{tt("p.account")}</p>
      <ul>
        <li>{tt("li.account1")}</li>
        <li>{tt("li.account2")}</li>
        <li>{tt("li.account3")}</li>
      </ul>

      <h2>{tt("h.subscription")}</h2>
      <p>{tt("p.subscription")}</p>

      <h2>{tt("h.fairplay")}</h2>
      <p>{tt("p.fairplay")}</p>
      <ul>
        <li>{tt("li.fair1")}</li>
        <li>{tt("li.fair2")}</li>
        <li>{tt("li.fair3")}</li>
      </ul>

      <h2>{tt("h.ip")}</h2>
      <p>{tt("p.ip")}</p>

      <h2>{tt("h.liability")}</h2>
      <p>{tt("p.liability")}</p>

      <h2>{tt("h.termination")}</h2>
      <p>{tt("p.termination")}</p>

      <h2>{tt("h.law")}</h2>
      <p>{tt("p.law")}</p>

      <h2>{tt("h.contact")}</h2>
      <p>{tt("p.contact")}</p>
    </LegalShell>
  );
}
