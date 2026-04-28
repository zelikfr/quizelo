import { avatarFromSeed } from "@/lib/avatars";
import { cn } from "@/lib/cn";

interface QAAvatarProps {
  name?: string;
  seed?: number;
  size?: number;
  /** Outer ring color. Defaults to a subtle inset border. */
  ring?: string;
  /** Render as muted/grayscale (e.g. eliminated player). */
  dim?: boolean;
  className?: string;
  rounded?: boolean;
}

export function QAAvatar({
  name = "P",
  seed = 0,
  size = 36,
  ring,
  dim = false,
  rounded = true,
  className,
}: QAAvatarProps) {
  const palette = avatarFromSeed(seed);

  return (
    <div
      className={cn(
        "font-display relative inline-flex shrink-0 items-center justify-center overflow-hidden font-bold",
        dim && "opacity-35 grayscale-[0.6]",
        rounded && "rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: palette.bg,
        color: palette.fg,
        boxShadow: ring ? `0 0 0 2px ${ring}` : "inset 0 0 0 1px rgba(255,255,255,0.15)",
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
