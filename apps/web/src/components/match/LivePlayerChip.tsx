"use client";

import type { PublicPlayer } from "@quizelo/protocol";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QALives } from "@/components/shared/QALives";
import { cn } from "@/lib/cn";

export type LiveChipStatus = "alive" | "answered" | "correct" | "wrong" | "eliminated" | "self";

interface LivePlayerChipProps {
  player: PublicPlayer;
  status?: LiveChipStatus;
  highlight?: boolean;
  compact?: boolean;
  showLives?: boolean;
  /** Optional value to render on the right (e.g. score or rank). */
  trailing?: React.ReactNode;
}

const RING: Partial<Record<LiveChipStatus, string>> = {
  answered: "#7C5CFF",
  correct: "#4ADE80",
  wrong: "#FF4D6D",
};

export function LivePlayerChip({
  player,
  status = "alive",
  highlight = false,
  compact = false,
  showLives = true,
  trailing,
}: LivePlayerChipProps) {
  const dim = status === "eliminated";

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
        seed={player.avatarId}
        size={compact ? 28 : 32}
        ring={RING[status]}
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
        <div className="font-mono text-[10px] text-fg-3">{player.score} pts</div>
      </div>

      {showLives && status !== "eliminated" && (
        <QALives count={player.lives} max={3} size={7} gap={3} />
      )}

      {status === "correct" && <span className="text-base text-success">✓</span>}
      {status === "wrong" && <span className="text-base text-danger">✗</span>}
      {trailing && <span className="ml-1">{trailing}</span>}
    </div>
  );
}
