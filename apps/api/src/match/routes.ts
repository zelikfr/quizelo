import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { readSession } from "../auth-cookie";
import { matchmaker } from "./matchmaker";
import { registry } from "./registry";

const enqueueBody = z.object({
  locale: z.string().min(2).max(8).default("fr"),
  mode: z.enum(["quick", "ranked"]).default("quick"),
  /**
   * Optional pre-match boost the user activated. The web app already
   * consumed it from `users.boost_inventory` before sending us this
   * request, so we just need to remember which one to apply at
   * settlement. Ignored when mode === "quick".
   */
  boost: z.enum(["double-elo", "shield"]).nullish(),
});

export async function registerMatchRoutes(app: FastifyInstance): Promise<void> {
  // ─── HTTP ─────────────────────────────────────────────────────
  app.post("/match", async (req, reply) => {
    const session = await readSession(req);
    if (!session) return reply.code(401).send({ error: "UNAUTHORIZED" });

    const parsed = enqueueBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_REQUEST", issues: parsed.error.issues });
    }

    try {
      const { matchId } = await matchmaker.enqueue({
        userId: session.userId,
        locale: parsed.data.locale,
        mode: parsed.data.mode,
        boost: parsed.data.mode === "ranked" ? parsed.data.boost ?? null : null,
        log: app.log,
      });
      return { matchId };
    } catch (err) {
      app.log.error({ err }, "enqueue failed");
      return reply.code(500).send({ error: "ENQUEUE_FAILED" });
    }
  });

  /**
   * Returns the user's active match if any — used by /home (and any
   * other landing surface) to bounce a player who left mid-match back
   * to where they were instead of leaving them stuck on a navigation
   * away. "Active" means the registry holds a room where the user is
   * still `active` or `finalist`; eliminated and `left` players don't
   * trigger the redirect.
   */
  app.get("/match/active", async (req, reply) => {
    const session = await readSession(req);
    if (!session) return reply.code(401).send({ error: "UNAUTHORIZED" });

    for (const room of registry.list()) {
      const me = room.state.players.find(
        (p) => p.userId === session.userId,
      );
      if (!me) continue;
      // Same condition matchmaker uses to "resume" a player: only true
      // mid-game states count. `winner` and elim statuses don't trap
      // the user in their previous match.
      if (me.status === "active" || me.status === "finalist") {
        return {
          matchId: room.state.matchId,
          status: room.state.status,
          mode: room.state.mode,
        };
      }
    }
    return { matchId: null };
  });

  app.get("/match/:matchId", async (req, reply) => {
    const session = await readSession(req);
    if (!session) return reply.code(401).send({ error: "UNAUTHORIZED" });

    const { matchId } = req.params as { matchId: string };
    const room = registry.get(matchId);
    if (!room) return reply.code(404).send({ error: "NOT_FOUND" });

    const isMember = room.state.players.some((p) => p.userId === session.userId);
    if (!isMember) return reply.code(403).send({ error: "FORBIDDEN" });

    return {
      matchId: room.state.matchId,
      status: room.state.status,
      players: room.state.players.map((p) => ({
        userId: p.userId,
        seat: p.seat,
        name: p.name,
        handle: p.handle,
        avatarId: p.avatarId,
        status: p.status,
        score: p.score,
        isShadow: p.isShadow,
      })),
    };
  });

  // ─── Admin ────────────────────────────────────────────────────
  // Snapshot of every in-memory room — used by the backoffice live page.
  // Auth: a shared secret (`ADMIN_API_TOKEN`) over `X-Admin-Token`. We
  // can't reuse the user JWT cookie because the admin app sits on a
  // different origin (different cookie scope).
  app.get("/admin/live-matches", async (req, reply) => {
    const expected = process.env.ADMIN_API_TOKEN;
    if (!expected) return reply.code(503).send({ error: "ADMIN_API_TOKEN_NOT_SET" });
    const got = req.headers["x-admin-token"];
    if (got !== expected) return reply.code(401).send({ error: "UNAUTHORIZED" });

    const rooms = registry.list();
    return {
      rooms: rooms.map((r) => ({
        matchId: r.state.matchId,
        status: r.state.status,
        mode: r.state.mode,
        locale: r.state.locale,
        players: r.state.players.map((p) => ({
          userId: p.userId,
          seat: p.seat,
          name: p.name,
          status: p.status,
          score: p.score,
          isShadow: p.isShadow,
        })),
      })),
    };
  });

  // ─── WebSocket ────────────────────────────────────────────────
  app.get(
    "/ws/match/:matchId",
    { websocket: true },
    async (socket, req) => {
      const session = await readSession(req);
      if (!session) {
        socket.send(JSON.stringify({ type: "error", code: "UNAUTHORIZED" }));
        socket.close(4001, "unauthorized");
        return;
      }

      const { matchId } = req.params as { matchId: string };
      const room = registry.get(matchId);
      if (!room) {
        socket.send(JSON.stringify({ type: "error", code: "NOT_FOUND" }));
        socket.close(4004, "not found");
        return;
      }

      room.attach(session.userId, socket);
    },
  );
}
