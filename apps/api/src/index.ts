import "dotenv/config";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { env } from "./env";
import { registerMatchRoutes } from "./match/routes";
import { tryRedis } from "./redis";

const app = Fastify({
  logger: {
    transport:
      env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } }
        : undefined,
  },
});

await app.register(cors, {
  origin: env.AUTH_URL,
  credentials: true,
});
await app.register(cookie);
await app.register(websocket);

// ─── Healthcheck ────────────────────────────────────────────────
app.get("/health", async () => {
  const redisOk = await tryRedis();
  return {
    status: "ok",
    redis: redisOk ? "up" : "down",
    ts: new Date().toISOString(),
  };
});

// ─── Match runtime (HTTP + WS) ──────────────────────────────────
await registerMatchRoutes(app);

const start = async () => {
  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(`✓ Quizelo API up on :${env.API_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
