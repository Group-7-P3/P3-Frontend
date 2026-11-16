ALTER TABLE "staff" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "impersonated_by";--> statement-breakpoint
ALTER TABLE "staff" DROP COLUMN "banned";--> statement-breakpoint
ALTER TABLE "staff" DROP COLUMN "ban_reason";--> statement-breakpoint
ALTER TABLE "staff" DROP COLUMN "ban_expires";