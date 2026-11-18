ALTER TABLE "subscription" RENAME COLUMN "user_id" TO "customer_id";--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "subscription_user_id_idx";--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("customer_id");--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN "max_devices";--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN "auto_renew";