"use client";

import { useTranslations } from "next-intl";
import { tintForCategory } from "@/lib/landing-data";

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

  const tint = tintForCategory(cat);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
      style={{
        color: tint,
        borderColor: `${tint}55`,
        background: `${tint}1F`,
      }}
    >
      {label}
    </span>
  );
}
