import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Paywall } from "@/components/premium/Paywall";
import { PaywallContent } from "@/components/premium/PaywallContent";
import { PlayButton } from "@/components/home/PlayButton";
import { getCurrentUser } from "@/lib/current-user";
import { enqueueRankedAndRedirectAction } from "@/lib/match-actions";
import { RANKS, rankLabel, rankFromElo } from "@/lib/ranks";
import { ME } from "@/lib/game-data";
import { cn } from "@/lib/cn";

interface RankedCardProps {
  compact?: boolean;
  /** Extra classes on the root (e.g. `lg:flex-1` to stretch in a flex row). */
  className?: string;
}

const CARD_BG =
  "linear-gradient(180deg, rgba(255,209,102,0.08), rgba(255,209,102,0.01))";

export async function RankedCard({ compact = false, className }: RankedCardProps) {
  const t = await getTranslations("home.modes.ranked");
  const tPremium = await getTranslations("premium");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  // Real user (and Premium status) from the session — falls back to the
  // mock `ME` for the rank tier highlight if logged out so the card
  // renders correctly on a public landing page.
  const user = await getCurrentUser();
  const elo = user?.elo ?? ME.elo;
  const isPremium = user?.isPremium ?? false;
  const myRank = rankFromElo(elo);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border",
        compact ? "p-4" : "p-6",
        className,
      )}
      style={{ background: CARD_BG, borderColor: "rgba(255,209,102,0.25)" }}
    >
      {/* Decorative corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-52 w-52"
        style={{
          background: "radial-gradient(circle, rgba(255,209,102,0.15), transparent 70%)",
        }}
      />

      <div className="relative mb-4 flex items-start justify-between">
        <div
          className={
            compact
              ? "font-display text-lg font-bold"
              : "font-display text-[28px] font-bold"
          }
        >
          {t("title")}
        </div>
        <span className="rounded border border-gold/40 bg-gold/[0.15] px-2 py-[3px] font-mono text-[10px] tracking-[0.1em] text-gold">
          ★ PREMIUM
        </span>
      </div>

      {!compact && (
        <p className="relative m-0 mb-4 text-[13px] text-fg-2">{t("description")}</p>
      )}

      {!compact && (
        <div className="relative mb-4 flex gap-2">
          {RANKS.map((rank) => {
            const active = rank.name === myRank.name;
            return (
              <div
                key={rank.name}
                className="flex-1 rounded-[6px] border px-1 py-1.5 text-center font-mono text-[9px]"
                style={{
                  background: active ? `${rank.color}1A` : "rgba(255,255,255,0.02)",
                  borderColor: active ? `${rank.color}66` : "rgba(255,255,255,0.08)",
                  color: active ? rank.color : "var(--fg-3)",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {rankLabel(rank, locale).slice(0, 4).toUpperCase()}
              </div>
            );
          })}
        </div>
      )}

      <div className="relative mt-auto">
        {isPremium ? (
          <form action={enqueueRankedAndRedirectAction}>
            <PlayButton label={tCommon("play")} variant="gold" />
          </form>
        ) : (
          <Paywall
            triggerLabel={`${t("cta")} ▸`}
            triggerVariant="gold"
            closeLabel={tPremium("close")}
          >
            <PaywallContent />
          </Paywall>
        )}
      </div>
    </div>
  );
}
