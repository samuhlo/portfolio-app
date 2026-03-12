/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG POST
 * ========================================================================
 * DESC:   Post individual por slug con navegación prev/next.
 *         Reutiliza la key 'blog-posts' de useBlogPosts para el cache
 *         compartido — sin doble fetch al combinar con el listado.
 *         Lanza 404 si el post no existe.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { createError } from '#app';
import { type BlogPost } from '~/types/blog';
import { useBlogPosts } from '~/composables/useBlogPosts';

export function useBlogPost(slug: string) {
  const { data: post, status } = useAsyncData(`blog-post-${slug}`, async () => {
    const result = await queryCollection('blog').path(`/blog/${slug}`).first();
    if (!result) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' });
    }
    return result as BlogPost;
  });

  // Reusar el cache de useBlogPosts — misma key, sin doble fetch
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
