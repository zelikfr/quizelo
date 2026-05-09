ALTER TABLE "users" ADD COLUMN "is_shadow" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "lint_reviewed_at" timestamp with time zone;