ALTER TABLE "subscription" ALTER COLUMN "type" SET DEFAULT 'home'::"public"."subscription_type";--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "type" SET DATA TYPE "public"."subscription_type" USING "type"::"public"."subscription_type";--> statement-breakpoint
DROP TYPE "public"."product_type";--> statement-breakpoint
DROP TYPE "public"."staff_type";