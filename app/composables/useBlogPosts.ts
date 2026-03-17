/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG POSTS
 * ========================================================================
 * DESC:   Lista de posts publicados desde Nuxt Content, ordenados por
 *         fecha descendente. Filtrable por categoría en el cliente.
 *         La clave incluye el locale activo — refetch automático al
 *         cambiar idioma. Solo muestra posts del locale actual (sin fallback).
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { useI18n } from '#imports';
import { type BlogPost, type BlogCategory } from '~/types/blog';

let clientRetryAttempted = false;

export function useBlogPosts() {
  const { locale } = useI18n();

  const { data, status, refresh } = useAsyncData(
    () => `blog-posts-${locale.value}`,
    () =>
      queryCollection('blog')
        .where('published', '=', true)
        .where('lang', '=', locale.value)
        .order('date', 'DESC')
        .all(),
    { watch: [locale] },
  );

  // [FIX] En entornos serverless, queryCollection puede devolver null en SSR.
  // Si el cliente monta sin datos, reintentamos client-side donde la query sí funciona.
  // Solo un intento para evitar bucles infinitos si la query también falla en el cliente.
  if (
    import.meta.client &&
    data.value == null &&
    status.value !== 'pending' &&
    !clientRetryAttempted
  ) {
    clientRetryAttempted = true;
    void refresh();
  }

  const posts = computed<BlogPost[]>(() => (data.value as BlogPost[]) ?? []);

  function filterByCategory(category: BlogCategory | 'all'): BlogPost[] {
    if (category === 'all') return posts.value;
    return posts.value.filter((p) => p.category === category);
  }

  return { posts, status, filterByCategory };
}
