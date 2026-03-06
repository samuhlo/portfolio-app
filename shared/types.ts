/**
 * ========================================================================
 * [TYPES] :: SHARED TYPES & ZOD SCHEMAS
 * ========================================================================
 * DESC:   Esquemas Zod para validación de proyectos.
 *         Se usan para validar datos extraídos por la IA.
 * ========================================================================
 */
import { z } from 'zod';

export const LocalizedText = z.object({
  en: z.string(),
  es: z.string(),
});

export type LocalizedText = z.infer<typeof LocalizedText>;

export const ProjectSchema = z.object({
  id: z.string().describe('Unique identifier from repository slug'),
  title: z.string().describe('Project title'),
  tagline: LocalizedText.describe('Short tagline (2-3 words)'),
  description: LocalizedText.describe('Full description (150-200 chars)'),
  vNote: LocalizedText.nullable().describe('Vandal Note section from README {en, es}'),
  projectColor: z
    .string()
    .nullable()
    .describe('Accent color from README metadata (hex, e.g. #ff5500)'),
  hoverTextCard: z.string().nullable().describe('Hover text for project card from metadata'),
  techStack: z.array(z.string()).describe('Array of technologies'),
  primaryTech: z.string().describe('Main technology (no versions, e.g. Vue not Vue 3)'),
  mainImgUrl: z.string().url().nullable().describe('Main image URL'),
  imagesUrl: z.array(z.string().url()).describe('Additional images URL array'),
  repoUrl: z.string().url().describe('GitHub repository URL'),
  liveUrl: z.string().url().nullable().describe('Live demo URL'),
  year: z.number().int().min(2000).max(2100).describe('Publication year'),
  postUrl: z.string().url().nullable().describe('Optional post/article URL'),
  blogUrl: z.string().url().nullable().describe('Optional blog URL'),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectListItemSchema = ProjectSchema.omit({
  imagesUrl: true,
  description: true,
});

export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;
