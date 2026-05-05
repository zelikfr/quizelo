import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { HomeMobileBottomNav } from "@/components/home/HomeMobileBottomNav";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { FriendsList } from "@/components/referral/FriendsList";
import { HowItWorks } from "@/components/referral/HowItWorks";
import { MilestoneList } from "@/components/referral/MilestoneList";
import { ReferralCodeCard } from "@/components/referral/ReferralCodeCard";
import { getReferralState } from "@/lib/referral-actions";
import { cn } from "@/lib/cn";

interface ReferralPageProps {
  params: Promise<{ locale: string }>;
}

const TOP_AMBIENT =
  "radial-gradient(ellipse at 30% -10%, rgba(124,92,255,0.18), transparent 60%)";
const TOP_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.20), transparent 50%)";

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("referral");

  // Pulls everything we need in one trip + lazy-creates the user's
  // referral code if they don't have one yet. Also runs settlement
  // for any pending milestone awards (see getReferralState).
  const state = await getReferralState();
  if (!state) redirect("/auth/login?from=/referral");

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

        <HomeTopBar />

        {/* Page header */}
        <div className="relative px-10 pt-7">
          <p className="font-mono text-[10px] tracking-[0.25em] text-violet-light">
            ◆ {t("badge")}
          </p>
          <h1 className="m-0 mt-1.5 font-display text-[32px] font-bold tracking-[-0.025em]">
            {t("title")}
          </h1>
        </div>

        {/* Body — split */}
        <div
          className="relative grid gap-6 px-10 pt-6 pb-8"
          style={{ gridTemplateColumns: "1.2fr 1fr" }}
        >
          {/* Left: code + how + milestones */}
          <div className="flex flex-col gap-[22px]">
            <ReferralCodeCard code={state.code} />
            <HowItWorks />
            <MilestoneList milestones={state.milestones} />
          </div>

          {/* Right: stats + friends + abuse note */}
          <div className="flex flex-col gap-[22px]">
            <div className="grid grid-cols-2 gap-2.5">
              <StatTile
                label={t("totals.friends")}
                value={String(state.totals.friendsCount)}
                color="#A18BFF"
              />
              <StatTile
                label={t("totals.earned")}
                value={String(state.totals.earnedCredits)}
                color="#FFD166"
                accent="gold"
              />
            </div>
            <FriendsList friends={state.friends} />
            <AbuseNote />
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      {/* `pb-24` reserves room for the fixed bottom nav. */}
      <div className="relative flex min-h-screen flex-col pb-24 md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: TOP_AMBIENT_MOBILE }}
        />

        {/* Top bar */}
        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <Link
            href="/home"
            aria-label={t("badge")}
            className="text-lg text-fg-2 no-underline"
          >
            ‹
          </Link>
          <span className="font-display text-[13px] font-bold tracking-[0.12em]">
            {t("badge")}
          </span>
          <span className="w-[18px]" />
        </div>

        {/* Headline */}
        <div className="px-[18px] pt-3">
          <h1 className="m-0 font-display text-[22px] font-bold leading-[1.05] tracking-[-0.02em]">
            {t("titleMobileA")}{" "}
            <span className="text-gold">{t("titleMobileB")}</span>
          </h1>
        </div>

        {/* Code card */}
        <div className="px-[18px] pt-3.5">
          <ReferralCodeCard code={state.code} compact />
        </div>

        {/* Stats */}
        <div className="flex gap-2 px-[18px] pt-3.5">
          <StatTile
            label={t("totals.friendsShort")}
            value={String(state.totals.friendsCount)}
            color="#A18BFF"
            compact
          />
          <StatTile
            label={t("totals.earnedShort")}
            value={String(state.totals.earnedCredits)}
            color="#FFD166"
            accent="gold"
            compact
          />
        </div>

        {/* Milestones */}
        <div className="px-[18px] pt-3.5">
          <MilestoneList milestones={state.milestones} compact />
        </div>

        <div className="flex-1" />

        <HomeMobileBottomNav active="referral" />
      </div>
    </main>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  color: string;
  accent?: "gold";
  compact?: boolean;
}

function StatTile({ label, value, color, accent, compact = false }: StatTileProps) {
  return (
    <div
      className={cn(
        "flex-1 rounded-lg border bg-gradient-surface",
        compact ? "p-2.5 text-center" : "p-3.5",
      )}
      style={{
        background: accent === "gold" ? "rgba(255,209,102,0.08)" : undefined,
        borderColor: accent === "gold" ? "rgba(255,209,102,0.3)" : "rgba(255,255,255,0.08)",
      }}
    >
      <div
        className={cn(
          "font-mono tracking-[0.15em] text-fg-3",
          compact ? "text-[9px]" : "text-[10px]",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "font-display font-mono font-bold",
          compact ? "text-[22px]" : "text-[30px]",
        )}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

async function AbuseNote() {
  const t = await getTranslations("referral");
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border p-3.5"
      style={{
        background: "rgba(255,77,109,0.06)",
        borderColor: "rgba(255,77,109,0.25)",
      }}
    >
      <span aria-hidden className="text-sm text-danger">⚠</span>
      <p className="m-0 text-[11px] leading-[1.5] text-fg-2">{t("abuse")}</p>
    </div>
  );
}
