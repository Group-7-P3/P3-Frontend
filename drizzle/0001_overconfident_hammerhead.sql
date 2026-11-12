CREATE TABLE "activity" (
	"activity" text NOT NULL,
	"time" timestamp DEFAULT now(),
	"seconds" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "activity_activity_time_pk" PRIMARY KEY("activity","time")
);
