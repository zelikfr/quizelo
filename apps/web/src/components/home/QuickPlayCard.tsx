import { getTranslations } from "next-intl/server";
import { PlayButton } from "@/components/home/PlayButton";
import { Paywall } from "@/components/premium/Paywall";
import { PaywallContent } from "@/components/premium/PaywallContent";
import { QATimerBar } from "@/components/shared/QATimerBar";
import { auth } from "@/auth";
import { enqueueAndRedirectAction } from "@/lib/match-actions";
import { awardQuickBonusAction } from "@/lib/quick-quota-actions";
import { getQuickQuota, QUICK_QUOTA_PER_DAY } from "@/lib/quick-quota";
import { cn } from "@/lib/cn";

interface QuickPlayCardProps {
  /** Mobile variant — denser layout. */
  compact?: boolean;
  /** Extra classes on the root (e.g. `lg:flex-1` to stretch in a flex row). */
  className?: string;
}

export async function QuickPlayCard({ compact = false, className }: QuickPlayCardProps) {
  const t = await getTranslations("home.modes.quick");
  const tCommon = await getTranslations("common");
  const tPremium = await getTranslations("premium");

  // Logged-out users see the static card (the Play button still works
  // because the action redirects to /auth/login if the session is missing).
  const session = await auth();
  const quota = session?.user?.id
    ? await getQuickQuota(session.user.id)
    : null;

  const isPremium = quota?.isPremium ?? false;
  const remaining = quota?.remaining ?? null;
  const max = quota?.max ?? QUICK_QUOTA_PER_DAY;
  const blocked = !isPremium && remaining === 0;
  const showCounter = !isPremium && quota !== null;
  const ratio =
    !isPremium && remaining !== null
      ? Math.max(0, Math.min(1, remaining / max))
      : 1;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-white/[0.08] bg-gradient-surface",
        compact ? "p-4" : "relative overflow-hidden p-6",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={
            compact
              ? "font-display text-lg font-bold"
              : "font-display text-[28px] font-bold"
          }
        >
          {t("title")}
        </div>
        <span className="rounded border border-success/30 bg-success/[0.12] px-2 py-[3px] font-mono text-[10px] tracking-[0.1em] text-success">
          {t("free")}
        </span>
      </div>

      {!compact && (
        <p className="m-0 mb-4 text-[13px] text-fg-2">{t("description")}</p>
      )}

      {/* Free games counter — hidden for premium users */}
      {showCounter && remaining !== null && (
        <div
          className={
            compact ? "mb-2 flex items-center gap-2" : "mb-3 flex items-center gap-3"
          }
        >
          <div className="flex-1">
            <QATimerBar value={ratio} />
          </div>
          <span
            className={cn(
              "whitespace-nowrap font-mono text-[10px]",
              blocked ? "text-danger" : "text-fg-3",
            )}
          >
            {compact
              ? `${remaining}/${max}`
              : `${remaining} / ${max} — ${t("freeLeft")}`}
          </span>
        </div>
      )}

      {/* Play button — first so the user immediately sees the "Quota
       *  atteint" state before the unblock options. `mt-auto` is dropped
       *  in this order; the card naturally fills via flex-col. */}
      <form
        action={enqueueAndRedirectAction}
        className={blocked ? "mb-3" : "mt-auto"}
      >
        <PlayButton
          label={tCommon("play")}
          variant="primary"
          disabled={blocked}
          disabledLabel={t("blocked")}
        />
      </form>

      {/* Quota exhausted: Premium upsell + ad fallback. Below the disabled
       *  Play button so the order reads as "you're blocked → here's how
       *  to unblock yourself". */}
      {showCounter && blocked && (
        <div className="flex flex-col gap-2">
          {/* Premium upsell — primary CTA when quota is gone */}
          <div className="rounded-lg border border-gold/40 bg-gold/[0.08] p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span aria-hidden className="text-base text-gold">
                ★
              </span>
              <span className="font-display text-[12px] font-bold text-fg-1">
                {t("upsellTitle")}
              </span>
            </div>
            <p className="m-0 mb-2.5 text-[11px] leading-relaxed text-fg-2">
              {t("upsellLine")}
            </p>
            <Paywall
              triggerLabel={t("upsellCta")}
              triggerVariant="gold"
              closeLabel={tPremium("close")}
            >
              <PaywallContent />
            </Paywall>
          </div>

          {/* Rewarded video CTA — secondary fallback */}
          <form action={awardQuickBonusAction}>
            <button
              type="submit"
              className={cn(
                "flex w-full items-center gap-2 rounded-md border border-dashed border-success/30 bg-success/[0.06] px-2.5 py-2 text-left transition-colors",
                "hover:border-success/50 hover:bg-success/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-success/40",
              )}
            >
              <span aria-hidden className="text-sm text-success">
                ▸
              </span>
              <span className="flex-1 text-[11px] text-fg-2">
                {t("watchAd")}
              </span>
              {!compact && (
                <span className="font-mono text-[10px] text-success">+1</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
