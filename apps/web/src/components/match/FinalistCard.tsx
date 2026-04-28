import { QAAvatar } from "@/components/shared/QAAvatar";
import { QALives } from "@/components/shared/QALives";
import type { Player } from "@/lib/game-data";
import { cn } from "@/lib/cn";

interface FinalistCardProps {
  player: Player;
  /** Override default lives. */
  lives: number;
  /** Highlight as "last to answer in the previous round". */
  isLast?: boolean;
  /** Highlight as the current user. */
  isMe?: boolean;
  lastBadgeLabel: string;
  compact?: boolean;
}

export function FinalistCard({
  player,
  lives,
  isLast = false,
  isMe = false,
  lastBadgeLabel,
  compact = false,
}: FinalistCardProps) {
  const bg = isLast
    ? "linear-gradient(180deg, rgba(255,77,109,0.15), rgba(255,77,109,0.04))"
    : isMe
      ? "linear-gradient(180deg, rgba(255,209,102,0.15), rgba(255,209,102,0.02))"
      : "rgba(255,255,255,0.03)";

  const borderColor = isLast
    ? "rgba(255,77,109,0.4)"
    : isMe
      ? "rgba(255,209,102,0.4)"
      : "rgba(255,255,255,0.08)";

  return (
    <div
      className={cn(
        "relative rounded-2xl border",
        compact
          ? "flex-1 p-2.5 text-center"
          : "flex min-w-[200px] items-center gap-3.5 p-4",
      )}
      style={{ background: bg, borderColor }}
    >
      {compact ? (
        <>
          <div className="flex justify-center">
            <QAAvatar name={player.name} seed={player.seed} size={32} />
          </div>
          <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-bold text-white">
            {player.name}
          </div>
          <div className="mt-1 flex justify-center">
            <QALives count={lives} max={3} size={6} gap={3} />
          </div>
        </>
      ) : (
        <>
          <QAAvatar name={player.name} seed={player.seed} size={48} />
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-white">{player.name}</div>
            <div className="font-mono text-[10px] text-fg-3">{player.elo} ELO</div>
            <div className="mt-1.5">
              <QALives count={lives} max={3} size={9} gap={4} />
            </div>
          </div>
        </>
      )}

      {isLast && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-danger px-2 py-[3px] font-mono text-[9px] font-bold tracking-[0.15em] text-white"
          style={{ left: compact ? "50%" : "auto", right: compact ? "auto" : "12px", top: "-10px", transform: compact ? "translateX(-50%)" : "none" }}
        >
          {lastBadgeLabel}
        </span>
      )}
    </div>
  );
}
