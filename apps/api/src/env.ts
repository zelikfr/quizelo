import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(16),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  /**
   * Optional comma-separated list of extra CORS origins on top of
   * `AUTH_URL`. Useful in dev when reaching the API from both
   * `localhost:3000` and a LAN IP (e.g. `192.168.1.94:3000`) at the
   * same time. Each entry must be a full origin (scheme + host + port).
   */
  CORS_EXTRA_ORIGINS: z.string().optional(),
});

const parsed = schema.parse(process.env);

/** Final list of allowed CORS origins: AUTH_URL + every CORS_EXTRA_ORIGINS entry. */
const corsOrigins = [
  parsed.AUTH_URL,
  ...(parsed.CORS_EXTRA_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? []),
];

export const env = { ...parsed, CORS_ORIGINS: corsOrigins };
export type Env = typeof env;
