"use client";

import { useTransition } from "react";
import { signInWithProviderAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

type Provider = "google" | "apple";

interface SocialButtonsProps {
  /** Render as compact icon-only on small layouts. */
  compact?: boolean;
  providers?: readonly Provider[];
  redirectTo?: string;
}

const DEFAULT_PROVIDERS = ["google", "apple"] as const;

const LABELS: Record<Provider, string> = {
  google: "Google",
  apple: "Apple",
};

export function SocialButtons({
  compact = false,
  providers = DEFAULT_PROVIDERS,
  redirectTo,
}: SocialButtonsProps) {
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-2">
      {providers.map((p) => (
        <Button
          key={p}
          type="button"
          variant="ghost"
          size="full"
          disabled={pending}
          onClick={() => start(() => signInWithProviderAction(p, redirectTo))}
          className="justify-center px-3 py-3 text-xs"
        >
          {p === "google" && <GoogleGlyph />}
          {p === "apple" && <AppleGlyph />}
          {!compact && <span>{LABELS[p]}</span>}
        </Button>
      ))}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.13 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16.36 1.43c0 1.15-.42 2.18-1.25 3.07-1.01 1.06-2.23 1.68-3.55 1.57-.02-1.13.46-2.21 1.27-3.07.91-.97 2.34-1.69 3.53-1.57Zm3.43 16.45c-.55 1.27-.81 1.83-1.51 2.95-.99 1.57-2.39 3.53-4.13 3.55-1.55.01-1.95-1.01-4.05-1-2.1.01-2.54 1.02-4.09 1-1.74-.02-3.07-1.79-4.06-3.36C-1.01 17.74-1.3 11.41 2.36 8.07c1.21-1.1 2.83-1.74 4.36-1.74 1.55 0 2.52.85 3.81.85 1.24 0 2-.85 3.79-.85 1.36 0 2.79.74 3.82 2.02-3.36 1.84-2.81 6.64.65 7.53Z"
      />
    </svg>
  );
}
