import { QAAvatar } from "@/components/shared/QAAvatar";
import type { Player } from "@/lib/game-data";

interface TransitionEliminatedProps {
  player?: Player;
  name?: string;
  seed?: number;
  size?: number;
}

/** Eliminated avatar — grayscaled, red diagonal strike, ✕ corner badge. */
export function TransitionEliminated({
  player,
  name = player?.name,
  seed = player?.seed,
  size = 56,
}: TransitionEliminatedProps) {
  if (!name || seed === undefined) return null;
  return (
    <div className="flex flex-col items-center gap-1.5 opacity-55">
      <div className="relative">
        <div className="grayscale-[0.7] brightness-[0.7]">
          <QAAvatar name={name} seed={seed} size={size} />
        </div>
        {/* Red diagonal strike */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[10px]"
          style={{
            background:
              "linear-gradient(135deg, transparent calc(50% - 1px), rgba(255,77,109,0.95) calc(50% - 1px), rgba(255,77,109,0.95) calc(50% + 1px), transparent calc(50% + 1px))",
          }}
        />
        {/* Corner ✕ badge */}
        <div
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-danger font-display text-[9px] font-bold text-white"
          style={{ border: "2px solid #0B0F1A" }}
        >
          ✕
        </div>
      </div>

      <div
        className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9px] tracking-[0.1em] text-fg-3 line-through"
        style={{ maxWidth: size + 8 }}
      >
        {name}
      </div>
    </div>
  );
}
