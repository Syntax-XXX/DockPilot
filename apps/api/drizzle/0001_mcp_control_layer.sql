CREATE TYPE "public"."ai_permission_level" AS ENUM('read', 'write', 'destructive');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected', 'expired', 'executed', 'failed');--> statement-breakpoint
CREATE TABLE "ai_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"requested_by_credential_id" uuid NOT NULL,
	"tool_name" varchar(80) NOT NULL,
	"action_type" varchar(60) NOT NULL,
	"permission_level" "ai_permission_level" NOT NULL,
	"target_type" varchar(40) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"arguments" jsonb NOT NULL,
	"justification" varchar(500),
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"decided_by_user_id" uuid,
	"decided_at" timestamp with time zone,
	"decision_note" varchar(280),
	"execution_audit_event_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"name" varchar(80) NOT NULL,
	"description" varchar(280),
	"agent_identity" varchar(120) DEFAULT 'unspecified' NOT NULL,
	"permission_level" "ai_permission_level" DEFAULT 'read' NOT NULL,
	"token_prefix" varchar(16) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	CONSTRAINT "ai_credentials_token_hash_hex_chk" CHECK ("ai_credentials"."token_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "ai_credentials_token_prefix_chk" CHECK ("ai_credentials"."token_prefix" ~ '^dpai_[A-Za-z0-9_-]{8}$')
);
--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_actor_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ai_credential_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "agent_identity" varchar(120);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "tool_name" varchar(80);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "permission_used" varchar(20);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "target_type" varchar(40);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "target_id" varchar(255);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "approval_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "error_category" varchar(40);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "duration_ms" integer;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "source_ip" varchar(64);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_agent" varchar(255);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "correlation_id" varchar(64);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "input_summary" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "result_summary" jsonb;--> statement-breakpoint
ALTER TABLE "ai_approvals" ADD CONSTRAINT "ai_approvals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_approvals" ADD CONSTRAINT "ai_approvals_requested_by_credential_id_ai_credentials_id_fk" FOREIGN KEY ("requested_by_credential_id") REFERENCES "public"."ai_credentials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_approvals" ADD CONSTRAINT "ai_approvals_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_credentials" ADD CONSTRAINT "ai_credentials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_credentials" ADD CONSTRAINT "ai_credentials_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_approvals_pending_idx" ON "ai_approvals" USING btree ("organization_id","status","created_at");--> statement-breakpoint
CREATE INDEX "ai_approvals_credential_idx" ON "ai_approvals" USING btree ("requested_by_credential_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_approvals_target_idx" ON "ai_approvals" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_credentials_token_hash_uq" ON "ai_credentials" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "ai_credentials_organization_idx" ON "ai_credentials" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ai_credentials_active_idx" ON "ai_credentials" USING btree ("organization_id","revoked_at","disabled_at");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_correlation_idx" ON "audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "audit_logs_ai_credential_time_idx" ON "audit_logs" USING btree ("ai_credential_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_tool_time_idx" ON "audit_logs" USING btree ("tool_name","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_outcome_time_idx" ON "audit_logs" USING btree ("outcome","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_outcome_error_chk" CHECK ("audit_logs"."outcome" <> 'failure' OR "audit_logs"."error_category" IS NOT NULL);--> statement-breakpoint
CREATE FUNCTION dockpilot_audit_logs_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'audit_logs is append-only and cannot be modified or deleted';
END;
$$;--> statement-breakpoint
CREATE TRIGGER audit_logs_append_only_trg
	BEFORE UPDATE OR DELETE ON "audit_logs"
	FOR EACH ROW
	EXECUTE FUNCTION dockpilot_audit_logs_append_only();