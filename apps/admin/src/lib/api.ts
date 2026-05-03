/**
 * Thin wrapper around the Fastify API. Used for live-only data that
 * doesn't live in Postgres yet (e.g. in-memory match registry).
 *
 * Auth uses `ADMIN_API_TOKEN` — a shared secret set in both apps. If
 * the API isn't reachable (e.g. running the admin standalone for SSR
 * dev), every helper degrades gracefully to a null-shaped result.
 */
const API_URL = process.env.API_URL ?? "http://localhost:4000";
const TOKEN = process.env.ADMIN_API_TOKEN ?? "";

export type LiveRoom = {
  matchId: string;
  status: string;
  mode: "quick" | "ranked";
  locale: string;
  players: Array<{
    userId: string;
    seat: number;
    name: string;
    status: string;
    score: number;
    isShadow: boolean;
  }>;
};

export async function fetchLiveMatches(): Promise<{
  rooms: LiveRoom[];
  error: string | null;
}> {
  if (!TOKEN) {
    return { rooms: [], error: "ADMIN_API_TOKEN not set in admin env" };
  }
  try {
    const res = await fetch(`${API_URL}/admin/live-matches`, {
      headers: { "X-Admin-Token": TOKEN },
      cache: "no-store",
    });
    if (!res.ok) {
      return { rooms: [], error: `API returned ${res.status}` };
    }
    const data = (await res.json()) as { rooms: LiveRoom[] };
    return { rooms: data.rooms ?? [], error: null };
  } catch (e) {
    return {
      rooms: [],
      error: e instanceof Error ? e.message : "Failed to fetch live matches",
    };
  }
}
