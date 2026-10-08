CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'operator', 'viewer');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(254) NOT NULL,
	"email_normalized" varchar(254) NOT NULL,
	"password_hash" varchar(512) NOT NULL,
	"name" varchar(80) NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'viewer' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_normalized_uq" ON "users" USING btree ("email_normalized");
--> statement-breakpoint
CREATE INDEX "users_organization_idx" ON "users" USING btree ("organization_id");
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "sessions_token_hash_hex_chk" CHECK ("sessions"."token_hash" ~ '^[a-f0-9]{64}$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_uq" ON "sessions" USING btree ("token_hash");
--> statement-breakpoint
CREATE INDEX "sessions_user_expiry_idx" ON "sessions" USING btree ("user_id", "expires_at");
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(80) NOT NULL,
	"resource_id" varchar(255),
	"outcome" varchar(16) DEFAULT 'success' NOT NULL,
	"metadata" jsonb,
	"request_id" varchar(255),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "audit_logs_outcome_chk" CHECK ("audit_logs"."outcome" IN ('success', 'failure', 'denied'))
);
--> statement-breakpoint
CREATE INDEX "audit_logs_organization_time_idx" ON "audit_logs" USING btree ("organization_id", "occurred_at");
