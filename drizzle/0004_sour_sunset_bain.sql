ALTER TABLE "subscription" DROP CONSTRAINT "subscription_customer_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "staff" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_customer_id_user_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_customer_id_unique" UNIQUE("customer_id");