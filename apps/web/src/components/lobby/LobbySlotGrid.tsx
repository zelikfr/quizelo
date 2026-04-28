import { getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { ROSTER, type Player } from "@/lib/game-data";
import { cn } from "@/lib/cn";

interface LobbySlotGridProps {
  filled: number;
  /** Mobile = compact slots (avatar only). */
  compact?: boolean;
}

export async function LobbySlotGrid({ filled, compact = false }: LobbySlotGridProps) {
  const t = await getTranslations("lobby");
  const players = ROSTER.slice(0, filled);
  const empty = Math.max(0, 10 - filled);

  return (
    <div className="grid grid-cols-5 gap-1.5 md:gap-3">
      {players.map((p) => (
        <PlayerSlot key={p.id} player={p} compact={compact} />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <EmptySlot
          key={`empty-${i}`}
          waitingLabel={t("waiting")}
          highlighted={i === 0}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface PlayerSlotProps {
  player: Player;
  compact: boolean;
}

function PlayerSlot({ player, compact }: PlayerSlotProps) {
  const isMe = player.id === 0;
  const tone = isMe
    ? "border-violet/50 bg-violet/[0.08]"
    : "border-white/[0.08] bg-gradient-surface";

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-[10px] border px-0.5 py-2",
          isMe ? "border-violet/40 bg-violet/[0.12]" : "border-white/[0.08] bg-white/[0.02]",
        )}
      >
        <QAAvatar name={player.name} seed={player.seed} size={28} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border p-3",
        tone,
      )}
    >
      <QAAvatar name={player.name} seed={player.seed} size={40} />
      <div
        className={cn(
          "max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-semibold",
          isMe ? "text-white" : "text-fg-1",
        )}
      >
        {player.name}
      </div>
      <div className="font-mono text-[9px] text-fg-3">{player.elo}</div>
    </div>
  );
}

interface EmptySlotProps {
  waitingLabel: string;
  highlighted: boolean;
  compact: boolean;
}

function EmptySlot({ waitingLabel, highlighted, compact }: EmptySlotProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex min-h-[44px] items-center justify-center rounded-[10px] border border-dashed text-fg-4 text-xs",
          highlighted ? "border-violet/40 animate-qa-pulse" : "border-white/10",
        )}
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-white/[0.015] p-3",
        highlighted
          ? "border-violet/50 animate-qa-pulse"
          : "border-white/[0.08]",
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/15 text-lg text-fg-4">
        ?
      </div>
      <div className="font-mono text-[9px] text-fg-4">{waitingLabel}</div>
    </div>
  );
}
