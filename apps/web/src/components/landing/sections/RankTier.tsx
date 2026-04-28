import type { Rank } from "@/lib/ranks";

interface RankTierProps {
  rank: Rank;
  label: string;
  range: string;
}

export function RankTier({ rank, label, range }: RankTierProps) {
  return (
    <div
      className="w-24 shrink-0 rounded-[10px] border px-2.5 py-2.5 text-center md:w-auto md:rounded-xl md:px-3.5 md:py-[18px]"
      style={{
        background: `linear-gradient(180deg, ${rank.glow}, rgba(11,15,26,0.6))`,
        borderColor: `${rank.color}55`,
      }}
    >
      <div
        className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg font-display text-sm font-bold md:mb-2.5 md:h-11 md:w-11 md:rounded-[10px] md:text-lg"
        style={{
          background: `linear-gradient(135deg, ${rank.color}, ${rank.color}66)`,
          border: `1px solid ${rank.color}`,
          boxShadow: `0 8px 24px -8px ${rank.glow}`,
          color: "#06080F",
        }}
      >
        {label[0]}
      </div>
      <div className="font-display text-[11px] font-semibold text-white md:text-[13px]">
        {label}
      </div>
      <div
        className="mt-0.5 font-mono text-[8px] tracking-[0.1em] md:mt-1 md:text-[9px] md:tracking-[0.15em]"
        style={{ color: rank.color }}
      >
        {range}
      </div>
    </div>
  );
}
