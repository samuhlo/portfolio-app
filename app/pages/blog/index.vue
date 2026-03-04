<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG INDEX
 * =====================================================================
 * DESC:   Página principal del blog con componentes separados.
 *         BlogHeader + BlogIndex (categorías) + BlogList (posts).
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { type BlogCategory } from '~/types/blog';
import BlogHeader from '~/components/blog/BlogHeader.vue';
import BlogIndex from '~/components/blog/BlogIndex.vue';
import BlogList from '~/components/blog/BlogList.vue';

definePageMeta({
  layout: 'blog',
});

const { gsap, initGSAP } = useGSAP();

const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

// Estado de categoría seleccionada
const selectedCategory = ref<BlogCategory | 'all'>('all');

function handleCategorySelect(category: BlogCategory | 'all') {
  selectedCategory.value = category;
}

// SEO
const title = 'Blog';
const description = 'Thoughts, updates, and design explorations from Samuel López.';

useSeoMeta({
  title: `Samuel López _ ${title}`,
  description,
  ogTitle: `Samuel López _ ${title}`,
  ogDescription: description,
  ogType: 'website',
});

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value || !contentRef.value) return;

    // Header animation
    gsap.from('.blog-header', {
      y: 80,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    });

    // Content animation
    gsap.from('.blog-content > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.3,
    });
  }, contentRef.value);
});
</script>

<template>
  <div ref="containerRef" class="blog-page pb-24 md:pb-32">
    <!-- Header -->
    <BlogHeader />

    <!-- Main Content -->
    <div ref="contentRef" class="blog-content grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
      <!-- Left: Categories Index -->
      <div class="md:col-span-3">
        <BlogIndex :selected-category="selectedCategory" @select="handleCategorySelect" />
      </div>

      <!-- Right: Posts List -->
      <div class="md:col-span-9 md:pl-8">
        <BlogList :selected-category="selectedCategory" />
      </div>
    </div>
  </div>
</template>
