import { setRequestLocale, getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { CategoryAccuracy } from "@/components/profile/CategoryAccuracy";
import { EloChart } from "@/components/profile/EloChart";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:flex-col md:min-h-screen">
        <HomeTopBar />

        <div className="flex flex-col gap-5 px-14 py-8">
          <ProfileHeader />
          <ProfileStats locale={loc} />

          <div
            className="grid flex-1 gap-3.5"
            style={{ gridTemplateColumns: "1.5fr 1fr" }}
          >
            <EloChart />
            <CategoryAccuracy />
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <ProfileHeader compact />

        <div className="px-[18px] pt-4">
          <ProfileStats locale={loc} compact />
        </div>

        <div className="px-[18px] pt-3.5">
          <EloChart compact />
        </div>

        <div className="px-[18px] pt-3.5">
          <CategoryAccuracy compact />
        </div>

        <div className="flex-1" />

        <HomeMobileBottomNav active="profile" />
      </div>
    </main>
  );
}
