"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/routing";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import {
  setNewPasswordAction,
  type AuthActionResult,
} from "@/lib/auth-actions";

interface NewPasswordFormProps {
  labels: {
    password: string;
    submit: string;
    done: string;
    backToLogin: string;
    error: string;
    tooShort: string;
  };
}

export function NewPasswordForm({ labels }: NewPasswordFormProps) {
  const [state, formAction] = useActionState<AuthActionResult | null, FormData>(
    setNewPasswordAction,
    null,
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="rounded-md border border-success/40 bg-success/[0.08] px-4 py-3.5 text-[13px] text-fg-1"
        >
          {labels.done}
        </div>
        <Link
          href="/auth/login"
          className="rounded-md bg-violet px-4 py-3 text-center text-[13px] font-semibold text-white no-underline hover:bg-violet-light"
        >
          {labels.backToLogin} ▸
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AuthInput
        id="new-password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        icon={<span aria-hidden>🔒</span>}
        label={labels.password}
        placeholder="••••••••"
      />

      {state && !state.ok ? (
        <p className="font-mono text-[11px] text-danger">
          {state.code === "validation"
            ? labels.tooShort
            : state.message ?? labels.error}
        </p>
      ) : null}

      <SubmitButton label={labels.submit} />
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
      className="mt-2 py-3.5"
      disabled={pending}
    >
      {pending ? "…" : `${label} ▸`}
    </Button>
  );
}
