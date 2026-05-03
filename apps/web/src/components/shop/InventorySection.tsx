import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/current-user";

interface InventorySectionProps {
  /** Tighter layout for the mobile column. */
  compact?: boolean;
}

/**
 * Charges the user owns, grouped by boost kind (the inventory is keyed
 * by kind, not by purchased card — see `spendCoinsOnBoostAction`).
 * Hidden when there are no charges so brand-new accounts don't see an
 * empty section.
 */
const KIND_META = [
  { kind: "double-elo" as const, icon: "×2", tint: "#7C5CFF" },
  { kind: "shield" as const, icon: "◊", tint: "#4ADE80" },
];

export async function InventorySection({ compact = false }: InventorySectionProps) {
  const t = await getTranslations("shop");
  const tBoost = await getTranslations("shop.boost");
  const user = await getCurrentUser();

  const inventory = user?.boostInventory ?? {};
  const owned = KIND_META.map((meta) => ({
    ...meta,
    count: inventory[meta.kind] ?? 0,
  })).filter((entry) => entry.count > 0);

  if (owned.length === 0) return null;

  return (
    <section className={compact ? "px-[18px] pt-4" : "relative px-10 pt-8"}>
      <p
        className={
          compact
            ? "font-mono text-[9px] tracking-[0.2em] text-gold"
            : "font-mono text-[11px] tracking-[0.25em] text-gold"
        }
      >
        ◆ {t("inventory.eyebrow")}
      </p>
      {!compact && (
        <h2 className="m-0 mt-1.5 font-display text-[22px] font-bold tracking-[-0.02em]">
          {t("inventory.title")}
        </h2>
      )}

      <div
        className={
          compact
            ? "mt-2 flex flex-wrap gap-1.5"
            : "mt-3 flex flex-wrap gap-2"
        }
      >
        {owned.map(({ kind, icon, tint, count }) => {
          const name =
            kind === "double-elo"
              ? tBoost("inventoryDoubleElo")
              : tBoost("inventoryShield");
          return (
            <div
              key={kind}
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
              style={{
                background: `${tint}14`,
                borderColor: `${tint}40`,
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded font-display text-[10px] font-bold"
                style={{
                  background: `${tint}33`,
                  color: tint,
                }}
              >
                {icon}
              </span>
              <span className="font-display text-[11px] text-fg-1">{name}</span>
              <span className="font-mono text-[10px] font-bold text-fg-2">×{count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
