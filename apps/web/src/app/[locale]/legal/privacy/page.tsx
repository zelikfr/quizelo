import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalShell } from "@/components/legal/LegalShell";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Privacy policy / RGPD notice. Lists the data we collect, why,
 * who processes it (Stripe, Resend), retention periods, and the
 * user's rights (access, erasure, portability, objection).
 *
 * Replace placeholder values (publisher contact, DPO, hosting region)
 * before going live.
 */
export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const tt = await getTranslations("legal.privacy");

  return (
    <LegalShell
      title={tt("title")}
      updatedAt={tt("updatedAt")}
      backLabel={t("back")}
    >
      <p>{tt("intro")}</p>

      <h2>{tt("h.controller")}</h2>
      <p>{tt("p.controller")}</p>

      <h2>{tt("h.data")}</h2>
      <p>{tt("p.data")}</p>
      <ul>
        <li>{tt("li.data1")}</li>
        <li>{tt("li.data2")}</li>
        <li>{tt("li.data3")}</li>
        <li>{tt("li.data4")}</li>
      </ul>

      <h2>{tt("h.purposes")}</h2>
      <ul>
        <li>{tt("li.purpose1")}</li>
        <li>{tt("li.purpose2")}</li>
        <li>{tt("li.purpose3")}</li>
        <li>{tt("li.purpose4")}</li>
      </ul>

      <h2>{tt("h.basis")}</h2>
      <p>{tt("p.basis")}</p>

      <h2>{tt("h.processors")}</h2>
      <p>{tt("p.processors")}</p>
      <ul>
        <li>{tt("li.processor1")}</li>
        <li>{tt("li.processor2")}</li>
        <li>{tt("li.processor3")}</li>
      </ul>

      <h2>{tt("h.retention")}</h2>
      <p>{tt("p.retention")}</p>

      <h2>{tt("h.rights")}</h2>
      <p>{tt("p.rights")}</p>
      <ul>
        <li>{tt("li.right1")}</li>
        <li>{tt("li.right2")}</li>
        <li>{tt("li.right3")}</li>
        <li>{tt("li.right4")}</li>
        <li>{tt("li.right5")}</li>
      </ul>

      <h2>{tt("h.cookies")}</h2>
      <p>{tt("p.cookies")}</p>

      <h2>{tt("h.contact")}</h2>
      <p>{tt("p.contact")}</p>
    </LegalShell>
  );
}
