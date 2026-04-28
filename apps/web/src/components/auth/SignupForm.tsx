"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  signUpWithCredentialsAction,
  type AuthActionResult,
} from "@/lib/auth-actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { Checkbox } from "@/components/auth/Checkbox";
import { DateOfBirthInput } from "@/components/auth/DateOfBirthInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/button";

const HANDLE_RE = /^[a-z0-9_]+$/i;

function passwordStrength(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 0.25;
  if (value.length >= 12) score += 0.25;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 0.2;
  if (/\d/.test(value)) score += 0.15;
  if (/[^A-Za-z0-9]/.test(value)) score += 0.15;
  return Math.min(1, score);
}

export function SignupForm() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState<AuthActionResult | null, FormData>(
    signUpWithCredentialsAction,
    null,
  );

  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");

  const handleValid = handle.length >= 3 && HANDLE_RE.test(handle);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AuthInput
        id="signup-handle"
        name="handle"
        type="text"
        autoComplete="username"
        required
        minLength={3}
        maxLength={16}
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        tone={handleValid ? "valid" : undefined}
        icon={<span aria-hidden>@</span>}
        label={t("fields.handle")}
        className="font-mono"
        trailing={
          handleValid ? (
            <span className="font-mono text-[11px] text-success">
              ✓ {t("signup.handleAvailable")}
            </span>
          ) : null
        }
        helper={t("signup.handleHint")}
      />

      <AuthInput
        id="signup-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        icon={<span aria-hidden>✉</span>}
        label={t("fields.email")}
        placeholder="nyra@example.com"
      />

      <div>
        <AuthInput
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<span aria-hidden>⌧</span>}
          label={t("fields.password")}
          placeholder="••••••••••"
        />
        <PasswordStrength
          value={passwordStrength(password)}
          weakLabel={t("signup.passwordStrength.weak")}
          mediumLabel={t("signup.passwordStrength.medium")}
          strongLabel={t("signup.passwordStrength.strong")}
        />
      </div>

      <DateOfBirthInput
        label={t("signup.dob.label")}
        ddLabel={t("signup.dob.dd")}
        mmLabel={t("signup.dob.mm")}
        yyyyLabel={t("signup.dob.yyyy")}
        defaults={{ dd: "", mm: "", yyyy: "" }}
      />

      <div className="mt-2 flex flex-col gap-2">
        <Checkbox
          id="signup-terms"
          name="acceptTerms"
          required
          label={
            <>
              {t("signup.consents.termsPrefix")}{" "}
              <a className="cursor-pointer text-fg-1 underline">
                {t("signup.consents.terms")}
              </a>{" "}
              {t("signup.consents.and")}{" "}
              <a className="cursor-pointer text-fg-1 underline">
                {t("signup.consents.privacy")}
              </a>
              .
            </>
          }
        />
        <Checkbox
          id="signup-newsletter"
          name="newsletter"
          label={t("signup.consents.newsletter")}
        />
      </div>

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger"
        >
          {state.message ?? t("errors.generic")}
        </p>
      )}

      <SubmitButton label={t("signup.submit")} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="gold"
      size="full"
      disabled={pending}
      className="mt-3 py-3.5"
    >
      {pending ? "…" : `${label} ▸`}
    </Button>
  );
}
