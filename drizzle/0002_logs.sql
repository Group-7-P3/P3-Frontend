CREATE TYPE "public"."log_type" AS ENUM('create_user', 'update_user', 'create_product', 'update_product', 'create_staff', 'update_staff', 'delete_staff', 'create_subscription', 'update_subscription', 'ran_query', 'changed_password', 'changed_email');--> statement-breakpoint
CREATE TYPE "public"."severity_type" AS ENUM('minor', 'medium', 'major', 'critical');--> statement-breakpoint
CREATE TABLE "log" (
	"id" serial PRIMARY KEY NOT NULL,
	"by" text NOT NULL,
	"group" text NOT NULL,
	"severity" "severity_type" DEFAULT 'minor' NOT NULL,
	"type" "log_type" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
