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
  const { data, status } = useAsyncData('blog-posts', () =>
    queryCollection('blog').where('published', '=', true).order('date', 'DESC').all(),
  );

  const posts = computed<BlogPost[]>(() => (data.value as BlogPost[]) ?? []);

  function filterByCategory(category: BlogCategory | 'all'): BlogPost[] {
    if (category === 'all') return posts.value;
    return posts.value.filter((p) => p.category === category);
  }

  return { posts, status, filterByCategory };
}
