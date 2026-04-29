"use server";

import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export type MatchMode = "quick" | "ranked";

export type EnqueueResult =
  | { ok: true; matchId: string }
  | { ok: false; reason: "unauthorized" | "api_down" | "unknown"; message?: string };

/**
 * Enqueue the current user into a match lobby (or join an open one).
 * Forwards the Auth.js cookie so apps/api can decode the session.
 */
export async function enqueueMatchAction(
  mode: MatchMode = "quick",
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
      body: JSON.stringify({ locale, mode }),
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

/** Form-targetable enqueue + redirect for ranked matches. */
export async function enqueueRankedAndRedirectAction(): Promise<void> {
  return enqueueAndRedirectFor("ranked");
}

async function enqueueAndRedirectFor(mode: MatchMode): Promise<void> {
  const result = await enqueueMatchAction(mode);
  if (!result.ok) {
    if (result.reason === "unauthorized") redirect("/auth/login?from=/home");
    redirect("/home?error=match_unavailable");
  }
  redirect(`/match/${result.matchId}`);
}
