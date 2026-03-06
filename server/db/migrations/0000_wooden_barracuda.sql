CREATE TABLE "projects" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"tagline" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"tech_stack" text[] NOT NULL,
	"primary_tech" varchar(100) DEFAULT 'Unknown' NOT NULL,
	"main_img_url" text,
	"images_url" text[],
	"repo_url" varchar(500) NOT NULL,
	"live_url" text,
	"year" integer,
	"post_url" varchar(500),
	"blog_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
