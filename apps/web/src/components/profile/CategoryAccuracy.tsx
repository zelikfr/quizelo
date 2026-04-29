import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

interface CategoryAccuracyProps {
  /** Sorted (by total desc) category accuracy entries. */
  data: ReadonlyArray<{
    id: string;
    /** 0..1 ratio of correct answers. */
    value: number;
    correct: number;
    total: number;
  }>;
  compact?: boolean;
}

function colorFor(value: number): string {
  if (value > 0.7) return "#4ADE80";
  if (value > 0.5) return "#FFD166";
  return "#FF8B5C";
}

export async function CategoryAccuracy({
  data,
  compact = false,
}: CategoryAccuracyProps) {
  const t = await getTranslations("profile.categories");
  const tNames = await getTranslations("categories.names");

  // Mobile: keep at most 4 rows so the card stays compact under the chart.
  const rows = compact ? data.slice(0, 4) : data.slice(0, 6);

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-gradient-surface",
        compact ? "p-3.5" : "p-[18px]",
      )}
    >
      <div
        className={cn(
          "mb-2 font-mono tracking-[0.15em] text-fg-3",
          compact ? "text-[9px]" : "mb-3 text-[10px]",
        )}
      >
        {compact ? t("titleShort") : t("title")}
      </div>

      {rows.length === 0 ? (
        <div
          className={cn(
            "py-3 text-center font-mono text-fg-3",
            compact ? "text-[10px]" : "text-[11px] tracking-[0.1em]",
          )}
        >
          {t("empty")}
        </div>
      ) : (
        rows.map((c) => {
          const color = colorFor(c.value);
          const pct = Math.round(c.value * 100);
          // Tolerate categories that don't have an i18n entry yet.
          const safeKey = String(c.id);
          let displayName = safeKey;
          try {
            displayName = tNames(safeKey);
          } catch {
            displayName = safeKey;
          }
          return (
            <div key={c.id} className={compact ? "mb-2" : "mb-2.5"}>
              <div className="mb-1 flex items-baseline justify-between">
                <span
                  className={cn(
                    "font-display font-semibold",
                    compact ? "text-[11px]" : "text-xs",
                  )}
                >
                  {displayName}
                </span>
                <span
                  className={cn(
                    "font-mono font-semibold",
                    compact ? "text-[10px]" : "text-[11px]",
                  )}
                  style={{ color }}
                >
                  {pct}%
                </span>
              </div>
              <div
                className="overflow-hidden rounded-pill bg-white/[0.06]"
                style={{ height: compact ? 3 : 4 }}
              >
                <div
                  className="h-full rounded-pill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
