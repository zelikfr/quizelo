import { setRequestLocale, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { CategoryAccuracy } from "@/components/profile/CategoryAccuracy";
import { EloChart } from "@/components/profile/EloChart";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { ProfileFilters } from "@/components/profile/ProfileFilters";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { fetchProfileStats, type ProfileFilter } from "@/lib/profile-stats";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
}

function normaliseFilter(raw: string | undefined): ProfileFilter {
  return raw === "quick" || raw === "ranked" ? raw : "all";
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;

  const sp = await searchParams;
  const filter = normaliseFilter(sp.mode);

  const stats = await fetchProfileStats(filter);
  if (!stats) {
    redirect("/auth/login?from=/profile");
  }

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:flex-col md:min-h-screen">
        <HomeTopBar />

        <div className="flex flex-col gap-5 px-14 py-8">
          <ProfileHeader user={stats.user} />
          <ProfileFilters active={filter} />
          <ProfileStats locale={loc} elo={stats.user.elo} totals={stats.totals} />

          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: "1.5fr 1fr" }}
          >
            <EloChart history={stats.eloHistory} />
            <CategoryAccuracy data={stats.categories} />
          </div>

          <MatchHistory matches={stats.recentMatches} />
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <ProfileHeader user={stats.user} compact />

        <div className="px-[18px] pt-4">
          <ProfileFilters active={filter} compact />
        </div>

        <div className="px-[18px] pt-3.5">
          <ProfileStats
            locale={loc}
            elo={stats.user.elo}
            totals={stats.totals}
            compact
          />
        </div>

        <div className="px-[18px] pt-3.5">
          <EloChart history={stats.eloHistory} compact />
        </div>

        <div className="px-[18px] pt-3.5">
          <CategoryAccuracy data={stats.categories} compact />
        </div>

        <div className="px-[18px] pt-3.5 pb-4">
          <MatchHistory matches={stats.recentMatches} compact />
        </div>

        <div className="flex-1" />

        <HomeMobileBottomNav active="profile" />
      </div>
    </main>
  );
}
