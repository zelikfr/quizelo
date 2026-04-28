import { getTranslations } from "next-intl/server";
import { FILTERS } from "@/lib/leaderboard-data";
import { cn } from "@/lib/cn";

interface LeaderboardFiltersProps {
  /** Active filter id. The button is just visual (mockup). */
  active?: string;
}

export async function LeaderboardFilters({
  active = "global",
}: LeaderboardFiltersProps) {
  const t = await getTranslations("leaderboard.filters");

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <button
            key={f}
            type="button"
            className={cn(
              "shrink-0 rounded-pill border px-3.5 py-1.5 font-display text-xs font-semibold transition-colors duration-120",
              isActive
                ? "border-violet/50 bg-violet/[0.18] text-white"
                : "border-white/[0.08] bg-white/[0.03] text-fg-2 hover:text-fg-1",
            )}
          >
            {t(f)}
          </button>
        );
      })}
    </div>
  );
}
