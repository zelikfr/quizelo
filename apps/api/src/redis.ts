import Redis from "ioredis";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __quizelo_redis__: Redis | undefined;
}

const create = () => {
  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 200, 5_000),
    reconnectOnError: () => false,
  });

  // Stop the spam loop — log the first error per minute, swallow the rest.
  let lastLog = 0;
  client.on("error", (err) => {
    const now = Date.now();
    if (now - lastLog > 60_000) {
      lastLog = now;
      // eslint-disable-next-line no-console
      console.warn(`[redis] ${err.message} — is docker-compose up?`);
    }
  });

  return client;
};

export const redis = globalThis.__quizelo_redis__ ?? create();

if (env.NODE_ENV !== "production") {
  globalThis.__quizelo_redis__ = redis;
}

/** Try to connect; resolves with true on success, false on failure. */
export const tryRedis = async (): Promise<boolean> => {
  try {
    if (redis.status === "ready") return true;
    if (redis.status === "wait" || redis.status === "end") {
      await redis.connect();
    }
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
};
