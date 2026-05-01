"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  type AuthActionResult,
} from "@/lib/auth-actions";

interface ForgotPasswordFormProps {
  labels: {
    email: string;
    submit: string;
    sent: string;
    error: string;
  };
}

/**
 * Client-side form that triggers `requestPasswordResetAction`. On
 * success we show a generic confirmation message — even when the email
 * isn't registered, to prevent account enumeration.
 */
export function ForgotPasswordForm({ labels }: ForgotPasswordFormProps) {
  const [state, formAction] = useActionState<AuthActionResult | null, FormData>(
    requestPasswordResetAction,
    null,
  );

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-md border border-success/40 bg-success/[0.08] px-4 py-3.5 text-[13px] text-fg-1"
      >
        {labels.sent}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AuthInput
        id="forgot-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        icon={<span aria-hidden>✉</span>}
        label={labels.email}
        placeholder="alex@quizelo.gg"
      />

      {state && !state.ok ? (
        <p className="font-mono text-[11px] text-danger">
          {state.message ?? labels.error}
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
