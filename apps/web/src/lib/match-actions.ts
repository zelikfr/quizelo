"use server";

import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQuickQuota } from "@/lib/quick-quota";
import { consumeBoostChargeAction, type BoostKind } from "@/lib/shop-actions";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export type MatchMode = "quick" | "ranked";

export type EnqueueResult =
  | { ok: true; matchId: string }
  | { ok: false; reason: "unauthorized" | "api_down" | "unknown"; message?: string };

/**
 * Ask the API whether the current user has a match in progress (lobby,
 * any phase, finalist seat). Returns `null` when:
 *   - no session
 *   - API down (we don't want a transient outage to bounce people)
 *   - user is not in any active room
 *
 * Used as a server-side guard on /home to redirect players back to
 * their ongoing match instead of letting them sit on a static
 * landing while their seat ticks down without them.
 */
export async function getActiveMatchAction(): Promise<{
  matchId: string;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cookieHeader = (await cookies()).toString();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/match/active`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    // API unreachable — fail open. The player can still navigate
    // anywhere; the worst case is a missed redirect for one render.
    return null;
  }

  if (!res.ok) return null;
  const body = (await res.json().catch(() => null)) as
    | { matchId: string | null }
    | null;
  if (!body || !body.matchId) return null;
  return { matchId: body.matchId };
}

/**
 * Enqueue the current user into a match lobby (or join an open one).
 * Forwards the Auth.js cookie so apps/api can decode the session.
 *
 * `boost` is forwarded to the API only on ranked mode; the caller is
 * responsible for having already consumed it from the user's
 * inventory (see `enqueueAndRedirectFor`).
 */
export async function enqueueMatchAction(
  mode: MatchMode = "quick",
  boost: BoostKind | null = null,
): Promise<EnqueueResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, reason: "unauthorized" };

  const locale = await getLocale();
  const cookieHeader = (await cookies()).toString();
  const xff = (await headers()).get("x-forwarded-for") ?? undefined;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/match`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
        ...(xff ? { "x-forwarded-for": xff } : {}),
      },
      body: JSON.stringify({
        locale,
        mode,
        boost: mode === "ranked" ? boost : null,
      }),
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      reason: "api_down",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  if (!res.ok) {
    if (res.status === 401) return { ok: false, reason: "unauthorized" };
    const text = await res.text().catch(() => "");
    return { ok: false, reason: "unknown", message: text || res.statusText };
  }

  const body = (await res.json()) as { matchId?: string };
  if (!body.matchId) return { ok: false, reason: "unknown" };
  return { ok: true, matchId: body.matchId };
}

/** Form-targetable enqueue + redirect, defaults to quick. */
export async function enqueueAndRedirectAction(): Promise<void> {
  return enqueueAndRedirectFor("quick");
}

/**
 * Form-targetable enqueue + redirect for ranked matches.
 *
 * The form posts an optional `boost` field with values "double-elo"
 * or "shield"; if present we atomically decrement one charge from the
 * user's inventory before forwarding to the API. Quitting the lobby
 * before the match starts does NOT refund the charge — same UX as a
 * one-shot consumable everywhere else in the genre.
 */
export async function enqueueRankedAndRedirectAction(
  formData: FormData,
): Promise<void> {
  const boostRaw = formData.get("boost");
  let boost: BoostKind | null = null;
  if (boostRaw === "double-elo" || boostRaw === "shield") {
    const consumed = await consumeBoostChargeAction(boostRaw);
    if (consumed.ok) {
      boost = boostRaw;
    } else {
      // Couldn't consume (no charge / unauthorized) → bail back to /home
      // with a soft error rather than letting the user enqueue without
      // the boost they expected.
      redirect("/home?error=boost_unavailable");
    }
  }
  return enqueueAndRedirectFor("ranked", boost);
}

async function enqueueAndRedirectFor(
  mode: MatchMode,
  boost: BoostKind | null = null,
): Promise<void> {
  // Daily-quota gate for free users on quick matches: we only *check* here
  // and block lobby entry — the actual decrement happens server-side at
  // phase-1 start so a player who quits the lobby before the match begins
  // doesn't burn a free game.
  if (mode === "quick") {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/login?from=/home");
    const quota = await getQuickQuota(session.user.id);
    if (quota && !quota.isPremium && (quota.remaining ?? 0) <= 0) {
      redirect("/home?error=quick_quota_exhausted");
    }
  }

  const result = await enqueueMatchAction(mode, boost);
  if (!result.ok) {
    if (result.reason === "unauthorized") redirect("/auth/login?from=/home");
    redirect("/home?error=match_unavailable");
  }
  redirect(`/match/${result.matchId}`);
}
