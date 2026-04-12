<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG INDEX
 * =====================================================================
 * DESC:   Página principal del blog con componentes separados.
 *         BlogHeader + BlogIndex (categorías) + BlogList (posts).
 *         Datos desde useBlogPosts y useBlogCategories.
 *         Timeline GSAP: categorías stagger → posts stagger + dividers.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from '#imports';
import { SITE } from '~/config/site';
import { useGSAP } from '~/composables/useGSAP';
import { useBlogPosts } from '~/composables/useBlogPosts';
import { useBlogCategories } from '~/composables/useBlogCategories';
import { useBlogNavigationContext } from '~/composables/useBlogNavigationContext';
import { type BlogCategory, type BlogLocale } from '~/types/blog';
import BlogHeader from '~/components/blog/BlogHeader.vue';
import BlogIndex from '~/components/blog/BlogIndex.vue';
import BlogList from '~/components/blog/BlogList.vue';
import PageLoader from '~/components/layout/PageLoader.vue';

definePageMeta({
  key: 'blog-index',
  layout: 'blog',
  middleware(to, from) {
    // [NOTE] Animar header solo en primera carga o desde fuera del blog.
    const isFromBlogPost = /^\/(?:[a-z]{2}\/)?blog\/[^/]+\/?$/.test(from.path);
    to.meta.skipHeaderAnimation = isFromBlogPost;
  },
});

const isLoading = ref(true);
const { consumeLocaleSwitch } = useBlogNavigationContext();
const isLocaleSwitchNavigation = ref(consumeLocaleSwitch());
const { locale } = useI18n();

const BLOG_SEO_COPY: Record<BlogLocale, { title: string; description: string }> = {
  es: {
    title: `${SITE.author} _ Blog`,
    description:
      'Notas, aprendizajes y breakdowns sobre frontend, diseño y decisiones reales de producto.',
  },
  en: {
    title: `${SITE.author} _ Blog`,
    description:
      'Notes, learnings, and breakdowns about frontend, design, and real product decisions.',
  },
  gl: {
    title: `${SITE.author} _ Blog`,
    description:
      'Notas, aprendizaxes e breakdowns sobre frontend, deseño e decisións reais de produto.',
  },
};

const OG_LOCALE_BY_BLOG_LOCALE: Record<BlogLocale, string> = {
  es: 'es_ES',
  en: 'en_US',
  gl: 'gl_ES',
};

const seoCopy = computed(() => BLOG_SEO_COPY[(locale.value as BlogLocale) ?? 'es']);
const ogLocale = computed(() => OG_LOCALE_BY_BLOG_LOCALE[(locale.value as BlogLocale) ?? 'es']);
const defaultOgImageUrl = `${SITE.url}${SITE.defaultOgImage}`;

// [NOTE] Si venimos de un locale switch, ocultar loader de inmediato.
// OBJETIVE -> Evitar blink de overlay entre idiomas.
if (isLocaleSwitchNavigation.value) {
  isLoading.value = false;
}

const { posts, status, filterByCategory } = useBlogPosts();
const { categories } = useBlogCategories();

const { gsap, initGSAP } = useGSAP();
const containerRef = ref<HTMLElement | null>(null);

const selectedCategory = ref<BlogCategory | 'all'>('all');

const filteredPosts = computed(() => filterByCategory(selectedCategory.value));

function handleCategorySelect(category: BlogCategory | 'all') {
  selectedCategory.value = category;
}

useSeoMeta({
  title: computed(() => seoCopy.value.title),
  description: computed(() => seoCopy.value.description),
  ogTitle: computed(() => seoCopy.value.title),
  ogDescription: computed(() => seoCopy.value.description),
  ogType: 'website',
  ogSiteName: SITE.name,
  ogLocale: computed(() => ogLocale.value),
  ogImage: defaultOgImageUrl,
  ogImageSecureUrl: defaultOgImageUrl,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: SITE.defaultOgImageAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: computed(() => seoCopy.value.title),
  twitterDescription: computed(() => seoCopy.value.description),
  twitterImage: defaultOgImageUrl,
  twitterImageAlt: SITE.defaultOgImageAlt,
});

function runAnimation() {
  initGSAP(() => {
    // Al iniciar GSAP, ya podemos ocultar el loader para que no haya FOUC
    isLoading.value = false;

    if (!containerRef.value) return;

    const categoryEls = containerRef.value.querySelectorAll('.category-item-anim');
    const postEls = containerRef.value.querySelectorAll('.post-item-anim');
    const dividerEls = containerRef.value.querySelectorAll('.blog-divider');

    if (categoryEls.length === 0 && postEls.length === 0) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (categoryEls.length > 0) {
      tl.from(categoryEls, { x: -20, opacity: 0, duration: 0.35, stagger: 0.05 }, '+=0.3');
    }

    if (postEls.length > 0) {
      tl.from(postEls, { y: 20, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.15');
    }

    if (dividerEls.length > 0) {
      tl.from(
        dividerEls,
        { scaleX: 0, duration: 0.35, stagger: 0.06, ease: 'power2.inOut' },
        '<0.03',
      );
    }
  }, containerRef.value);
}

function runSoftLocaleSwitchAnimation() {
  initGSAP(() => {
    isLoading.value = false;

    if (!containerRef.value) return;

    // [NOTE] Solo animamos lista de posts y divisores.
    // Las categorías se mantienen estáticas en locale switch.
    const listEl = containerRef.value.querySelector('.blog-list');
    if (!listEl) return;

    const postEls = containerRef.value.querySelectorAll('.post-item-anim');
    const dividerEls = containerRef.value.querySelectorAll('.blog-divider');

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(
      listEl,
      { opacity: 0.8, y: 14 },
      { opacity: 1, y: 0, duration: 0.62, ease: 'power2.out', clearProps: 'transform' },
    );

    if (postEls.length > 0) {
      tl.fromTo(
        postEls,
        { opacity: 0.6, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.78,
          stagger: 0.065,
          ease: 'power2.out',
          clearProps: 'transform',
        },
        '<0.02',
      );
    }

    if (dividerEls.length > 0) {
      tl.fromTo(
        dividerEls,
        { opacity: 0.58, scaleX: 0.93 },
        { opacity: 1, scaleX: 1, duration: 0.7, stagger: 0.055, ease: 'power2.out' },
        '<0.04',
      );
    }
  }, containerRef.value);
}

onMounted(() => {
  // [NOTE] Primera entrada del componente.
  // Si status ya está resuelto, animar en el próximo frame de Vue.
  if (status.value === 'success') {
    nextTick(() => {
      if (isLocaleSwitchNavigation.value) {
        runSoftLocaleSwitchAnimation();
        return;
      }
      runAnimation();
    });
  } else if (status.value === 'error') {
    isLoading.value = false;
  } else {
    const unwatch = watch(status, (newStatus) => {
      if (newStatus === 'success') {
        nextTick(() => {
          if (isLocaleSwitchNavigation.value) {
            runSoftLocaleSwitchAnimation();
            return;
          }
          runAnimation();
        });
        unwatch();
      } else if (newStatus === 'error') {
        isLoading.value = false;
        unwatch();
      }
    });
  }
});

watch(locale, async (newLocale, oldLocale) => {
  // [NOTE] Reacción local al cambio de locale SIN remount de página.
  // key: 'blog-index' mantiene la instancia viva.
  if (!oldLocale || newLocale === oldLocale) return;

  isLocaleSwitchNavigation.value = true;
  isLoading.value = false;

  if (status.value === 'success') {
    await nextTick();
    runSoftLocaleSwitchAnimation();
    return;
  }

  const stop = watch(status, async (newStatus) => {
    if (newStatus === 'success') {
      await nextTick();
      runSoftLocaleSwitchAnimation();
      stop();
    } else if (newStatus === 'error') {
      stop();
    }
  });
});
</script>

<template>
  <div ref="containerRef" class="blog-page pb-24 md:pb-32">
    <PageLoader :visible="isLoading" />
    <BlogHeader :locale-switch="isLocaleSwitchNavigation" />

    <div class="blog-content grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
      <div class="md:col-span-3">
        <BlogIndex
          :selected-category="selectedCategory"
          :categories="categories"
          @select="handleCategorySelect"
        />
      </div>

      <div class="md:col-span-9 md:pl-8">
        <BlogList :selected-category="selectedCategory" :posts="filteredPosts" />
      </div>
    </div>
  </div>
</template>
