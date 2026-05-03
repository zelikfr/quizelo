ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "boost_inventory" jsonb NOT NULL DEFAULT '{}'::jsonb;
