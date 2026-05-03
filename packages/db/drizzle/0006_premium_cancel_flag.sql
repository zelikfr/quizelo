ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "premium_cancel_at_period_end" boolean NOT NULL DEFAULT false;
