<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG INDEX
 * =====================================================================
 * DESC:   Página principal del blog con componentes separados.
 *         BlogHeader + BlogIndex (categorías) + BlogList (posts).
 *         Timeline GSAP: categorías stagger → posts stagger + dividers.
 *         Toda la animación del header vive en BlogHeader.vue.
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
    if (!containerRef.value) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // =================================================================
    // CATEGORÍAS: stagger desde la izquierda
    // =================================================================
    tl.from(
      '.category-item-anim',
      {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
      },
      '+=0.6',
    );

    // =================================================================
    // POSTS: stagger desde abajo
    // =================================================================
    tl.from(
      '.post-item-anim',
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      },
      '-=0.2',
    );

    // =================================================================
    // DIVIDERS: scaleX desde la izquierda, sync con posts
    // [NOTE]: Se overlap con el stagger de posts para sensación fluida
    // =================================================================
    tl.from(
      '.blog-divider',
      {
        scaleX: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      '<0.05',
    );
  }, containerRef.value);
});
</script>

<template>
  <div ref="containerRef" class="blog-page pb-24 md:pb-32">
    <!-- Header -->
    <BlogHeader />

    <!-- Main Content -->
    <div class="blog-content grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
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
