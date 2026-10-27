CREATE TABLE "product" (
	"serial_number" serial PRIMARY KEY NOT NULL,
	"status" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"group" text NOT NULL,
	"type" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"license_key" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" integer NOT NULL,
	"max_devices" integer DEFAULT 6 NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"expires_at" date NOT NULL,
	"auto_renew" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_to_product" (
	"license_key" integer NOT NULL,
	"serial_number" integer NOT NULL,
	CONSTRAINT "subscription_to_product_license_key_serial_number_pk" PRIMARY KEY("license_key","serial_number")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"managed_by" text DEFAULT 'global' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "task" CASCADE;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_to_product" ADD CONSTRAINT "subscription_to_product_license_key_subscription_license_key_fk" FOREIGN KEY ("license_key") REFERENCES "public"."subscription"("license_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_to_product" ADD CONSTRAINT "subscription_to_product_serial_number_product_serial_number_fk" FOREIGN KEY ("serial_number") REFERENCES "public"."product"("serial_number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");