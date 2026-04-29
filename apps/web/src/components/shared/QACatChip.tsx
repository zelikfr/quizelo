import { getTranslations } from "next-intl/server";
import { tintForCategory } from "@/lib/landing-data";

interface QACatChipProps {
  /** Category id from `lib/landing-data` (e.g. "geography"). */
  cat: string;
}

/**
 * Server-rendered category chip. Uses the same per-category tint as the home
 * page so the colour ties the chip to its card on /home.
 */
export async function QACatChip({ cat }: QACatChipProps) {
  const t = await getTranslations("categories.names");
  let label = cat;
  try {
    label = t(cat);
  } catch {
    label = cat;
  }

  const tint = tintForCategory(cat);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
      style={{
        color: tint,
        borderColor: `${tint}55`, // 33% alpha
        background: `${tint}1F`, // ~12% alpha
      }}
    >
      {label}
    </span>
  );
}
