"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface BoostPickerProps {
  /** Charges available per kind. Kinds with 0 charges are hidden. */
  inventory: { doubleElo: number; shield: number };
}

/**
 * Pre-match boost selector. Renders a radio-like row of pills (None /
 * ×2 / Shield) and emits the chosen kind via a hidden input the
 * parent form picks up. Kinds the user doesn't own are hidden so the
 * UI doesn't bait clicks on something unbuyable.
 *
 * The actual consumption (charge -1) happens server-side in
 * `enqueueRankedAndRedirectAction` so we can't lose a charge to a
 * client-only flicker.
 */
export function BoostPicker({ inventory }: BoostPickerProps) {
  const t = useTranslations("shop.boost");
  const [selected, setSelected] = useState<"double-elo" | "shield" | "">("");

  const hasDoubleElo = inventory.doubleElo > 0;
  const hasShield = inventory.shield > 0;

  // Nothing to show — the parent will skip rendering this when the
  // inventory is empty. Defensive `if` here for safety.
  if (!hasDoubleElo && !hasShield) return null;

  return (
    <div className="mb-3 rounded-md border border-white/[0.08] bg-white/[0.02] p-2.5">
      <input type="hidden" name="boost" value={selected} />
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-fg-3">
        {t("pickerHint")}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Pill
          label={t("pickerNone")}
          active={selected === ""}
          onClick={() => setSelected("")}
          tint="#5C6390"
        />
        {hasDoubleElo && (
          <Pill
            label={`×2 ELO · ${inventory.doubleElo}`}
            active={selected === "double-elo"}
            onClick={() => setSelected("double-elo")}
            tint="#7C5CFF"
          />
        )}
        {hasShield && (
          <Pill
            label={`◊ Shield · ${inventory.shield}`}
            active={selected === "shield"}
            onClick={() => setSelected("shield")}
            tint="#4ADE80"
          />
        )}
      </div>
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
  tint,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border px-2.5 py-1 font-display text-[10px] font-semibold transition"
      style={{
        background: active ? `${tint}26` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${tint}80` : "rgba(255,255,255,0.08)",
        color: active ? tint : "#9AA0BF",
      }}
    >
      {label}
    </button>
  );
}
