<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG INDEX
 * =====================================================================
 * DESC:   Página principal del blog con componentes separados.
 *         BlogHeader + BlogIndex (categorías) + BlogList (posts).
 *         Posts fetched desde Nuxt Content via queryCollection.
 *         Timeline GSAP: categorías stagger → posts stagger + dividers.
 *         Toda la animación del header vive en BlogHeader.vue.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { type BlogCategory, type BlogPost } from '~/types/blog';
import BlogHeader from '~/components/blog/BlogHeader.vue';
import BlogIndex from '~/components/blog/BlogIndex.vue';
import BlogList from '~/components/blog/BlogList.vue';

definePageMeta({
  layout: 'blog',
  middleware(to, from) {
    // [NOTE] Animar header solo en primera carga o desde fuera del blog.
    // Si vienes de un post (/blog/xxx), no reanimar.
    const isFromBlogPost =
      from.name !== undefined && from.path.startsWith('/blog/') && from.path !== '/blog/';
    to.meta.skipHeaderAnimation = isFromBlogPost;
  },
});

// =============================================================================
// █ DATA: fetch posts publicados desde Nuxt Content, ordenados por fecha desc
// =============================================================================
const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog').where('published', '=', true).order('date', 'DESC').all(),
);

const typedPosts = computed<BlogPost[]>(() => (posts.value as BlogPost[]) ?? []);

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
        duration: 0.35,
        stagger: 0.05,
      },
      '+=0.3',
    );

    // =================================================================
    // POSTS: stagger desde abajo
    // =================================================================
    tl.from(
      '.post-item-anim',
      {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
      },
      '-=0.15',
    );

    // =================================================================
    // DIVIDERS: scaleX desde la izquierda, sync con posts
    // =================================================================
    tl.from(
      '.blog-divider',
      {
        scaleX: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.inOut',
      },
      '<0.03',
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
        <BlogIndex
          :selected-category="selectedCategory"
          :posts="typedPosts"
          @select="handleCategorySelect"
        />
      </div>

      <!-- Right: Posts List -->
      <div class="md:col-span-9 md:pl-8">
        <BlogList :selected-category="selectedCategory" :posts="typedPosts" />
      </div>
    </div>
  </div>
</template>
