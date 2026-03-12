/**
 * █ [TYPES] :: BLOG POSTS
 * =====================================================================
 * DESC:   TypeScript types para el blog con Nuxt Content v3.
 *         Los campos coinciden con el frontmatter definido en content.config.ts.
 * =====================================================================
 */

export type BlogCategory = 'weekly_log' | 'find' | 'breakdown' | 'outside';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: BlogCategory;
  topics: string[];
  time_to_read: number;
  published: boolean;
  image?: string;
  // Campos internos de Nuxt Content
  _path?: string;
  body?: unknown;
};

// Ítem de TOC — headings detectados en el contenido del post
export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

// Ítem de categoría con conteo — usado por useBlogCategories y BlogIndex
export type CategoryItem = {
  id: BlogCategory | 'all';
  label: string;
  count: number;
};

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  weekly_log: 'weekly_log',
  find: 'find',
  breakdown: 'breakdown',
  outside: 'outside',
};

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  weekly_log: '#FF8C42', // naranja — rutina cálida, energía constante
  find: '#FFCA40', // accent del proyecto ( lo que mas me gusta, descubir cosas usara este color)
  breakdown: '#A855F7', // púrpura — profundidad, análisis, un toque oscuro
  outside: '#4ADE80', // verde vivo — naturaleza, movimiento, vida fuera
};
