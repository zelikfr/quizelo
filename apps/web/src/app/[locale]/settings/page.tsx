import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link, type Locale } from "@/i18n/routing";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { AudioMuteToggle } from "@/components/settings/AudioMuteToggle";
import { DangerCard } from "@/components/settings/DangerCard";
import { EditableField } from "@/components/settings/EditableField";
import { IdentityCard } from "@/components/settings/IdentityCard";
import { SectionHeader } from "@/components/settings/SectionHeader";
import { SettingRow } from "@/components/settings/SettingRow";
import { SettingsLangPicker } from "@/components/settings/SettingsLangPicker";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SubscriptionCard } from "@/components/settings/SubscriptionCard";
import { getCurrentUser } from "@/lib/current-user";
import { rankFromElo, rankLabel } from "@/lib/ranks";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

const TOP_AMBIENT =
  "radial-gradient(ellipse at 20% -10%, rgba(124,92,255,0.14), transparent 55%)";
const TOP_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.18), transparent 50%)";

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?from=/settings");
  }

  const t = await getTranslations("settings");

  const tier = `${rankLabel(rankFromElo(user.elo), locale).toUpperCase()} · ${user.elo} ELO`;
  const tierShort = `${rankLabel(rankFromElo(user.elo), locale).toUpperCase()} · ${user.elo}`;
  const handleLabel = user.handle ?? user.id.slice(0, 8);
  const emailLabel = user.email ?? t("fields.notSet");

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
                name={user.name}
                email={emailLabel}
                tier={tier}
                avatarSeed={user.avatarId}
                isPremium={user.isPremium}
              />
              <div className="mt-[18px] overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <EditableField
                  field="displayName"
                  label={t("fields.displayName")}
                  initialValue={user.name}
                  required
                />
                <SettingRow
                  label={t("fields.username")}
                  value={handleLabel}
                  meta={t("fields.handleLocked")}
                  metaColor="#9AA3B2"
                />
                <SettingRow
                  label={t("fields.email")}
                  value={emailLabel}
                  meta={user.email ? `✓ ${t("verified")}` : undefined}
                  metaColor="#4ADE80"
                />
              </div>
            </section>

            {/* Contact + address */}
            <section id="contact">
              <SectionHeader
                glyph="✉"
                eyebrow={t("sections.contact").toUpperCase()}
                title={t("contact.title")}
              />
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <EditableField
                  field="phone"
                  label={t("fields.phone")}
                  initialValue={user.phone}
                  inputMode="tel"
                  placeholder="+33 6 12 34 56 78"
                />
                <EditableField
                  field="addressLine"
                  label={t("fields.addressLine")}
                  initialValue={user.addressLine}
                  placeholder={t("fields.addressLinePlaceholder")}
                />
                <EditableField
                  field="postalCode"
                  label={t("fields.postalCode")}
                  initialValue={user.postalCode}
                  inputMode="numeric"
                  placeholder="75001"
                />
                <EditableField
                  field="city"
                  label={t("fields.city")}
                  initialValue={user.city}
                  placeholder="Paris"
                />
                <EditableField
                  field="country"
                  label={t("fields.country")}
                  initialValue={user.country}
                  placeholder="France"
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
              <SubscriptionCard
                isPremium={user.isPremium}
                premiumUntil={user.premiumUntil}
                cancelAtPeriodEnd={user.premiumCancelAtPeriodEnd}
              />
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

            {/* Audio — fully wired */}
            <section id="audio">
              <SectionHeader
                glyph="♪"
                eyebrow={t("sections.audio").toUpperCase()}
                title={t("audio.title")}
              />
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
                <AudioMuteToggle
                  scope="music"
                  label={t("audio.music")}
                  hint={t("audio.musicHint")}
                />
                <AudioMuteToggle
                  scope="sfx"
                  label={t("audio.sfx")}
                  hint={t("audio.sfxHint")}
                />
              </div>
            </section>

            {/* Danger zone — sign out wired, delete still disabled */}
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
            name={user.name}
            email={emailLabel}
            tier={tierShort}
            avatarSeed={user.avatarId}
            isPremium={user.isPremium}
            compact
          />
        </div>

        {/* Account group */}
        <MobileGroup title={t("sections.account").toUpperCase()}>
          <EditableField
            field="displayName"
            label={t("fields.displayName")}
            initialValue={user.name}
            required
            compact
          />
          <SettingRow label={t("fields.username")} value={handleLabel} compact />
          <SettingRow
            label={t("fields.email")}
            value={emailLabel}
            compact
            meta={user.email ? "✓" : undefined}
            metaColor="#4ADE80"
          />
        </MobileGroup>

        {/* Contact group */}
        <MobileGroup title={t("sections.contact").toUpperCase()}>
          <EditableField
            field="phone"
            label={t("fields.phone")}
            initialValue={user.phone}
            inputMode="tel"
            placeholder="+33 6 12 34 56 78"
            compact
          />
          <EditableField
            field="addressLine"
            label={t("fields.addressLine")}
            initialValue={user.addressLine}
            placeholder={t("fields.addressLinePlaceholder")}
            compact
          />
          <EditableField
            field="postalCode"
            label={t("fields.postalCode")}
            initialValue={user.postalCode}
            inputMode="numeric"
            placeholder="75001"
            compact
          />
          <EditableField
            field="city"
            label={t("fields.city")}
            initialValue={user.city}
            placeholder="Paris"
            compact
          />
          <EditableField
            field="country"
            label={t("fields.country")}
            initialValue={user.country}
            placeholder="France"
            compact
          />
        </MobileGroup>

        {/* Subscription group */}
        <div className="px-[18px] pt-3.5">
          <div className="px-1 pb-1.5 font-mono text-[9px] tracking-[0.18em] text-fg-3">
            {t("sections.sub").toUpperCase()}
          </div>
          <SubscriptionCard
            isPremium={user.isPremium}
            premiumUntil={user.premiumUntil}
            cancelAtPeriodEnd={user.premiumCancelAtPeriodEnd}
          />
        </div>

        {/* Audio group — wired */}
        <MobileGroup title={t("sections.audio").toUpperCase()}>
          <AudioMuteToggle scope="music" label={t("audio.music")} compact />
          <AudioMuteToggle scope="sfx" label={t("audio.sfx")} compact />
        </MobileGroup>

        {/* Language */}
        <div className="px-[18px] pt-3.5">
          <div className="px-1 pb-1.5 font-mono text-[9px] tracking-[0.18em] text-fg-3">
            {t("sections.lang").toUpperCase()}
          </div>
          <SettingsLangPicker compact />
        </div>

        {/* Delete (mobile) — disabled for now */}
        <div className="flex flex-col gap-1.5 px-[18px] pt-5">
          <button
            type="button"
            disabled
            className="rounded-pill border border-danger/40 bg-transparent px-3 py-3 text-xs text-danger opacity-50 disabled:cursor-not-allowed"
          >
            {t("danger.deleteTitle")}
          </button>
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
