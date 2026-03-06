/**
 * ========================================================================
 * [SCHEMA] :: PROJECTS TABLE
 * ========================================================================
 * DESC:   Definición de la tabla de proyectos para Drizzle ORM.
 *         Almacena proyectos del portfolio extraídos desde GitHub.
 * ========================================================================
 */
import { pgTable, text, jsonb, timestamp, integer, varchar } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  tagline: jsonb('tagline').notNull(),
  description: jsonb('description').notNull(),
  vNote: jsonb('v_note'),
  projectColor: varchar('project_color', { length: 7 }),
  hoverTextCard: text('hover_text_card'),
  techStack: text('tech_stack').array().notNull(),
  primaryTech: varchar('primary_tech', { length: 100 }).notNull().default('Unknown'),
  mainImgUrl: text('main_img_url'),
  imagesUrl: text('images_url').array(),
  repoUrl: varchar('repo_url', { length: 500 }).notNull(),
  liveUrl: text('live_url'),
  year: integer('year'),
  postUrl: varchar('post_url', { length: 500 }),
  blogUrl: varchar('blog_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ProjectRow = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
