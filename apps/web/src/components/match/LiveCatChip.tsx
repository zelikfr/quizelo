"use client";

import { useTranslations } from "next-intl";

interface LiveCatChipProps {
  cat: string;
}

export function LiveCatChip({ cat }: LiveCatChipProps) {
  const t = useTranslations("categories.names");
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
