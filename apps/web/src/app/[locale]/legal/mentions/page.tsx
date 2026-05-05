import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalShell } from "@/components/legal/LegalShell";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Mentions légales (required by French LCEN article 6-III) — must
 * include the publisher's legal name, contact, host name + address,
 * and director of publication.
 *
 * The placeholder values must be replaced with the real ones before
 * the public launch; missing/false mentions are punishable.
 */
export default async function MentionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const tt = await getTranslations("legal.mentions");

  return (
    <LegalShell
      title={tt("title")}
      updatedAt={tt("updatedAt")}
      backLabel={t("back")}
    >
      <h2>{tt("h.publisher")}</h2>
      <p>{tt("p.publisherName")}</p>
      <p>{tt("p.publisherForm")}</p>
      <p>{tt("p.publisherAddress")}</p>
      <p>{tt("p.publisherSiret")}</p>
      <p>{tt("p.publisherVat")}</p>
      <p>{tt("p.publisherEmail")}</p>

      <h2>{tt("h.director")}</h2>
      <p>{tt("p.director")}</p>

      <h2>{tt("h.host")}</h2>
      <p>{tt("p.hostName")}</p>
      <p>{tt("p.hostAddress")}</p>
      <p>{tt("p.hostContact")}</p>

      <h2>{tt("h.ip")}</h2>
      <p>{tt("p.ip")}</p>

      <h2>{tt("h.takedown")}</h2>
      <p>{tt("p.takedown")}</p>

      <h2>{tt("h.disputes")}</h2>
      <p>{tt("p.disputes")}</p>
    </LegalShell>
  );
}
