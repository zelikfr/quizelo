import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to reset the database in production");
}

const main = async () => {
  const client = postgres(url, { max: 1 });
  console.log("→ dropping public schema…");
  await client.unsafe(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);
  console.log("✓ schema reset — run pnpm db:migrate next");
  await client.end();
};

main().catch((err) => {
  console.error("✗ reset failed", err);
  process.exit(1);
});
