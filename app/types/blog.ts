/**
 * █ [TYPES] :: BLOG POSTS
 * =====================================================================
 * DESC:   TypeScript interfaces para el blog.
 * =====================================================================
 */

export type BlogCategory = 'weekly-update' | 'design-article' | 'thoughts';

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
  'weekly-update': 'Weekly Update',
  'design-article': 'Design Article',
  thoughts: 'Thoughts',
};

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  'weekly-update': '#ff6b6b',
  'design-article': '#4ecdc4',
  thoughts: '#ffca40',
};
