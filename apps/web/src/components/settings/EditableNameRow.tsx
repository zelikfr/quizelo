"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateDisplayNameAction } from "@/lib/user-actions";
import { cn } from "@/lib/cn";

interface EditableNameRowProps {
  label: React.ReactNode;
  initialValue: string;
  /** Compact (mobile) variant — chevron-style row instead of an action button. */
  compact?: boolean;
}

/**
 * Settings row for `users.display_name`. Click `Edit` → inline input + Save /
 * Cancel. On Save, calls `updateDisplayNameAction`; the page revalidates the
 * layout so any other component that reads the user gets the new value.
 */
export function EditableNameRow({
  label,
  initialValue,
  compact = false,
}: EditableNameRowProps) {
  const t = useTranslations("settings");
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onCancel = () => {
    setEditing(false);
    setValue(initialValue);
    setError(null);
  };

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateDisplayNameAction(value);
      if (!res.ok) {
        setError(res.message ?? t("errors.unknown"));
        return;
      }
      setEditing(false);
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-white/[0.08] last:border-b-0",
        compact ? "px-3.5 py-3" : "px-[18px] py-3.5",
      )}
    >
      <span
        className={cn(
          "font-display font-medium",
          compact ? "flex-1 text-xs text-fg-1" : "w-40 shrink-0 text-xs text-fg-3",
        )}
      >
        {label}
      </span>

      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
            autoFocus
            maxLength={40}
            className={cn(
              "min-w-0 flex-1 rounded border border-white/[0.12] bg-black/30 px-2.5 py-1.5",
              "font-mono text-[13px] text-fg-1 outline-none",
              "focus:border-violet/50 focus:ring-1 focus:ring-violet/40",
              error && "border-danger/60 focus:border-danger/80",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={pending || value.trim() === initialValue}
            className="px-2.5 py-1.5 text-[11px]"
          >
            {pending ? t("actions.saving") : t("actions.save")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={pending}
            className="px-2.5 py-1.5 text-[11px]"
          >
            {t("actions.cancel")}
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              "flex flex-1 items-center gap-2.5 font-mono text-[13px] text-fg-1",
              compact && "max-w-[140px] justify-end overflow-hidden text-ellipsis whitespace-nowrap text-fg-3 text-[11px]",
            )}
          >
            {initialValue || t("fields.notSet")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="px-2.5 py-1.5 text-[11px]"
          >
            {t("actions.edit")}
          </Button>
        </>
      )}

      {error && !compact && (
        <span className="shrink-0 font-mono text-[10px] text-danger">{error}</span>
      )}
    </div>
  );
}
