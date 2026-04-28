CREATE TYPE "public"."match_mode" AS ENUM('quick', 'ranked');--> statement-breakpoint
CREATE TYPE "public"."match_phase" AS ENUM('phase1', 'phase2', 'phase3');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('lobby', 'phase1', 'transition_p1_p2', 'phase2', 'transition_p2_p3', 'phase3', 'results', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."player_status" AS ENUM('active', 'eliminated_p1', 'eliminated_p2', 'finalist', 'winner', 'left');--> statement-breakpoint
CREATE TYPE "public"."question_difficulty" AS ENUM('easy', 'medium', 'hard', 'expert');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticators" (
	"credential_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_user_id_credential_id_pk" PRIMARY KEY("user_id","credential_id"),
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"display_name" text,
	"handle" text,
	"avatar_id" integer,
	"locale" text DEFAULT 'fr' NOT NULL,
	"password_hash" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"premium_until" timestamp with time zone,
	"elo" integer DEFAULT 1000 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"question_id" text NOT NULL,
	"phase" "match_phase" NOT NULL,
	"round_index" integer NOT NULL,
	"chosen_choice_id" text,
	"is_correct" boolean NOT NULL,
	"response_ms" integer,
	"score_delta" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_players" (
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"seat" integer NOT NULL,
	"status" "player_status" DEFAULT 'active' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"lives" integer DEFAULT 3 NOT NULL,
	"final_rank" integer,
	"elo_delta" integer,
	"coins_delta" integer,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	CONSTRAINT "match_players_match_id_user_id_pk" PRIMARY KEY("match_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"mode" "match_mode" NOT NULL,
	"status" "match_status" DEFAULT 'lobby' NOT NULL,
	"locale" text DEFAULT 'fr' NOT NULL,
	"seed" text NOT NULL,
	"question_ids" jsonb NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"locale" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" "question_difficulty" NOT NULL,
	"prompt" text NOT NULL,
	"choices" jsonb NOT NULL,
	"correct_choice_id" text NOT NULL,
	"explanation" text,
	"time_limit" integer DEFAULT 15 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_answers" ADD CONSTRAINT "match_answers_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_answers" ADD CONSTRAINT "match_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_answers" ADD CONSTRAINT "match_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_players" ADD CONSTRAINT "match_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "match_players_seat_uq" ON "match_players" USING btree ("match_id","seat");