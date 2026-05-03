ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "referral_code" text,
  ADD COLUMN IF NOT EXISTS "referred_by_user_id" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_referral_code_unique'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE ("referral_code");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "referral_rewards" (
  "id" text PRIMARY KEY NOT NULL,
  "referrer_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "referee_user_id"  text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "milestone" text NOT NULL,
  "referrer_credits" integer NOT NULL,
  "referee_credits"  integer NOT NULL,
  "awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "referral_rewards_referee_milestone_uq"
  ON "referral_rewards" ("referee_user_id", "milestone");
