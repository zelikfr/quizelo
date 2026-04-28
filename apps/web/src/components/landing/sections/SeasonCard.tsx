interface SeasonCardProps {
  badge: string;
  title: string;
  body: string;
  daysLeft: string;
  daysLabel: string;
  seasonValue: string;
  seasonLabel: string;
}

export function SeasonCard({
  badge,
  title,
  body,
  daysLeft,
  daysLabel,
  seasonValue,
  seasonLabel,
}: SeasonCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-[14px] border bg-gradient-surface p-4 md:gap-4 md:rounded-[18px] md:p-7"
      style={{
        background: "linear-gradient(180deg, rgba(255,209,102,0.10), rgba(11,15,26,0.7))",
        borderColor: "rgba(255,209,102,0.3)",
      }}
    >
      <p className="font-mono text-[9px] tracking-[0.25em] text-gold md:text-[11px]">
        ◆ {badge}
      </p>
      <h3 className="m-0 font-display text-xl font-bold leading-[1.05] tracking-[-0.02em] md:text-[28px]">
        {title}
      </h3>
      <p className="m-0 text-xs leading-relaxed text-fg-2 md:text-[13px]">{body}</p>
      <div className="mt-auto flex gap-2 md:gap-2.5">
        {[
          { v: daysLeft,    l: daysLabel },
          { v: seasonValue, l: seasonLabel },
        ].map(({ v, l }) => (
          <div
            key={l}
            className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 p-2.5 md:p-3"
          >
            <div className="font-display font-mono text-lg font-bold text-gold md:text-[22px]">
              {v}
            </div>
            <div className="font-mono text-[8px] tracking-[0.15em] text-fg-3 md:text-[9px]">
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
