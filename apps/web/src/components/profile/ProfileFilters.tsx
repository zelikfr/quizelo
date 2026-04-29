import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { ProfileFilter } from "@/lib/profile-stats";
import { cn } from "@/lib/cn";

interface ProfileFiltersProps {
  active: ProfileFilter;
  compact?: boolean;
}

const FILTERS: ProfileFilter[] = ["all", "quick", "ranked"];

/**
 * Three-tab filter for the profile stats. Implemented as `<Link>`s with a
 * search param (`?mode=quick`) so the page re-renders server-side with the
 * filtered query — no client-state machinery needed.
 */
export async function ProfileFilters({ active, compact = false }: ProfileFiltersProps) {
  const t = await getTranslations("profile.filters");

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-pill border border-white/[0.08] bg-surface-2/40 p-1 backdrop-blur",
        compact ? "self-start" : "w-fit",
      )}
    >
      {FILTERS.map((f) => {
        const isActive = f === active;
        const href =
          f === "all" ? "/profile" : `/profile?mode=${f}`;
        return (
          <Link
            key={f}
            href={href}
            scroll={false}
            className={cn(
              "rounded-pill px-3 py-1.5 font-display font-semibold no-underline transition-colors duration-120",
              compact ? "text-[11px]" : "text-xs",
              isActive
                ? "bg-violet/20 text-white"
                : "text-fg-3 hover:text-fg-1",
            )}
          >
            {t(f)}
          </Link>
        );
      })}
    </div>
  );
}
