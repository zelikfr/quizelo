import { QAAvatar } from "@/components/shared/QAAvatar";
import type { Player } from "@/lib/game-data";

interface TransitionSurvivorProps {
  /** Either pass a full Player, or the individual fields below. */
  player?: Player;
  name?: string;
  seed?: number;
  /** ELO or score label shown under the name. */
  elo?: number | string;
  /** Highlights the user as "me" with a gold marker. */
  isMe?: boolean;
  size?: number;
  /** Mobile-compact layout (smaller name + smaller ELO line). */
  mini?: boolean;
}

/**
 * Survivor avatar — gold ring (conic gradient halo + solid border) +
 * green ✓ check badge, name + ELO/score label below.
 */
export function TransitionSurvivor({
  player,
  name = player?.name,
  seed = player?.seed,
  elo = player?.elo,
  isMe = player?.id === 0,
  size = 88,
  mini = false,
}: TransitionSurvivorProps) {
  if (!name || seed === undefined) return null;

  return (
    <div className={`flex flex-col items-center ${mini ? "gap-1.5" : "gap-2.5"}`}>
      <div className="relative">
        {/* Conic gold halo */}
        <div
          aria-hidden
          className="absolute -inset-1.5 rounded-full opacity-60 blur-md"
          style={{
            background:
              "conic-gradient(from 0deg, #FFD166, #FF8B5C, #FFD166, #FF8B5C, #FFD166)",
          }}
        />
        {/* Solid gradient frame */}
        <div
          className="relative rounded-[14px] p-[3px]"
          style={{ background: "linear-gradient(135deg, #FFD166, #FF8B5C)" }}
        >
          <div className="overflow-hidden rounded-[11px] bg-surface-0">
            <QAAvatar name={name} seed={seed} size={size} />
          </div>
        </div>
        {/* Check badge */}
        <div
          aria-hidden
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-success font-display text-xs font-bold text-surface-0"
          style={{ border: "2px solid #0B0F1A" }}
        >
          ✓
        </div>
      </div>

      <div className="text-center" style={{ maxWidth: size + 20 }}>
        <div
          className={`overflow-hidden text-ellipsis whitespace-nowrap font-display font-semibold text-white ${
            mini ? "text-[11px]" : "text-[13px]"
          }`}
        >
          {name}
          {isMe && <span className="text-gold"> ◆</span>}
        </div>
        {elo !== undefined && (
          <div
            className={`mt-0.5 font-mono tracking-[0.15em] text-fg-3 ${
              mini ? "text-[8px]" : "text-[9px]"
            }`}
          >
            {elo}
          </div>
        )}
      </div>
    </div>
  );
}
