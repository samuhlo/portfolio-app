/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG POSTS
 * ========================================================================
 * DESC:   Lista de posts publicados desde Nuxt Content, ordenados por
 *         fecha descendente. Filtrable por categoría en el cliente.
 *         La key 'blog-posts' es compartida — otras llamadas (useBlogPost,
 *         useBlogCategories) reusan el mismo cache sin doble fetch.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { type BlogPost, type BlogCategory } from '~/types/blog';

export function useBlogPosts() {
  const { data, status, refresh } = useAsyncData('blog-posts', () =>
    queryCollection('blog').where('published', '=', true).order('date', 'DESC').all(),
  );

  // [FIX] En entornos serverless, queryCollection puede devolver null en SSR.
  // Si el cliente monta sin datos, reintentamos client-side donde la query sí funciona.
  if (import.meta.client && (!data.value || (data.value as BlogPost[]).length === 0)) {
    refresh();
  }

  const posts = computed<BlogPost[]>(() => (data.value as BlogPost[]) ?? []);

  function filterByCategory(category: BlogCategory | 'all'): BlogPost[] {
    if (category === 'all') return posts.value;
    return posts.value.filter((p) => p.category === category);
  }

  return { posts, status, filterByCategory };
}
