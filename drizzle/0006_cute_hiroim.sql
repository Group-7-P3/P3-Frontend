ALTER TABLE "subscription" DROP CONSTRAINT "subscription_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "managedBy" text DEFAULT 'INNOVAID' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;