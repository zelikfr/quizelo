"use client";

import { ErrorFallback } from "@/components/errors/ErrorFallback";

/**
 * Route-level error boundary for /home. Triggered by Next.js when any
 * descendant client component throws during render. The default
 * Next.js dev/prod error pages are jarring — this swaps them for the
 * Quizelo-skinned fallback with retry + back-home CTAs.
 *
 * MUST be a client component (Next.js requirement) and accept the
 * `{ error, reset }` props it provides.
 */
export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} reset={reset} variant="home" />;
}
