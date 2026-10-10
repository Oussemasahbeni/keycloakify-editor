CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"owner_sub" text NOT NULL,
	"name" text NOT NULL,
	"schema_version" integer NOT NULL,
	"login" jsonb NOT NULL,
	"email" jsonb NOT NULL,
	"assets" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"share_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE INDEX "themes_owner_updated_idx" ON "themes" USING btree ("owner_sub","updated_at" DESC NULLS LAST);