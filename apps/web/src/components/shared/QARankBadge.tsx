import type { Locale } from "@/i18n/routing";
import { rankFromElo, rankLabel } from "@/lib/ranks";

interface QARankBadgeProps {
  elo: number;
  locale?: Locale;
  size?: number;
}

/**
 * Inline rank pill — uses pixel sizing so it can be embedded in dense UI
 * without inheriting block-level sizing rules.
 */
export function QARankBadge({ elo, locale = "fr", size = 22 }: QARankBadgeProps) {
  const rank = rankFromElo(elo);
  const label = rankLabel(rank, locale);
  const dotSize = Math.round(size * 0.45);
  const fontSize = Math.round(size * 0.5);

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-pill"
      style={{
        padding: "4px 8px",
        background: `${rank.color}1A`,
        border: `1px solid ${rank.color}55`,
      }}
    >
      <div
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${rank.color}, ${rank.color}88)`,
          transform: "rotate(45deg)",
          boxShadow: `0 0 8px ${rank.glow}`,
        }}
      />
      <span
        className="font-display font-semibold uppercase"
        style={{
          fontSize,
          color: rank.color,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
