ALTER TABLE "product" ADD COLUMN "created_at" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "updated_at" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "updated_at" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" date DEFAULT now() NOT NULL;