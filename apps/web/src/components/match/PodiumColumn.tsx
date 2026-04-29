import { QAAvatar } from "@/components/shared/QAAvatar";
import { cn } from "@/lib/cn";

interface PodiumPlayer {
  name: string;
  /** Avatar seed (numeric). */
  seed: number;
  /** ELO before this match (optional — used for the "1487 → +12" line on desktop). */
  elo?: number;
}

interface PodiumColumnProps {
  player: PodiumPlayer;
  place: 1 | 2 | 3;
  /** Set to `null` to hide the ELO line entirely (used for quick matches). */
  eloDelta: number | null;
  /** Player's ELO before the match (for the "1487 → +12" line on desktop). */
  eloBefore?: number;
  isMe?: boolean;
  compact?: boolean;
}

const PLACE_COLOR = {
  1: "#FFD166",
  2: "#C9CFE0",
  3: "#B07A4A",
} as const;

const HEIGHT = {
  desktop: { 1: 200, 2: 160, 3: 130 },
  mobile:  { 1: 110, 2: 80,  3: 60  },
} as const;

const AVATAR_SIZE = {
  desktop: { 1: 68, 2: 54, 3: 54 },
  mobile:  { 1: 52, 2: 36, 3: 36 },
} as const;

const PLACE_NUMBER_SIZE = {
  desktop: 56,
  mobile: 28,
} as const;

export function PodiumColumn({
  player,
  place,
  eloDelta,
  eloBefore,
  isMe = false,
  compact = false,
}: PodiumColumnProps) {
  const color = PLACE_COLOR[place];
  const variant = compact ? "mobile" : "desktop";
  const height = HEIGHT[variant][place];
  const avatarSize = AVATAR_SIZE[variant][place];
  const placeNumberSize = PLACE_NUMBER_SIZE[variant];
  const showElo = eloDelta !== null;
  const deltaColor =
    eloDelta != null && eloDelta >= 0 ? "#4ADE80" : "#FF4D6D";
  const deltaSign = eloDelta != null && eloDelta >= 0 ? "+" : "";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5",
        compact ? "flex-1" : "",
      )}
    >
      <QAAvatar
        name={player.name}
        seed={player.seed}
        size={avatarSize}
        ring={color}
      />
      <div
        className={cn(
          "font-display font-bold",
          compact ? "text-[12px]" : "text-sm",
        )}
        style={{ color: isMe ? "#FFD166" : "#fff" }}
      >
        {player.name}
      </div>
      {showElo &&
        (compact ? (
          <div
            className="font-mono text-[9px] font-bold"
            style={{ color: deltaColor }}
          >
            {deltaSign}
            {eloDelta}
          </div>
        ) : (
          <div className="font-mono text-[11px] text-fg-3">
            {(eloBefore ?? player.elo) !== undefined && (
              <>
                {eloBefore ?? player.elo} →{" "}
              </>
            )}
            <b style={{ color: deltaColor }}>
              {deltaSign}
              {eloDelta}
            </b>
          </div>
        ))}

      <div
        className={cn(
          "flex justify-center pt-3.5",
          compact ? "w-full" : "w-[180px]",
        )}
        style={{
          height,
          background: `linear-gradient(180deg, ${color}33, ${color}08)`,
          border: `1px solid ${color}66`,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div
          className="font-display font-bold leading-none"
          style={{
            fontSize: placeNumberSize,
            color,
            letterSpacing: "-0.04em",
          }}
        >
          {place}
        </div>
      </div>
    </div>
  );
}
