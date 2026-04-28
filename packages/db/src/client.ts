import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Re-use the connection across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __quizelo_pg__: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__quizelo_pg__ ??
  postgres(databaseUrl, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__quizelo_pg__ = client;
}

export const db = drizzle(client, { schema, casing: "snake_case" });
export type Database = typeof db;
export { schema };
