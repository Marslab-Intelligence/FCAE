CREATE TABLE "client_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"zoho_project_id" text NOT NULL,
	"zoho_portal_id" text DEFAULT 'marslab' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_projects_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;