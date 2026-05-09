-- 0013 — users.is_shadow
-- Shadow (bot) accounts share the `users` table with humans so they
-- get a real user id, ELO, handle, and show up on the leaderboard
-- naturally. The match runtime holds a small pool of these and
-- creates new ones on the fly when all are busy.
--
-- A partial index on the flag keeps "find me an idle shadow" cheap
-- without paying any cost on real-user reads.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_shadow" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_is_shadow_idx" ON "users" ("is_shadow") WHERE "is_shadow" = true;
