import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalShell } from "@/components/legal/LegalShell";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Conditions Générales de Vente (B2C, France).
 *
 * Required by article L.111-1 of the Code de la consommation as soon as
 * we sell anything to a consumer. Covers the commercial transaction
 * itself: characteristics, pricing, payment, execution, statutory
 * 14-day withdrawal right, warranties, and consumer mediation.
 *
 * The placeholder values (mediator name, business address) must be
 * replaced before public launch.
 */
export default async function CgvPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const tt = await getTranslations("legal.cgv");

  return (
    <LegalShell
      title={tt("title")}
      updatedAt={tt("updatedAt")}
      backLabel={t("back")}
    >
      <p>{tt("intro")}</p>

      <h2>{tt("h.scope")}</h2>
      <p>{tt("p.scope")}</p>

      <h2>{tt("h.seller")}</h2>
      <p>{tt("p.seller")}</p>

      <h2>{tt("h.products")}</h2>
      <p>{tt("p.products")}</p>
      <ul>
        <li>{tt("li.products1")}</li>
        <li>{tt("li.products2")}</li>
      </ul>

      <h2>{tt("h.prices")}</h2>
      <p>{tt("p.prices")}</p>
      <ul>
        <li>{tt("li.prices1")}</li>
        <li>{tt("li.prices2")}</li>
        <li>{tt("li.prices3")}</li>
      </ul>

      <h2>{tt("h.payment")}</h2>
      <p>{tt("p.payment")}</p>

      <h2>{tt("h.execution")}</h2>
      <p>{tt("p.execution")}</p>

      <h2>{tt("h.subscription")}</h2>
      <p>{tt("p.subscription")}</p>

      <h2>{tt("h.withdrawal")}</h2>
      <p>{tt("p.withdrawal")}</p>
      <p>
        <strong>{tt("p.withdrawalWaiver")}</strong>
      </p>

      <h2>{tt("h.warranty")}</h2>
      <p>{tt("p.warranty")}</p>

      <h2>{tt("h.refund")}</h2>
      <p>{tt("p.refund")}</p>

      <h2>{tt("h.complaints")}</h2>
      <p>{tt("p.complaints")}</p>

      <h2>{tt("h.mediation")}</h2>
      <p>{tt("p.mediation")}</p>

      <h2>{tt("h.law")}</h2>
      <p>{tt("p.law")}</p>
    </LegalShell>
  );
}
