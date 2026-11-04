CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_to_product_serial_number_idx" ON "subscription_to_product" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX "user_managed_by_idx" ON "user" USING btree ("managed_by");