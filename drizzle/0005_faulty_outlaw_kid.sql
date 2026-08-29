CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"department" text NOT NULL,
	"request_type" text NOT NULL,
	"category" text NOT NULL,
	"sub_category" text,
	"task_name" text,
	"requirements" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"on_behalf_of_customer" boolean DEFAULT false NOT NULL,
	"zoho_ticket_id" text,
	"zoho_ticket_number" text,
	"zoho_synced_at" timestamp,
	"zoho_sync_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;