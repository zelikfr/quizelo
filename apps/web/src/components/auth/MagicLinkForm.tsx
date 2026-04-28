"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  signInWithMagicLinkAction,
  type AuthActionResult,
} from "@/lib/auth-actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";

interface MagicLinkFormProps {
  redirectTo?: string;
}

export function MagicLinkForm({ redirectTo }: MagicLinkFormProps) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState<AuthActionResult | null, FormData>(
    signInWithMagicLinkAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <AuthInput
        id="magic-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        icon={<span aria-hidden>✉</span>}
        label={t("magicLink.label")}
        placeholder="you@quizelo.gg"
      />

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger"
        >
          {state.message ?? t("errors.generic")}
        </p>
      )}

      <SubmitButton label={t("magicLink.submit")} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="full" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}
