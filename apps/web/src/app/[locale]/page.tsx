import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/Footer";
import { HowItWorks } from "@/components/landing/sections/HowItWorks";
import { Categories } from "@/components/landing/sections/Categories";
import { Ranks } from "@/components/landing/sections/Ranks";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

const HERO_AMBIENT =
  "radial-gradient(ellipse at 60% 0%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(ellipse at 20% 40%, rgba(94,194,255,0.08), transparent 50%)";

export default async function LandingPage({ params }: LandingPageProps) {
  // Locale validity is enforced by `[locale]/layout.tsx` — we just opt this
  // page in to static rendering by replaying the locale into the request scope.
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative overflow-x-hidden bg-surface-0">
      <div className="qa-grid-bg" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: 1100, background: HERO_AMBIENT }}
      />

      <Nav />
      <Hero />

      <div className="relative z-10">
        <HowItWorks />
        <Categories />
        <Ranks />
      </div>

      <Footer />
    </div>
  );
}
