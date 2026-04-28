import { QAAvatar } from "@/components/shared/QAAvatar";
import { QALives } from "@/components/shared/QALives";
import { cn } from "@/lib/cn";
import type { Player } from "@/lib/game-data";

export type PlayerStatus = "alive" | "eliminated" | "answering" | "correct" | "wrong";

interface QAPlayerChipProps {
  player: Player;
  status?: PlayerStatus;
  /** Highlights the chip — typically used for the current user. */
  highlight?: boolean;
  /** Compact variant for sidebars. */
  compact?: boolean;
  /** Hide the life dots. */
  hideLives?: boolean;
}

const RING_BY_STATUS: Partial<Record<PlayerStatus, string>> = {
  answering: "#7C5CFF",
  correct: "#4ADE80",
  wrong: "#FF4D6D",
};

export function QAPlayerChip({
  player,
  status = "alive",
  highlight = false,
  compact = false,
  hideLives = false,
}: QAPlayerChipProps) {
  const dim = status === "eliminated";
  const ring = RING_BY_STATUS[status];

  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 rounded-[12px] border",
        compact ? "px-2 py-1.5" : "px-3 py-2",
        highlight
          ? "border-violet/45 bg-[linear-gradient(180deg,rgba(124,92,255,0.18),rgba(124,92,255,0.06))]"
          : "border-white/[0.08] bg-white/[0.03]",
        dim && "opacity-50",
      )}
    >
      <QAAvatar
        name={player.name}
        seed={player.seed}
        size={compact ? 28 : 32}
        ring={ring}
        dim={dim}
      />

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap font-display font-semibold",
            compact ? "text-[12px]" : "text-[13px]",
            highlight ? "text-white" : "text-fg-1",
            dim && "line-through",
          )}
        >
          {player.name}
        </div>
        <div className="font-mono text-[10px] text-fg-3">{player.elo} ELO</div>
      </div>

      {!hideLives && status !== "eliminated" && (
        <QALives count={player.lives} max={3} size={7} gap={3} />
      )}

      {status === "correct" && <span className="text-base text-success">✓</span>}
      {status === "wrong" && <span className="text-base text-danger">✗</span>}
    </div>
  );
}
