<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST INFO
 * =====================================================================
 * DESC:   Sidebar con metadata del post: categoría, fecha,
 *         tiempo de lectura, tags/tecnologías, etc.
 *         Clases .info-section-anim para stagger de entrada GSAP.
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

// Copy link handler
async function copyLink() {
  if (import.meta.client) {
    await navigator.clipboard.writeText(window.location.href);
  }
}
</script>

<template>
  <div class="blog-post-info sticky top-32">
    <!-- Back Link — info-section-anim para stagger GSAP -->
    <div class="info-section-anim mb-10">
      <RandomDoodleHover>
        <NuxtLink to="/blog" class="nav-link inline-flex items-center gap-2">
          <span>←</span>
          <span>Back to blog</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Metadata Sections -->
    <div class="flex flex-col gap-6">
      <!-- Category -->
      <div class="info-section-anim info-section">
        <h3 class="meta-label">Category</h3>
        <span class="font-bold text-sm" :style="{ color: getCategoryColor(post.category) }">
          {{ CATEGORY_LABELS[post.category] }}
        </span>
      </div>

      <!-- Published -->
      <div class="info-section-anim info-section">
        <h3 class="meta-label">Published</h3>
        <span class="meta-value">
          {{ formatDate(post.publishedAt) }}
        </span>
      </div>

      <!-- Read Time -->
      <div class="info-section-anim info-section">
        <h3 class="meta-label">Read Time</h3>
        <div class="flex items-baseline gap-1.5">
          <span class="font-bold text-base">{{ post.readTime }}</span>
          <span class="meta-value text-xs">min</span>
        </div>
      </div>

      <!-- Tags / Tech -->
      <div class="info-section-anim info-section">
        <h3 class="meta-label">Topics</h3>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="tag in extractedTags"
            :key="tag"
            class="tag-bordered"
            :style="{ borderColor: getCategoryColor(post.category) + '40' }"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Share -->
      <div class="info-section-anim info-section pt-4 border-t border-foreground/8">
        <h3 class="meta-label mb-3">Share</h3>
        <button class="nav-link flex items-center gap-2 cursor-pointer" @click="copyLink">
          <span
            class="font-mono text-[0.6rem] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity duration-200"
          >
            Copy link
          </span>
        </button>
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
