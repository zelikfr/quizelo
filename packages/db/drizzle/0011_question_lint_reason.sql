-- 0011 — questions.lint_reason
-- Set by the seed pipeline's shape-leak linter when a question's
-- correct-answer shape differs from its distractors in a way that
-- would let a player guess by elimination. Flagged questions are
-- forced inactive at seed time; an admin can review them in the
-- backoffice and either approve (clears lint_reason) or edit + reseed.
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "lint_reason" text;
