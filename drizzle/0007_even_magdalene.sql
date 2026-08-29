CREATE TABLE "auth_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp DEFAULT now() NOT NULL,
	"locked_until" timestamp,
	CONSTRAINT "auth_attempts_identifier_unique" UNIQUE("identifier")
);
