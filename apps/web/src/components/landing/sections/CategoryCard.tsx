import type { Locale } from "@/i18n/routing";
import type { CategorySample } from "@/lib/landing-data";

interface CategoryCardProps {
  index: number;
  icon: string;
  tint: string;
  label: string;
  sample: CategorySample;
  locale: Locale;
}

export function CategoryCard({
  index,
  icon,
  tint,
  label,
  sample,
  locale,
}: CategoryCardProps) {
  const tintAlpha = index < 4 ? "33" : "22";

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 md:flex md:min-h-[180px] md:flex-col md:justify-between md:rounded-[14px] md:p-[18px]">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-12 w-12 md:h-20 md:w-20"
        style={{
          background: `radial-gradient(circle at top right, ${tint}${tintAlpha}, transparent 70%)`,
        }}
      />

      <div>
        <div
          className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-sm md:mb-3.5 md:h-9 md:w-9 md:rounded-[10px] md:text-lg"
          style={{
            background: `${tint}1F`,
            border: `1px solid ${tint}55`,
            color: tint,
          }}
        >
          {icon}
        </div>
        <div className="font-display text-[13px] font-semibold tracking-[-0.01em] text-white md:mb-1 md:text-[17px]">
          {label}
        </div>
        <div className="mt-0.5 font-mono text-[8px] tracking-[0.15em] text-fg-3 md:mt-0 md:text-[9px]">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className="mt-4 hidden rounded-lg border border-white/[0.08] bg-black/35 px-2.5 py-2 text-[11px] italic text-fg-2 md:block">
        &ldquo;{sample[locale]}&rdquo;
      </div>
    </div>
  );
}
