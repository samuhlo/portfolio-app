/**
 * ========================================================================
 * [VALIDATOR] :: PROJECT SCHEMA
 * ========================================================================
 * DESC:   Esquemas Zod para validación de requests en el servidor.
 * ========================================================================
 */
import { z } from 'zod';

export const LocalizedTextSchema = z.object({
  en: z.string(),
  es: z.string(),
});

export const ProjectQuerySchema = z.object({
  primary_tech: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const ProjectParamsSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export const ProjectListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  tagline: LocalizedTextSchema,
  techStack: z.array(z.string()),
  primaryTech: z.string(),
  mainImgUrl: z.string().nullable(),
  repoUrl: z.string(),
  liveUrl: z.string().nullable(),
  year: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectDetailSchema = ProjectListItemSchema.extend({
  description: LocalizedTextSchema,
  imagesUrl: z.array(z.string()),
  postUrl: z.string().nullable(),
  blogUrl: z.string().nullable(),
});

export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
