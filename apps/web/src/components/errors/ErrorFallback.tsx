"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  /** The error captured by the route's <ErrorBoundary>. */
  error: Error & { digest?: string };
  /** Provided by Next — re-mounts the segment, which retries the render. */
  reset: () => void;
  /**
   * Which copy to render. `home` is the generic broken-screen copy;
   * `match` reassures the player that their seat is still held server-
   * side as long as the match is running.
   */
  variant: "home" | "match";
}

/**
 * Friendly, brand-consistent fallback rendered by the segment's
 * `error.tsx`. Plain dark surface + the same gradient buttons we use
 * elsewhere — the goal is "this is still Quizelo, not a Vercel 500".
 *
 * Two CTAs:
 *   - "Réessayer" calls `reset()` which Next.js wires to re-render the
 *     erroring segment. Most transient crashes recover on the second
 *     try (lazy chunk load, fetch race, dev HMR).
 *   - "Retour à l'accueil" navigates to /home. We surface this even on
 *     the home boundary itself in case the home page is the one that
 *     crashed and the user wants a hard nav (router push) rather than
 *     a re-render.
 *
 * The error message itself only renders in development. In prod we show
 * the digest — Next.js logs the full stack server-side anyway, and
 * leaking error.message can expose internals.
 */
export function ErrorFallback({ error, reset, variant }: ErrorFallbackProps) {
  const t = useTranslations("errorBoundary");
  // We only want to show technical details in dev. Reading
  // process.env.NODE_ENV in client components is fine — Next inlines it.
  const isDev = process.env.NODE_ENV !== "production";

  // Track retries client-side so we can surface a "still failing"
  // hint after the user has clicked Retry once. Avoids the user
  // bouncing the same broken render over and over without context.
  const [retries, setRetries] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[error-boundary]", { variant, error });
  }, [error, variant]);

  return (
    <main className="bg-surface-1 qa-scan relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="qa-grid-bg" aria-hidden />

      <div className="relative z-10 flex max-w-[480px] flex-col items-start text-left">
        <p className="text-violet-light font-mono text-[11px] tracking-widest3">
          ◆ {t("title").toUpperCase()}
        </p>

        <h1 className="font-display mt-3 text-[40px] font-bold leading-[1] tracking-[-0.025em] text-white">
          {t("title")}
        </h1>

        <p className="text-fg-2 mt-4 mb-7 text-[14px] leading-relaxed">
          {variant === "match" ? t("bodyMatch") : t("bodyHome")}
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              setRetries((r) => r + 1);
              reset();
            }}
            className="flex-1 justify-center"
          >
            {t("retry")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            asChild
            className="flex-1 justify-center"
          >
            <Link href="/home">{t("home")}</Link>
          </Button>
        </div>

        {isDev ? (
          <details className="border-white/[0.08] bg-surface-2/60 text-fg-3 mt-8 w-full rounded-md border px-3 py-2 text-[11px]">
            <summary className="cursor-pointer font-mono uppercase tracking-widest3">
              {t("details")}
              {retries > 0 ? ` · retries: ${retries}` : ""}
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-fg-2">
              {error.message}
              {error.digest ? `\n\ndigest: ${error.digest}` : ""}
              {error.stack ? `\n\n${error.stack}` : ""}
            </pre>
          </details>
        ) : error.digest ? (
          <p className="text-fg-3 mt-6 font-mono text-[10px] tracking-widest3">
            ref · {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
