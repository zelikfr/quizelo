import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { BalanceBadge } from "@/components/shop/BalanceBadge";
import { BoostCardCard } from "@/components/shop/BoostCardCard";
import { CreditPackCard } from "@/components/shop/CreditPackCard";
import { InventorySection } from "@/components/shop/InventorySection";
import { ShopPremiumGate } from "@/components/shop/ShopPremiumGate";
import { getCurrentUser } from "@/lib/current-user";
import { BOOST_CARDS, CREDIT_PACKS } from "@/lib/shop-data";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

const TOP_AMBIENT =
  "radial-gradient(ellipse at 80% -10%, rgba(255,209,102,0.14), transparent 60%)";
const TOP_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.18), transparent 50%)";

// Show 3 boost cards on mobile (the most common pick).
const MOBILE_BOOSTS = ["x2-3", "x2-10", "shield-1"] as const;

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("shop");
  // Premium-only gate — non-premium users see the paywall lockout
  // instead of the actual catalog. Defence in depth: the buy actions
  // also reject non-premium clients.
  const user = await getCurrentUser();
  const isPremium = !!user?.isPremium;

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:flex-col md:min-h-screen">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: TOP_AMBIENT }}
        />

        <HomeTopBar active="shop" />

        {!isPremium ? (
          <>
            <ShopPremiumGate />
            <div className="pb-10" />
          </>
        ) : (
          <>
            {/* Credit packs section */}
            <div className="relative flex items-end justify-between gap-6 px-10 pt-7">
              <div>
                <p className="font-mono text-[11px] tracking-[0.25em] text-gold">
                  ◆ {t("packs.eyebrow")}
                </p>
                <h2 className="m-0 mt-1.5 font-display text-[32px] font-bold tracking-[-0.02em]">
                  {t("packs.title")}
                </h2>
                <p className="m-0 mt-1 text-[13px] text-fg-3">
                  {t("packs.subtitle")}
                </p>
              </div>
              <BalanceBadge />
            </div>

            <div className="relative grid grid-cols-4 gap-3 px-10 pt-5">
              {CREDIT_PACKS.map((p) => (
                <CreditPackCard key={p.id} pack={p} />
              ))}
            </div>

            {/* Boost cards section */}
            <div className="relative px-10 pt-8">
              <p className="font-mono text-[11px] tracking-[0.25em] text-violet-light">
                ◆ {t("boosts.eyebrow")}
              </p>
              <h2 className="m-0 mt-1.5 font-display text-[26px] font-bold tracking-[-0.02em]">
                {t("boosts.title")}
              </h2>
              <p className="m-0 mt-1 text-xs text-fg-3">{t("boosts.subtitle")}</p>
            </div>

            <div className="relative grid grid-cols-5 gap-2.5 px-10 pt-[18px]">
              {BOOST_CARDS.map((c) => (
                <BoostCardCard key={c.id} card={c} />
              ))}
            </div>

            <InventorySection />
            <div className="pb-10" />
          </>
        )}
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: TOP_AMBIENT_MOBILE }}
        />

        {/* Top bar */}
        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <Link
            href="/home"
            aria-label={t("title")}
            className="text-lg text-fg-2 no-underline"
          >
            ‹
          </Link>
          <span className="font-display text-[13px] font-bold tracking-[0.15em]">
            {t("title").toUpperCase()}
          </span>
          <span className="w-[18px]" />
        </div>

        {!isPremium ? (
          <>
            <ShopPremiumGate compact />
            <div className="pb-[18px]" />
          </>
        ) : (
          <>
            {/* Balance card */}
            <div className="px-[18px] pt-2">
              <BalanceBadge variant="card" />
            </div>

            {/* Tabs (visual only, mockup) */}
            <div className="flex gap-1.5 px-[18px] pt-3.5">
              <div className="flex-1 rounded-md border border-violet/40 bg-violet/[0.18] py-2 text-center font-display text-[11px] font-semibold text-white">
                {t("tabs.credits")}
              </div>
              <div className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] py-2 text-center font-display text-[11px] font-semibold text-fg-3">
                {t("tabs.cards")}
              </div>
            </div>

            {/* Packs stacked */}
            <div className="flex flex-col gap-2 px-[18px] pt-3.5">
              {CREDIT_PACKS.map((p) => (
                <CreditPackCard key={p.id} pack={p} compact />
              ))}
            </div>

            {/* Boost cards mini section */}
            <div className="px-[18px] pt-4">
              <p className="font-mono text-[9px] tracking-[0.2em] text-violet-light">
                ◆ {t("boosts.eyebrowShort")}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 px-[18px] pt-1.5">
              {MOBILE_BOOSTS.map((id) => {
                const card = BOOST_CARDS.find((c) => c.id === id);
                if (!card) return null;
                return <BoostCardCard key={card.id} card={card} compact />;
              })}
            </div>

            <InventorySection compact />
            <div className="pb-[18px]" />
          </>
        )}
      </div>
    </main>
  );
}
