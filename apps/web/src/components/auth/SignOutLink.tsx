"use client";

import { useTransition } from "react";
import { signOutAction } from "@/lib/auth-actions";

interface SignOutLinkProps {
  label: string;
}

/**
 * Inline "sign out" link styled as a text-only button. Used on the
 * verify-required page so the user can switch accounts without
 * leaving the gate via a dead-end.
 */
export function SignOutLink({ label }: SignOutLinkProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signOutAction())}
      disabled={pending}
      className="font-mono text-[11px] text-fg-3 underline-offset-4 hover:text-fg-1 disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}
