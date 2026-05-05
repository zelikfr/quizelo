import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalShell } from "@/components/legal/LegalShell";
import { ReopenConsentButton } from "@/components/legal/ReopenConsentButton";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Cookie policy — companion document to the consent banner. Lists
 * the cookies/storage we set, their purpose, lifetime and category.
 * The "Re-open consent" button at the bottom lets the user revisit
 * the choices made via the banner.
 */
export default async function CookiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const tt = await getTranslations("legal.cookies");

  return (
    <LegalShell
      title={tt("title")}
      updatedAt={tt("updatedAt")}
      backLabel={t("back")}
    >
      <p>{tt("intro")}</p>

      <h2>{tt("h.essential")}</h2>
      <p>{tt("p.essential")}</p>
      <ul>
        <li>{tt("li.essential1")}</li>
        <li>{tt("li.essential2")}</li>
        <li>{tt("li.essential3")}</li>
      </ul>

      <h2>{tt("h.analytics")}</h2>
      <p>{tt("p.analytics")}</p>

      <h2>{tt("h.marketing")}</h2>
      <p>{tt("p.marketing")}</p>

      <h2>{tt("h.choice")}</h2>
      <p>{tt("p.choice")}</p>

      <div className="mt-6">
        <ReopenConsentButton label={tt("reopen")} />
      </div>
    </LegalShell>
  );
}
