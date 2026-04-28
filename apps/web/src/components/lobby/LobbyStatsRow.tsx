import { getTranslations } from "next-intl/server";

interface LobbyStatsRowProps {
  filled: number;
  /** Mockup-only — wait time string. */
  waitTime?: string;
}

export async function LobbyStatsRow({
  filled,
  waitTime = "0:34",
}: LobbyStatsRowProps) {
  const t = await getTranslations("lobby.stats");

  return (
    <div className="flex gap-4">
      <Stat label={t("players")} value={`${filled}`} suffix="/10" />
      <Stat label={t("waitTime")} value={waitTime} />
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  suffix?: string;
}

function Stat({ label, value, suffix }: StatProps) {
  return (
    <div className="flex-1 rounded-lg border border-white/[0.08] bg-gradient-surface p-4">
      <div className="font-mono text-[10px] tracking-[0.15em] text-fg-3">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-display font-mono text-[38px] font-bold text-white">
          {value}
        </span>
        {suffix && (
          <span className="font-mono text-[18px] text-fg-3">{suffix}</span>
        )}
      </div>
    </div>
  );
}
