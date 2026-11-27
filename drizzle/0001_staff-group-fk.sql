ALTER TABLE "staff"
  ADD CONSTRAINT "staff_group_fk"
  FOREIGN KEY ("group") REFERENCES "group"("name")
  ON DELETE RESTRICT;