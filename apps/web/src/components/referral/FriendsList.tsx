import { getLocale, getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import type { ReferralFriend } from "@/lib/referral-config";

interface FriendsListProps {
  friends: readonly ReferralFriend[];
}

export async function FriendsList({ friends }: FriendsListProps) {
  const t = await getTranslations("referral.friends");
  const locale = await getLocale();

  return (
    <div>
      <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-fg-3">
        {t("title")}
      </p>
      {friends.length === 0 ? (
        <div className="rounded-lg border border-white/[0.08] bg-gradient-surface px-4 py-5 text-center font-mono text-[11px] text-fg-3">
          {t("empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-surface">
          {friends.map((f, i) => {
            const joined = new Intl.DateTimeFormat(locale, {
              day: "2-digit",
              month: "short",
            }).format(f.joinedAt);
            // Stable seed for QAAvatar derived from the userId so the
            // generated avatar is visually consistent across renders.
            const seed = hashSeed(f.userId);
            return (
              <div
                key={f.userId}
                className="flex items-center gap-2.5 px-3.5 py-3"
                style={{
                  borderBottom:
                    i < friends.length - 1
                      ? "1px solid rgba(255,255,255,0.08)"
                      : undefined,
                }}
              >
                <QAAvatar name={f.name} seed={seed} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xs font-semibold text-fg-1">
                    {f.name}
                  </div>
                  <div className="font-mono text-[10px] text-fg-3">
                    {t("joined", { date: joined })}
                  </div>
                </div>
                {f.isPremium && (
                  <span className="rounded border border-gold/40 bg-gold/[0.18] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-gold">
                    ★ PRO
                  </span>
                )}
                <div className="flex items-center gap-0.5 font-mono text-xs font-bold text-gold">
                  <span className="text-[10px]">◈</span>+{f.earnedCredits}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Cheap deterministic hash → small int, used to derive a QAAvatar
 * seed from a userId. Not a real hash — we only need "different
 * inputs probably get different outputs".
 */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100;
}
