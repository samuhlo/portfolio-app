/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG SEO
 * ========================================================================
 * DESC:   Seo metadata + json-ld for blog post pages.
 *         Handles og, twitter card, article meta and schema.org.
 *         Centralizes all seo logic in one place — pages only consume computed values.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { useI18n } from '#imports';
import { SITE } from '~/config/site';
import type { BlogPost, BlogLocale } from '~/types/blog';

const OG_LOCALE_BY_BLOG_LOCALE: Record<BlogLocale, string> = {
  es: 'es_ES',
  en: 'en_US',
  gl: 'gl_ES',
};

const DEFAULT_OG_IMAGE_URL = `${SITE.url}${SITE.defaultOgImage}`;

const DEFAULT_COPY: Record<BlogLocale, { title: string; description: string }> = {
  es: {
    title: 'Samuel López _ Blog',
    description:
      'Notas, aprendizajes y breakdowns sobre frontend, diseño y decisiones reales de producto.',
  },
  en: {
    title: 'Samuel López _ Blog',
    description:
      'Notes, learnings, and breakdowns about frontend, design, and real product decisions.',
  },
  gl: {
    title: 'Samuel López _ Blog',
    description:
      'Notas, aprendizaxes e breakdowns sobre frontend, deseño e decisións reais de produto.',
  },
};

export function useBlogSeo(params: { post?: Ref<BlogPost | null> }) {
  const { locale } = useI18n();

  const post = computed(() => params.post?.value ?? null);

  const seoTitle = computed(() => {
    if (post.value) return `${SITE.author} _ ${post.value.title}`;
    return DEFAULT_COPY[(locale.value as BlogLocale) ?? 'es'].title;
  });

  const seoDescription = computed(() => {
    if (post.value) return post.value.description;
    return DEFAULT_COPY[(locale.value as BlogLocale) ?? 'es'].description;
  });

  const ogLocale = computed(() => OG_LOCALE_BY_BLOG_LOCALE[(locale.value as BlogLocale) ?? 'es']);

  const ogImageUrl = computed(() => {
    if (post.value?.image) {
      return `${SITE.url}${post.value.image}`;
    }
    return DEFAULT_OG_IMAGE_URL;
  });

  const ogImageAlt = computed(() =>
    post.value?.image ? post.value.title : SITE.defaultOgImageAlt,
  );

  useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'article',
    ogSiteName: SITE.name,
    ogLocale,
    ogImage: ogImageUrl,
    ogImageSecureUrl: ogImageUrl,
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: ogImageAlt,
    twitterCard: 'summary_large_image',
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
    twitterImage: ogImageUrl,
    twitterImageAlt: ogImageAlt,
    articlePublishedTime: () => post.value?.date,
    articleSection: () => post.value?.category,
    articleTag: () => post.value?.topics,
  });

  if (post.value) {
    useSchemaOrg([
      defineArticle({
        headline: seoTitle,
        description: seoDescription,
        datePublished: () => post.value?.date,
        dateModified: () => post.value?.date,
        image: ogImageUrl,
        author: { '@type': 'Person', name: SITE.author, url: SITE.url },
      }),
    ]);
  }

  return {
    seoTitle,
    seoDescription,
    ogLocale,
    ogImageUrl,
    ogImageAlt,
  };
}
