"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PlayButtonProps {
  label: string;
  variant?: "primary" | "gold";
  className?: string;
}

export function PlayButton({ label, variant = "primary", className }: PlayButtonProps) {
  const { pending } = useFormStatus();
  const t = useTranslations("match.shell");
  return (
    <Button
      type="submit"
      variant={variant}
      size="full"
      disabled={pending}
      className={cn("py-3.5", className)}
    >
      {pending ? `${t("connecting")} …` : `${label} ▸`}
    </Button>
  );
}
