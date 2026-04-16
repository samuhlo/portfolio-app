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

import { computed, toRef, type ComputedRef, type Ref } from 'vue';
import { createError } from '#app';
import { useI18n } from '#imports';
import { type BlogPost, type BlogPostTranslation } from '~/types/blog';
import { useBlogPosts } from '~/composables/useBlogPosts';

type UseBlogPostResult = {
  post: Ref<BlogPost | null>;
  prevPost: ComputedRef<BlogPost | null>;
  nextPost: ComputedRef<BlogPost | null>;
  status: Ref<'idle' | 'pending' | 'success' | 'error'>;
  translations: ComputedRef<BlogPostTranslation[]>;
};

export async function useBlogPost(slug: string): Promise<UseBlogPostResult> {
  const { locale } = useI18n();
  const slugRef = toRef(() => slug);

  const {
    data: post,
    status,
    error,
    refresh,
  } = await useAsyncData(
    () => `blog-post-${locale.value}-${slugRef.value}`,
    async () => {
      const result = await queryCollection('blog')
        .where('slug', '=', slug)
        .where('lang', '=', locale.value)
        .where('published', '=', true)
        .first();
      if (!result) {
        throw createError({ statusCode: 404, statusMessage: 'Post not found' });
      }
      return result as BlogPost;
    },
    { watch: [locale, slugRef] },
  );

  // [FIX] En entornos serverless, queryCollection puede fallar server-side (SSR).
  // Si el cliente monta con post null, reintentamos client-side donde la query sí funciona.
  if (import.meta.client && !post.value) {
    await refresh();
  }

  if (error.value) {
    const statusCode =
      (error.value as { statusCode?: number; status?: number }).statusCode ??
      (error.value as { status?: number }).status;

    if (statusCode === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' });
    }

    throw error.value;
  }

  if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' });
  }

  const translationKey = computed(() => post.value?.translationKey ?? '');

  const { data: translationItems, refresh: refreshTranslations } = await useAsyncData(
    () => `blog-post-translations-${locale.value}-${slugRef.value}`,
    async () => {
      if (!translationKey.value) {
        return [
          {
            lang: post.value!.lang,
            slug: post.value!.slug,
            title: post.value!.title,
          },
        ];
      }

      const results = await queryCollection('blog')
        .where('translationKey', '=', translationKey.value)
        .where('published', '=', true)
        .select('lang', 'slug', 'title')
        .all();

      if (!results.length) {
        return [
          {
            lang: post.value!.lang,
            slug: post.value!.slug,
            title: post.value!.title,
          },
        ];
      }

      return results as BlogPostTranslation[];
    },
    { watch: [locale, slugRef] },
  );

  if (import.meta.client && translationKey.value && translationItems.value == null) {
    void refreshTranslations();
  }

  const translations = computed<BlogPostTranslation[]>(() => {
    const items = (translationItems.value as BlogPostTranslation[] | null) ?? [];
    if (!post.value) return items;
    if (items.some((item) => item.lang === post.value!.lang)) return items;

    return [
      ...items,
      {
        lang: post.value.lang,
        slug: post.value.slug,
        title: post.value.title,
      },
    ];
  });

  // Reusar el cache de useBlogPosts — misma key dinámica, sin doble fetch
  const { posts: allPosts } = useBlogPosts();

  const currentIndex = computed(() => allPosts.value.findIndex((p) => p.slug === post.value?.slug));

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

  return { post: post as Ref<BlogPost | null>, prevPost, nextPost, status, translations };
}
