/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG POST
 * ========================================================================
 * DESC:   Post individual por slug con navegación prev/next.
 *         Filtra por locale activo — sin fallback a otro idioma.
 *         Reutiliza la key dinámica 'blog-posts-{locale}' de useBlogPosts
 *         para el cache compartido — sin doble fetch al combinar con el
 *         listado. Lanza 404 si el post no existe en el locale actual.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { createError } from '#app';
import { useI18n } from '#imports';
import { type BlogPost } from '~/types/blog';
import { useBlogPosts } from '~/composables/useBlogPosts';

export function useBlogPost(slug: string) {
  const { locale } = useI18n();

  const { data: post, status, refresh } = useAsyncData(
    `blog-post-${locale.value}-${slug}`,
    async () => {
      const result = await queryCollection('blog')
        .where('slug', '=', slug)
        .where('lang', '=', locale.value)
        .first();
      if (!result) {
        throw createError({ statusCode: 404, statusMessage: 'Post not found' });
      }
      return result as BlogPost;
    },
  );

  // [FIX] En entornos serverless, queryCollection puede fallar server-side (SSR).
  // Si el cliente monta con post null, reintentamos client-side donde la query sí funciona.
  if (import.meta.client && !post.value) {
    refresh();
  }

  // Reusar el cache de useBlogPosts — misma key dinámica, sin doble fetch
  const { posts: allPosts } = useBlogPosts();

  const currentIndex = computed(() => allPosts.value.findIndex((p) => p.slug === slug));

  // "next" = más reciente (índice inferior en array ordenado desc)
  const nextPost = computed<BlogPost | null>(() =>
    currentIndex.value > 0 ? (allPosts.value[currentIndex.value - 1] ?? null) : null,
  );

  // "prev" = más antiguo (índice superior en array ordenado desc)
  const prevPost = computed<BlogPost | null>(() =>
    currentIndex.value < allPosts.value.length - 1
      ? (allPosts.value[currentIndex.value + 1] ?? null)
      : null,
  );

  return { post, prevPost, nextPost, status };
}
