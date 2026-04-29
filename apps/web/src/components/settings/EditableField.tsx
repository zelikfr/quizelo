"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  updateUserFieldAction,
  type UserField,
} from "@/lib/user-actions";
import { cn } from "@/lib/cn";

interface EditableFieldProps {
  field: UserField;
  label: React.ReactNode;
  initialValue: string | null;
  /** Placeholder shown when the input is empty during edit. */
  placeholder?: string;
  /** Label rendered when the value is empty in read mode. */
  emptyLabel?: string;
  /** Native `inputmode` (e.g. "tel", "numeric"). */
  inputMode?: "text" | "tel" | "numeric" | "email" | "url";
  /** When true, the empty string is rejected (used by `displayName`). */
  required?: boolean;
  /** Compact (mobile) variant — chevron-style row. */
  compact?: boolean;
  /** Hide the read value (e.g. for opaque editing flows like password). */
  hideValue?: boolean;
}

/**
 * Settings row for a `users` field. Click `Edit` → inline input + Save /
 * Cancel. Calls `updateUserFieldAction(field, value)`; on success the layout
 * is revalidated so any other component reading `getCurrentUser()` sees the
 * new value. Empty inputs become NULL in the DB (except for required fields).
 */
export function EditableField({
  field,
  label,
  initialValue,
  placeholder,
  emptyLabel,
  inputMode = "text",
  required = false,
  compact = false,
  hideValue = false,
}: EditableFieldProps) {
  const t = useTranslations("settings");

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayValue = hideValue
    ? "•••••••"
    : initialValue && initialValue.length > 0
      ? initialValue
      : (emptyLabel ?? t("fields.notSet"));
  const isEmpty = !initialValue || initialValue.length === 0;

  const onCancel = () => {
    setEditing(false);
    setValue(initialValue ?? "");
    setError(null);
  };

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateUserFieldAction(field, value);
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
            inputMode={inputMode}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
            autoFocus
            placeholder={placeholder}
            className={cn(
              "min-w-0 flex-1 rounded border border-white/[0.12] bg-black/30 px-2.5 py-1.5",
              "font-mono text-[13px] text-fg-1 outline-none placeholder:text-fg-3/60",
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
            disabled={
              pending ||
              value.trim() === (initialValue ?? "") ||
              (required && value.trim().length === 0)
            }
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
              "flex flex-1 items-center gap-2.5 font-mono text-[13px]",
              compact &&
                "max-w-[180px] justify-end overflow-hidden text-ellipsis whitespace-nowrap text-[11px]",
              isEmpty ? "text-fg-3" : compact ? "text-fg-3" : "text-fg-1",
            )}
          >
            {displayValue}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="px-2.5 py-1.5 text-[11px]"
          >
            {isEmpty ? t("actions.add") : t("actions.edit")}
          </Button>
        </>
      )}

      {error && !compact && (
        <span className="shrink-0 font-mono text-[10px] text-danger">{error}</span>
      )}
    </div>
  );
}
