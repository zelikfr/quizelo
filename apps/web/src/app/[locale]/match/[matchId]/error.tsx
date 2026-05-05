"use client";

import { ErrorFallback } from "@/components/errors/ErrorFallback";

/**
 * Route-level error boundary for /match/[matchId]. The match runtime
 * is the most reducer-heavy surface in the app (WS reconnects, optimistic
 * answer locks, phase transitions) so an uncaught exception here used
 * to drop the whole tab to a white Next error screen.
 *
 * Match-specific copy reassures the player that their seat is held
 * server-side — calling `reset()` re-mounts the segment, which means
 * `useMatchSocket` reconnects, the server sends a `hello` + resync,
 * and the player picks up where they left off (assuming the bug is
 * transient). Re-mount also resets `frozenRef`, so the WS will retry
 * even if the previous instance had locked itself down on a defeat.
 */
export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} reset={reset} variant="match" />;
}
