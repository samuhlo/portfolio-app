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
import { SITE } from '~/config/site';
import { useI18n } from '#imports';
import { useGSAP } from '~/composables/useGSAP';
import { useBlogPosts } from '~/composables/useBlogPosts';
import { useBlogCategories } from '~/composables/useBlogCategories';
import { type BlogCategory } from '~/types/blog';
import BlogHeader from '~/components/blog/BlogHeader.vue';
import BlogIndex from '~/components/blog/BlogIndex.vue';
import BlogList from '~/components/blog/BlogList.vue';
import PageLoader from '~/components/layout/PageLoader.vue';

definePageMeta({
  layout: 'blog',
  middleware(to, from) {
    // [NOTE] Animar header solo en primera carga o desde fuera del blog.
    const isFromBlogPost =
      from.name !== undefined && from.path.startsWith('/blog/') && from.path !== '/blog/';
    to.meta.skipHeaderAnimation = isFromBlogPost;
  },
});

const { locale } = useI18n();

// Override global lang="es" with active locale
useHead({ htmlAttrs: { lang: locale } });

const isLoading = ref(true);

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
  title: `${SITE.author} _ Blog`,
  description: `Thoughts, updates, and design explorations from ${SITE.author}.`,
  ogTitle: `${SITE.author} _ Blog`,
  ogDescription: `Thoughts, updates, and design explorations from ${SITE.author}.`,
  ogType: 'website',
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

onMounted(() => {
  if (status.value === 'success') {
    nextTick(() => runAnimation());
  } else if (status.value === 'error') {
    isLoading.value = false;
  } else {
    const unwatch = watch(status, (newStatus) => {
      if (newStatus === 'success') {
        nextTick(() => runAnimation());
        unwatch();
      } else if (newStatus === 'error') {
        isLoading.value = false;
        unwatch();
      }
    });
  }
});
</script>

<template>
  <div ref="containerRef" class="blog-page pb-24 md:pb-32">
    <PageLoader :visible="isLoading" />
    <BlogHeader />

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
