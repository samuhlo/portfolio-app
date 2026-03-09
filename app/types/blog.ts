/**
 * █ [TYPES] :: BLOG POSTS
 * =====================================================================
 * DESC:   TypeScript interfaces para el blog.
 * =====================================================================
 */

export type BlogCategory = 'weekly-log' | 'find' | 'breakdown' | 'outside';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  publishedAt: string;
  readTime: number; // en minutos
  featured?: boolean;
}

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  'weekly-log': 'weekly_log',
  find: 'find',
  breakdown: 'breakdown',
  outside: 'outside',
};

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  'weekly-log': '#ff6b6b',
  find: '#4ecdc4',
  breakdown: '#ffca40',
  outside: '#b8e986',
};
