"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  checkHandleAvailableAction,
  signUpWithCredentialsAction,
  type AuthActionResult,
} from "@/lib/auth-actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { Checkbox } from "@/components/auth/Checkbox";
import { DateOfBirthInput } from "@/components/auth/DateOfBirthInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/button";

const HANDLE_RE = /^[a-z0-9_]+$/i;

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";

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

interface SignupFormProps {
  /** Referral code lifted off `?ref=` on /auth/signup, forwarded into
   *  the form so the action can persist `users.referredByUserId`. */
  referralCode?: string | null;
}

export function SignupForm({ referralCode = null }: SignupFormProps) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState<AuthActionResult | null, FormData>(
    signUpWithCredentialsAction,
    null,
  );

  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");

  // Debounced availability check. We re-run on every keystroke but
  // only fire the server action 350ms after the user stops typing,
  // so we don't hammer the DB. Stale responses are dropped via the
  // `currentHandle` capture so the result of an old request can't
  // overwrite a newer one.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (handle.length === 0) {
      setHandleStatus("idle");
      return;
    }
    if (handle.length < 3 || handle.length > 16 || !HANDLE_RE.test(handle)) {
      setHandleStatus("invalid");
      return;
    }
    setHandleStatus("checking");
    const currentHandle = handle;
    debounceRef.current = setTimeout(async () => {
      const res = await checkHandleAvailableAction(currentHandle);
      // Drop the result if the user kept typing in the meantime.
      if (currentHandle !== handle) return;
      setHandleStatus(res.available ? "available" : "taken");
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handle]);

  const handleTone =
    handleStatus === "available"
      ? "valid"
      : handleStatus === "taken"
        ? "warn"
        : undefined;

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
        tone={handleTone}
        icon={<span aria-hidden>@</span>}
        label={t("fields.handle")}
        className="font-mono"
        trailing={
          handleStatus === "available" ? (
            <span className="font-mono text-[11px] text-success">
              ✓ {t("signup.handleAvailable")}
            </span>
          ) : handleStatus === "taken" ? (
            <span className="font-mono text-[11px] text-warn">
              ✗ {t("signup.handleTaken")}
            </span>
          ) : handleStatus === "checking" ? (
            <span className="font-mono text-[11px] text-fg-3">…</span>
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

      <AuthInput
        id="signup-referral"
        name="referralCode"
        type="text"
        autoComplete="off"
        defaultValue={referralCode ?? ""}
        maxLength={16}
        icon={<span aria-hidden>◆</span>}
        label={t("signup.referralLabel")}
        placeholder={t("signup.referralPlaceholder")}
        className="font-mono uppercase tracking-[0.1em]"
        tone={referralCode ? "valid" : undefined}
        trailing={
          referralCode ? (
            <span className="font-mono text-[10px] text-success">
              ✓ {t("signup.referralPrefilled")}
            </span>
          ) : null
        }
        helper={t("signup.referralHelper")}
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

      <SubmitButton
        label={t("signup.submit")}
        // Block the button when the username is known to be taken or
        // still being checked — a server round-trip would just bounce
        // back with `code: "duplicate"`. Format errors / empty handles
        // fall through to the regular HTML5 `required` validation.
        blocked={handleStatus === "taken" || handleStatus === "checking"}
      />
    </form>
  );
}

function SubmitButton({
  label,
  blocked = false,
}: {
  label: string;
  blocked?: boolean;
}) {
  const { pending } = useFormStatus();
  const disabled = pending || blocked;
  return (
    <Button
      type="submit"
      variant="gold"
      size="full"
      disabled={disabled}
      className="mt-3 py-3.5"
    >
      {pending ? "…" : `${label} ▸`}
    </Button>
  );
}
