CREATE TYPE "public"."container_state" AS ENUM('created', 'running', 'paused', 'restarting', 'removing', 'exited', 'dead');--> statement-breakpoint
CREATE TYPE "public"."host_status" AS ENUM('healthy', 'unhealthy', 'disabled', 'error');--> statement-breakpoint
CREATE TABLE "containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"host_id" uuid NOT NULL,
	"container_id" varchar(64) NOT NULL,
	"short_id" varchar(12),
	"name" varchar(255),
	"image" varchar(255) NOT NULL,
	"state" "container_state" DEFAULT 'created' NOT NULL,
	"status" varchar(120),
	"created" varchar(32),
	"labels" jsonb,
	"ports" jsonb,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"name" varchar(80) NOT NULL,
	"description" varchar(280),
	"endpoint" varchar(255) NOT NULL,
	"status" "host_status" DEFAULT 'healthy' NOT NULL,
	"last_error_at" timestamp with time zone,
	"last_error" varchar(500),
	"docker_version" varchar(40),
	"labels" jsonb,
	"metadata" jsonb,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "containers" ADD CONSTRAINT "containers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "containers" ADD CONSTRAINT "containers_host_id_hosts_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."hosts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "containers_host_container_id_uq" ON "containers" USING btree ("host_id","container_id");--> statement-breakpoint
CREATE INDEX "containers_organization_idx" ON "containers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "containers_host_state_idx" ON "containers" USING btree ("host_id","state");--> statement-breakpoint
CREATE INDEX "containers_host_synced_idx" ON "containers" USING btree ("host_id","synced_at");--> statement-breakpoint
CREATE INDEX "containers_container_id_idx" ON "containers" USING btree ("container_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hosts_organization_name_uq" ON "hosts" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "hosts_organization_idx" ON "hosts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "hosts_status_idx" ON "hosts" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hosts_created_idx" ON "hosts" USING btree ("created_at");