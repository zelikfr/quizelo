export interface Reward {
  tier: string;
  gift: string;
  sub: string;
  glyph: string;
}

interface RewardCardProps {
  reward: Reward;
  tint: string;
}

export function RewardCard({ reward, tint }: RewardCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-[12px] border p-3 md:gap-5 md:rounded-[14px] md:p-5"
      style={{
        background: `linear-gradient(90deg, ${tint}12, transparent 60%)`,
        borderColor: `${tint}40`,
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-16 md:w-16 md:rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${tint}33, ${tint}10)`,
          border: `1px solid ${tint}66`,
          boxShadow: `0 12px 28px -10px ${tint}66`,
        }}
      >
        <span className="font-display text-xl font-bold md:text-[28px]" style={{ color: tint }}>
          {reward.glyph}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="mb-1 font-mono text-[9px] font-bold tracking-[0.25em] md:mb-1.5 md:text-[10px]"
          style={{ color: tint }}
        >
          {reward.tier}
        </p>
        <p className="mb-0.5 font-display text-[15px] font-semibold tracking-[-0.015em] text-white md:mb-1 md:text-[19px]">
          {reward.gift}
        </p>
        <p className="text-[10px] text-fg-2 md:text-xs">{reward.sub}</p>
      </div>
    </div>
  );
}
