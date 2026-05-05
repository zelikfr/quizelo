"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Disable + dim the input — used while the form is submitting. */
  disabled?: boolean;
}

/**
 * Mandatory pre-payment checkbox: the user accepts the Sales Terms
 * AND expressly waives the 14-day right of withdrawal so the digital
 * service can be delivered immediately.
 *
 * Article L.221-28-13° of the French Code de la consommation requires
 * the waiver to be explicit and unambiguous — pre-checking the box
 * would violate that, so the parent component must own the checked
 * state and refuse the submit until it flips to true.
 */
export function ConsentCheckbox({
  checked,
  onChange,
  disabled,
}: ConsentCheckboxProps) {
  const t = useTranslations("consent");

  return (
    <label className="flex items-start gap-2 text-[11px] leading-relaxed text-fg-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 accent-violet"
      />
      <span>
        {t("labelPrefix")}
        <Link
          href="/legal/cgv"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-light underline-offset-2 hover:underline"
        >
          {t("labelLink")}
        </Link>
        {t("labelSuffix")}
      </span>
    </label>
  );
}
