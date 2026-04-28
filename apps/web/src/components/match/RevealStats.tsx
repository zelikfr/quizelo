import { getTranslations } from "next-intl/server";

export async function RevealStats() {
  const t = await getTranslations("match.interstitial.stats");

  return (
    <div className="flex gap-3.5">
      <Stat label={t("gotBy")} value="5" suffix="/8" valueClass="text-success" />
      <Stat label={t("livesLost")} value="3" valueClass="text-danger" />
      <Stat label={t("avgReact")} value="5.4s" />
      <Stat
        label={t("you")}
        value="✓ 4.1s"
        valueClass="text-success"
        accent
      />
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  suffix?: string;
  valueClass?: string;
  /** Highlights the card with a violet tint (used for "YOU"). */
  accent?: boolean;
}

function Stat({ label, value, suffix, valueClass = "text-white", accent }: StatProps) {
  return (
    <div
      className="flex-1 rounded-lg border bg-gradient-surface p-3.5"
      style={{
        borderColor: accent ? "rgba(124,92,255,0.3)" : "rgba(255,255,255,0.08)",
        background: accent ? "rgba(124,92,255,0.08)" : undefined,
      }}
    >
      <div
        className="font-mono text-[10px] tracking-[0.15em]"
        style={{ color: accent ? "#A18BFF" : "var(--fg-3)" }}
      >
        {label}
      </div>
      <div className={`font-display font-mono text-[26px] font-bold ${valueClass}`}>
        {value}
        {suffix && <span className="text-[14px] text-fg-3">{suffix}</span>}
      </div>
    </div>
  );
}
