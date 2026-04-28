import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(16),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
