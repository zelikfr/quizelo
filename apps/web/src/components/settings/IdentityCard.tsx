import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { QAAvatar } from "@/components/shared/QAAvatar";

interface IdentityCardProps {
  /** Public name shown on top of the card. */
  name: string;
  /** Email address, never shown blank. */
  email: string;
  /** Tier label, e.g. "OR · 1487 ELO". */
  tier: string;
  /** DiceBear avatar seed (numeric — usually `users.avatar_id`). */
  avatarSeed: number;
  /** When true, the user has an active premium subscription. */
  isPremium: boolean;
  compact?: boolean;
}

const CARD_BG_MOBILE =
  "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(255,209,102,0.06))";

export async function IdentityCard({
  name,
  email,
  tier,
  avatarSeed,
  isPremium,
  compact = false,
}: IdentityCardProps) {
  const t = await getTranslations("settings.identity");

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 rounded-[14px] border border-white/[0.08] p-3.5"
        style={{ background: CARD_BG_MOBILE }}
      >
        <QAAvatar name={name} seed={avatarSeed} size={48} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-semibold">{name}</div>
          <div className="mt-0.5 truncate font-mono text-[10px] text-fg-3">
            {email}
          </div>
          <div className="mt-1 flex gap-1">
            {isPremium && <PremiumBadge size="sm" />}
            <TierBadge label={tier} size="sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[18px] rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
      <QAAvatar name={name} seed={avatarSeed} size={64} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[18px] font-semibold">
          {name}
        </div>
        <div className="mt-0.5 truncate font-mono text-[11px] text-fg-3">
          {email}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {isPremium && <PremiumBadge />}
          <TierBadge label={tier} />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="px-3.5 py-2.5 text-xs"
        disabled
        title={t("changeAvatarSoon")}
      >
        {t("changeAvatar")}
      </Button>
    </div>
  );
}

function PremiumBadge({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={
        size === "sm"
          ? "rounded-[3px] border border-gold/30 bg-gold/15 px-1.5 py-px font-mono text-[8px] tracking-[0.1em] text-gold"
          : "rounded border border-gold/30 bg-gold/15 px-2 py-[3px] font-mono text-[9px] tracking-[0.1em] text-gold"
      }
    >
      ★ PREMIUM
    </span>
  );
}

function TierBadge({ label, size = "md" }: { label: string; size?: "sm" | "md" }) {
  return (
    <span
      className={
        size === "sm"
          ? "rounded-[3px] border border-violet/30 bg-violet/[0.12] px-1.5 py-px font-mono text-[8px] tracking-[0.1em] text-violet-light"
          : "rounded border border-violet/30 bg-violet/[0.12] px-2 py-[3px] font-mono text-[9px] tracking-[0.1em] text-violet-light"
      }
    >
      {label}
    </span>
  );
}
