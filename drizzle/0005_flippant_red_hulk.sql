ALTER TABLE "user" DROP CONSTRAINT "user_customer_id_unique";--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_customer_id_user_customer_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "customer_id";