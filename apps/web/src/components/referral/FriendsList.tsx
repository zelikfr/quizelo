import { getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { REFERRED_FRIENDS } from "@/lib/referral-data";

export async function FriendsList() {
  const t = await getTranslations("referral.friends");

  return (
    <div>
      <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-fg-3">
        {t("title")}
      </p>
      <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
        {REFERRED_FRIENDS.map((f, i) => (
          <div
            key={f.name}
            className="flex items-center gap-2.5 px-3.5 py-3"
            style={{
              borderBottom:
                i < REFERRED_FRIENDS.length - 1
                  ? "1px solid rgba(255,255,255,0.08)"
                  : undefined,
            }}
          >
            <QAAvatar name={f.name} seed={f.seed} size={32} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-xs font-semibold text-fg-1">
                {f.name}
              </div>
              <div className="font-mono text-[10px] text-fg-3">
                {t("joined", { date: f.joinedLabel })}
              </div>
            </div>
            {f.status === "premium" && (
              <span
                className="rounded border border-gold/40 bg-gold/[0.18] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-gold"
              >
                ★ PRO
              </span>
            )}
            <div className="flex items-center gap-0.5 font-mono text-xs font-bold text-gold">
              <span className="text-[10px]">◈</span>+{f.earnedCredits}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
