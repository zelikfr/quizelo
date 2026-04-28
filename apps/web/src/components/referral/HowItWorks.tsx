import { getTranslations } from "next-intl/server";

const STEPS = [1, 2, 3] as const;

export async function HowItWorks() {
  const t = await getTranslations("referral.howItWorks");

  return (
    <div>
      <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-fg-3">
        {t("title")}
      </p>
      <div className="flex flex-col gap-2.5">
        {STEPS.map((n) => (
          <div key={n} className="flex items-center gap-3">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold text-violet-light"
              style={{
                background: "rgba(124,92,255,0.18)",
                border: "1px solid rgba(124,92,255,0.4)",
              }}
            >
              {n}
            </span>
            <span className="text-[13px] text-fg-1">{t(`step${n}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
