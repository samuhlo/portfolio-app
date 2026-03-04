<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST INFO
 * =====================================================================
 * DESC:   Sidebar con metadata del post: categoría, fecha,
 *         tiempo de lectura, tags/tecnologías, etc.
 * STATUS: STABLE
 * =====================================================================
 */

import { computed } from 'vue';
import type { BlogPost, BlogCategory } from '~/types/blog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '~/types/blog';
import RandomDoodleHover from '~/components/ui/RandomDoodleHover.vue';

const props = defineProps<{
  post: BlogPost;
}>();

// Formatear fecha completa
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Obtener color de categoría
function getCategoryColor(category: BlogCategory): string {
  return CATEGORY_COLORS[category];
}

// Extraer tecnologías/tags del contenido del post (simulado)
const extractedTags = computed(() => {
  const content = props.post.content.toLowerCase();
  const techKeywords = [
    { name: 'Vue', pattern: /vue|nuxt|vite/g },
    { name: 'TypeScript', pattern: /typescript|ts\b/g },
    { name: 'GSAP', pattern: /gsap|animation/g },
    { name: 'Design', pattern: /design|ui|ux/g },
    { name: 'CSS', pattern: /css|tailwind|style/g },
    { name: 'JavaScript', pattern: /javascript|js\b/g },
    { name: 'Architecture', pattern: /architecture|system|pattern/g },
  ];

  const foundTags = techKeywords
    .filter((tech) => tech.pattern.test(content))
    .map((tech) => tech.name);

  return foundTags.length > 0 ? foundTags : ['General'];
});
</script>

<template>
  <div class="blog-post-info sticky top-32">
    <!-- Back Link -->
    <div class="mb-10">
      <RandomDoodleHover>
        <NuxtLink to="/blog" class="nav-link inline-flex items-center gap-2">
          <span>←</span>
          <span>Back to blog</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Metadata Sections -->
    <div class="flex flex-col gap-8">
      <!-- Category -->
      <div class="info-section">
        <h3 class="meta-label">Category</h3>
        <span class="font-bold" :style="{ color: getCategoryColor(post.category) }">
          {{ CATEGORY_LABELS[post.category] }}
        </span>
      </div>

      <!-- Published -->
      <div class="info-section">
        <h3 class="meta-label">Published</h3>
        <span class="meta-value">
          {{ formatDate(post.postedAt) }}
        </span>
      </div>

      <!-- Read Time -->
      <div class="info-section">
        <h3 class="meta-label">Read Time</h3>
        <span class="meta-value"> {{ post.readTime }} min </span>
      </div>

      <!-- Tags / Tech -->
      <div class="info-section">
        <h3 class="meta-label">Topics</h3>
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="tag in extractedTags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Share (placeholder) -->
      <div class="info-section pt-4 border-t border-foreground/10">
        <h3 class="meta-label mb-3">Share</h3>
        <div class="flex gap-4">
          <button class="nav-link">Copy link</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
