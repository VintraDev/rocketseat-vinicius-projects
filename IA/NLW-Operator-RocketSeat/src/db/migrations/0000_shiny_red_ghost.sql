CREATE TYPE "public"."improvement_type_enum" AS ENUM('performance', 'readability', 'security', 'best_practices', 'bug_fix', 'code_style', 'architecture');--> statement-breakpoint
CREATE TYPE "public"."priority_level_enum" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."roast_mode_enum" AS ENUM('roast', 'honest');--> statement-breakpoint
CREATE TYPE "public"."submission_status_enum" AS ENUM('pending', 'analyzing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "analysis_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"ai_model" varchar(100),
	"prompt_template" text,
	"ai_response_raw" text,
	"tokens_used" integer,
	"cost_usd" numeric(10, 4),
	"latency_ms" integer,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_improvements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"improved_code" text NOT NULL,
	"diff_patch" text,
	"improvement_type" "improvement_type_enum" NOT NULL,
	"priority" "priority_level_enum" DEFAULT 'medium' NOT NULL,
	"line_start" integer,
	"line_end" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"original_code" text NOT NULL,
	"language" varchar(50) NOT NULL,
	"roast_mode" "roast_mode_enum" DEFAULT 'honest' NOT NULL,
	"shame_score" integer,
	"ai_feedback" text,
	"ai_roast" text,
	"analysis_duration_ms" integer,
	"status" "submission_status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"analyzed_at" timestamp,
	CONSTRAINT "shame_score_check" CHECK (shame_score >= 1 AND shame_score <= 10)
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"shame_score" integer NOT NULL,
	"language" varchar(50) NOT NULL,
	"code_preview" text,
	"rank_position" integer,
	"total_submissions" integer DEFAULT 1 NOT NULL,
	"average_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"username" varchar(100),
	"email" varchar(255),
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "analysis_sessions" ADD CONSTRAINT "analysis_sessions_submission_id_code_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."code_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_improvements" ADD CONSTRAINT "code_improvements_submission_id_code_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."code_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_submission_id_code_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."code_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analysis_sessions_success_created" ON "analysis_sessions" USING btree ("success","created_at");--> statement-breakpoint
CREATE INDEX "idx_analysis_sessions_ai_model" ON "analysis_sessions" USING btree ("ai_model");--> statement-breakpoint
CREATE INDEX "idx_code_improvements_type" ON "code_improvements" USING btree ("improvement_type");--> statement-breakpoint
CREATE INDEX "idx_code_submissions_status" ON "code_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_code_submissions_shame_score" ON "code_submissions" USING btree ("shame_score");--> statement-breakpoint
CREATE INDEX "idx_code_submissions_language_created" ON "code_submissions" USING btree ("language","created_at");--> statement-breakpoint
CREATE INDEX "idx_code_submissions_user_created" ON "code_submissions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_shame_score_desc" ON "leaderboard_entries" USING btree ("shame_score" ASC);--> statement-breakpoint
CREATE INDEX "idx_leaderboard_language_score" ON "leaderboard_entries" USING btree ("language","shame_score" ASC);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leaderboard_user_submission" ON "leaderboard_entries" USING btree ("user_id","submission_id");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");