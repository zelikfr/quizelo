"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { signInWithCredentialsAction, type AuthActionResult } from "@/lib/auth-actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { Checkbox } from "@/components/auth/Checkbox";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState<AuthActionResult | null, FormData>(
    signInWithCredentialsAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      <AuthInput
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        icon={<span aria-hidden>✉</span>}
        label={t("fields.email")}
        placeholder="alex@quizelo.gg"
      />

      <AuthInput
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        icon={<span aria-hidden>⌧</span>}
        tone="focus"
        label={t("fields.password")}
        placeholder="••••••••••••"
        hint={
          <Link
            href="/auth/forgot-password"
            className="text-violet-light no-underline hover:text-white"
          >
            {t("login.forgot")}
          </Link>
        }
      />

      <Checkbox
        id="login-stay"
        name="staySignedIn"
        defaultChecked
        label={t("login.staySignedIn")}
      />

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger"
        >
          {state.message ?? t("errors.generic")}
        </p>
      )}

      <SubmitButton label={t("login.submit")} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="full"
      disabled={pending}
      className="mt-2 py-3.5"
    >
      {pending ? "…" : `${label} ▸`}
    </Button>
  );
}
