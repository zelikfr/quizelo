"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PlayButtonProps {
  label: string;
  variant?: "primary" | "gold";
  className?: string;
  /** Externally disable the button (e.g. quota exhausted). */
  disabled?: boolean;
  /** Override label rendered when the button is disabled. */
  disabledLabel?: string;
}

export function PlayButton({
  label,
  variant = "primary",
  className,
  disabled = false,
  disabledLabel,
}: PlayButtonProps) {
  const { pending } = useFormStatus();
  const t = useTranslations("match.shell");
  return (
    <Button
      type="submit"
      variant={variant}
      size="full"
      disabled={pending || disabled}
      className={cn("py-3.5", className)}
    >
      {pending
        ? `${t("connecting")} …`
        : disabled
          ? (disabledLabel ?? label)
          : `${label} ▸`}
    </Button>
  );
}
