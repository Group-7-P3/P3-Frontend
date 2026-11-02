CREATE TYPE "public"."product_status" AS ENUM('inactive', 'active', 'deactivated');--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "status" SET DEFAULT 'inactive'::"public"."product_status";--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "status" SET DATA TYPE "public"."product_status" USING "status"::"public"."product_status";