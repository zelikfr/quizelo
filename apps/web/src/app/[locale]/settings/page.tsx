import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { DangerCard } from "@/components/settings/DangerCard";
import { IdentityCard } from "@/components/settings/IdentityCard";
import { SectionHeader } from "@/components/settings/SectionHeader";
import { SettingRow } from "@/components/settings/SettingRow";
import { SettingSlider } from "@/components/settings/SettingSlider";
import { SettingToggle } from "@/components/settings/SettingToggle";
import { SettingsLangPicker } from "@/components/settings/SettingsLangPicker";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SubscriptionCard } from "@/components/settings/SubscriptionCard";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

const ME = {
  handle: "nyra.fr",
  email: "nyra@protonmail.com",
  tier: "OR · 1487 ELO",
} as const;

const TOP_AMBIENT =
  "radial-gradient(ellipse at 20% -10%, rgba(124,92,255,0.14), transparent 55%)";
const TOP_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.18), transparent 50%)";

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("settings");
  const tCommon = await getTranslations("common");

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: TOP_AMBIENT }}
        />

        <HomeTopBar />

        {/* Body */}
        <div
          className="relative grid flex-1"
          style={{ gridTemplateColumns: "240px 1fr" }}
        >
          <SettingsSidebar active="account" />

          <div className="flex flex-col gap-6 px-10 py-7 pb-12">
            {/* Account */}
            <section id="account">
              <SectionHeader
                glyph="◆"
                eyebrow={t("sections.account").toUpperCase()}
                title={t("account.title")}
              />
              <IdentityCard
                handle={ME.handle}
                email={ME.email}
                tier={ME.tier}
              />
              <div className="mt-[18px] overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <SettingRow
                  label={t("fields.username")}
                  value={ME.handle}
                  action={t("actions.edit")}
                />
                <SettingRow
                  label={t("fields.email")}
                  value={ME.email}
                  action={t("actions.edit")}
                  meta={`✓ ${t("verified")}`}
                  metaColor="#4ADE80"
                />
                <SettingRow
                  label={t("fields.password")}
                  value="••••••••••"
                  action={t("actions.change")}
                />
                <SettingRow
                  label={t("fields.phone")}
                  value={t("fields.notSet")}
                  action={t("actions.add")}
                  muted
                />
                <SettingRow
                  label={t("fields.country")}
                  value="France"
                  action={t("actions.edit")}
                />
              </div>
            </section>

            {/* Subscription */}
            <section id="sub">
              <SectionHeader
                glyph="★"
                eyebrow={t("sections.sub").toUpperCase()}
                title={t("subscription.title")}
                tone="gold"
              />
              <SubscriptionCard />
            </section>

            {/* Language */}
            <section id="lang">
              <SectionHeader
                glyph="◈"
                eyebrow={t("sections.lang").toUpperCase()}
                title={t("language.title")}
              />
              <SettingsLangPicker />
            </section>

            {/* Gameplay */}
            <section id="gameplay">
              <SectionHeader
                glyph="◆"
                eyebrow={t("sections.gameplay").toUpperCase()}
                title={t("gameplay.title")}
              />
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <SettingToggle
                  label={t("gameplay.animations.label")}
                  hint={t("gameplay.animations.hint")}
                  defaultOn
                />
                <SettingToggle
                  label={t("gameplay.opponents.label")}
                  hint={t("gameplay.opponents.hint")}
                  defaultOn
                />
                <SettingToggle
                  label={t("gameplay.autoSubmit.label")}
                  hint={t("gameplay.autoSubmit.hint")}
                />
                <SettingRow
                  label={t("gameplay.favoriteCategory")}
                  value="Géographie"
                  action={t("actions.edit")}
                />
                <SettingRow
                  label={t("gameplay.categoryFilter.label")}
                  value={t("gameplay.categoryFilter.value")}
                  action={t("actions.configure")}
                />
              </div>
            </section>

            {/* Audio */}
            <section id="audio">
              <SectionHeader
                glyph="♪"
                eyebrow={t("sections.audio").toUpperCase()}
                title={t("audio.title")}
              />
              <div className="rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
                <SettingSlider label={t("audio.music")} value={0.62} />
                <SettingSlider label={t("audio.sfx")} value={0.85} />
                <div className="my-3.5 h-px bg-white/[0.08]" />
                <SettingToggle label={t("audio.haptics")} defaultOn inline />
              </div>
            </section>

            {/* Notifications */}
            <section id="notif">
              <SectionHeader
                glyph="◈"
                eyebrow={t("sections.notif").toUpperCase()}
                title={t("notifications.title")}
              />
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <SettingToggle
                  label={t("notifications.matchReady.label")}
                  hint={t("notifications.matchReady.hint")}
                  defaultOn
                />
                <SettingToggle
                  label={t("notifications.seasonEnd.label")}
                  hint={t("notifications.seasonEnd.hint")}
                  defaultOn
                />
                <SettingToggle
                  label={t("notifications.referral.label")}
                  hint={t("notifications.referral.hint")}
                  defaultOn
                />
                <SettingToggle label={t("notifications.promos")} />
                <SettingRow
                  label={t("notifications.weeklyEmail.label")}
                  value={t("notifications.weeklyEmail.value")}
                  action={t("actions.edit")}
                />
              </div>
            </section>

            {/* Privacy */}
            <section id="privacy">
              <SectionHeader
                glyph="⌾"
                eyebrow={t("sections.privacy").toUpperCase()}
                title={t("privacy.title")}
              />
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <SettingToggle
                  label={t("privacy.publicProfile.label")}
                  hint={t("privacy.publicProfile.hint")}
                  defaultOn
                />
                <SettingToggle label={t("privacy.publicCategoryStats")} />
                <SettingRow
                  label={t("privacy.exportData.label")}
                  value={t("privacy.exportData.value")}
                  action={t("actions.download")}
                />
                <SettingRow
                  label={t("privacy.blocked.label")}
                  value={t("privacy.blocked.value")}
                  action={t("actions.manage")}
                />
              </div>
            </section>

            {/* Danger zone */}
            <section id="danger">
              <SectionHeader
                glyph="⚠"
                eyebrow={t("sections.danger").toUpperCase()}
                title={t("danger.title")}
                tone="danger"
              />
              <DangerCard />
            </section>
          </div>
        </div>
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
            aria-label={t("back")}
            className="text-lg text-fg-2 no-underline"
          >
            ‹
          </Link>
          <span className="font-display text-[13px] font-bold tracking-[0.15em]">
            {t("title").toUpperCase()}
          </span>
          <span className="w-[18px]" />
        </div>

        {/* Identity */}
        <div className="px-[18px] pt-3">
          <IdentityCard
            handle={ME.handle}
            email={ME.email}
            tier="OR · 1487"
            compact
          />
        </div>

        {/* Account group */}
        <MobileGroup title={t("sections.account").toUpperCase()}>
          <SettingRow
            label={t("fields.username")}
            value={ME.handle}
            compact
          />
          <SettingRow
            label={t("fields.email")}
            value={ME.email}
            compact
            meta="✓"
            metaColor="#4ADE80"
          />
          <SettingRow
            label={t("fields.password")}
            value="•••••••"
            compact
          />
          <SettingRow
            label={t("fields.avatar")}
            value={t("actions.edit")}
            compact
          />
        </MobileGroup>

        {/* Subscription group */}
        <MobileGroup title={t("sections.sub").toUpperCase()}>
          <SettingRow
            label={t("subscription.currentPlan")}
            value={t("subscription.planValue")}
            badge="PRO"
            compact
          />
          <SettingRow
            label={t("subscription.paymentMethod")}
            value="Apple Pay •• 4421"
            compact
          />
          <SettingRow
            label={t("subscription.restore")}
            value=""
            compact
          />
        </MobileGroup>

        {/* Gameplay group */}
        <MobileGroup title={t("sections.gameplay").toUpperCase()}>
          <SettingToggle
            label={t("gameplay.animations.label")}
            defaultOn
            compact
          />
          <SettingToggle
            label={t("gameplay.opponents.label")}
            defaultOn
            compact
          />
          <SettingToggle
            label={t("gameplay.autoSubmit.label")}
            compact
          />
          <SettingRow
            label={t("gameplay.favoriteCategory")}
            value="Géographie"
            compact
          />
        </MobileGroup>

        {/* Audio group */}
        <MobileGroup title={t("sections.audio").toUpperCase()}>
          <SettingSlider label={t("audio.music")} value={0.62} compact />
          <SettingSlider label={t("audio.sfx")} value={0.85} compact />
          <SettingToggle
            label={t("audio.haptics")}
            defaultOn
            compact
          />
        </MobileGroup>

        {/* Notifications group */}
        <MobileGroup title={t("sections.notif").toUpperCase()}>
          <SettingToggle
            label={t("notifications.matchReady.label")}
            defaultOn
            compact
          />
          <SettingToggle
            label={t("notifications.seasonEnd.label")}
            defaultOn
            compact
          />
          <SettingToggle label={t("notifications.promos")} compact />
        </MobileGroup>

        {/* Language */}
        <div className="px-[18px] pt-3.5">
          <div className="px-1 pb-1.5 font-mono text-[9px] tracking-[0.18em] text-fg-3">
            {t("sections.lang").toUpperCase()}
          </div>
          <SettingsLangPicker compact />
        </div>

        {/* Danger / sign out */}
        <div className="flex flex-col gap-1.5 px-[18px] pt-5">
          <Button
            variant="ghost"
            size="full"
            className="justify-center py-3 text-xs text-danger"
            style={{ borderColor: "rgba(255,77,109,0.4)" }}
          >
            {t("danger.deleteTitle")}
          </Button>
          <Button variant="ghost" size="full" className="justify-center py-3 text-xs">
            {tCommon("signOut")}
          </Button>
        </div>

        <div className="px-[18px] pb-6 pt-5 text-center font-mono text-[9px] tracking-[0.15em] text-fg-3">
          QUIZELO · 0.1.0 · BUILD DEV
        </div>
      </div>
    </main>
  );
}

interface MobileGroupProps {
  title: string;
  children: React.ReactNode;
}

function MobileGroup({ title, children }: MobileGroupProps) {
  return (
    <div className="px-[18px] pt-3.5">
      <div className="px-1 pb-1.5 font-mono text-[9px] tracking-[0.18em] text-fg-3">
        {title}
      </div>
      <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
        {children}
      </div>
    </div>
  );
}
