import { getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { ROSTER } from "@/lib/game-data";
import { SPRINT_SCORES } from "@/lib/game-questions";
import { cn } from "@/lib/cn";

interface SprintLeaderboardProps {
  compact?: boolean;
}

export async function SprintLeaderboard({ compact = false }: SprintLeaderboardProps) {
  const t = await getTranslations("match.phase2");

  if (compact) {
    return (
      <div className="border-t border-white/[0.08] bg-black/30 px-[18px] py-3">
        <p className="mb-1.5 font-mono text-[9px] tracking-[0.15em] text-fg-3">
          {t("topAdvances")}
        </p>
        <div className="flex gap-1.5">
          {SPRINT_SCORES.map((s, i) => {
            const player = ROSTER.find((p) => p.id === s.playerId);
            if (!player) return null;
            const inTop3 = i < 3;
            return (
              <div
                key={s.playerId}
                className={cn(
                  "flex-1 rounded-md border p-1.5 text-center",
                  inTop3
                    ? "border-success/25 bg-success/[0.08]"
                    : "border-danger/[0.18] bg-danger/[0.05]",
                )}
              >
                <div className="flex justify-center">
                  <QAAvatar name={player.name} seed={player.seed} size={22} />
                </div>
                <div
                  className={cn(
                    "mt-0.5 font-mono text-[11px] font-bold",
                    inTop3 ? "text-white" : "text-fg-3",
                  )}
                >
                  {s.score > 0 ? "+" : ""}
                  {s.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside className="flex flex-col gap-2.5 rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
      <p className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
        {t("liveTop3")}
      </p>

      {SPRINT_SCORES.map((s, i) => {
        const player = ROSTER.find((p) => p.id === s.playerId);
        if (!player) return null;
        const inTop3 = i < 3;
        const isMe = player.id === 0;
        return (
          <div
            key={s.playerId}
            className={cn(
              "flex items-center gap-2.5 rounded-md border px-3 py-2.5",
              inTop3
                ? "border-success/25 bg-success/[0.06]"
                : "border-danger/[0.18] bg-danger/[0.05]",
            )}
          >
            <span
              className={cn(
                "w-[22px] font-display font-mono text-base font-bold",
                inTop3 ? "text-success" : "text-fg-3",
              )}
            >
              {i + 1}
            </span>
            <QAAvatar name={player.name} seed={player.seed} size={28} />
            <span
              className={cn(
                "flex-1 font-display text-[13px] font-semibold",
                isMe ? "text-gold" : "text-fg-1",
              )}
            >
              {player.name}
            </span>
            <span
              className={cn(
                "font-display font-mono text-lg font-bold",
                inTop3 ? "text-white" : "text-fg-3",
              )}
            >
              {s.score > 0 ? "+" : ""}
              {s.score}
            </span>
          </div>
        );
      })}

      <div className="mt-1 rounded-md border border-dashed border-white/[0.08] bg-white/[0.02] p-2.5">
        <span className="font-mono text-[10px] text-fg-3">
          {t("cutoff")} → <b className="text-white">+9</b>
        </span>
      </div>
    </aside>
  );
}
