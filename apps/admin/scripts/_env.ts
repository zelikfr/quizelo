/**
 * Env bootstrap — must be the FIRST import of any script that uses
 * `@quizelo/db`. Module imports are hoisted, so calling dotenv from the
 * script body runs too late: the db client throws during its own
 * top-level evaluation if DATABASE_URL is missing.
 *
 * Loading order is "first found wins" — apps/admin/.env.local is
 * checked first, then the repo-root .env. dotenv's default behaviour
 * is to NOT override already-set keys, which is what we want.
 */
import { config } from "dotenv";
import { resolve } from "node:path";

// __dirname works in tsx's CJS pipeline (which is what `tsx scripts/...`
// uses by default for a workspace without `"type": "module"`).
config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(__dirname, "..", "..", "..", ".env") });
