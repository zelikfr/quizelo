import { getTranslations } from "next-intl/server";

interface QACatChipProps {
  /** Category id from `lib/landing-data` (e.g. "Geography"). */
  cat: string;
}

/**
 * Server-rendered category chip — looks the localized name up via next-intl.
 */
export async function QACatChip({ cat }: QACatChipProps) {
  const t = await getTranslations("categories.names");
  // `t.has` would be ideal, but next-intl < 4 doesn't expose it consistently.
  // Fall back to the raw id if the translation is missing.
  let label = cat;
  try {
    label = t(cat);
  } catch {
    label = cat;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-violet/30 bg-violet/[0.12] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-violet-light">
      {label}
    </span>
  );
}
