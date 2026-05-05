-- 0012 — questions.lint_reviewed_at
-- Stamped by the backoffice every time an admin acts on a flagged
-- question (approve, edit, toggle, delete). The seed pipeline skips
-- the lint write when this is non-null, making admin decisions
-- sticky across `pnpm db:seed` runs. Null = "never reviewed", which
-- is the seed-time default for fresh inserts.
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "lint_reviewed_at" timestamp with time zone;
