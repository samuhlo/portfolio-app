<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST INFO
 * =====================================================================
 * DESC:   Sidebar con metadata del post: categoría, fecha,
 *         tiempo de lectura, topics, etc.
 *         Clases .info-section-anim para stagger de entrada GSAP.
 *         Título sticky que aparece al hacer scroll (showTitle prop).
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, watch } from 'vue';
import type { BlogPost, BlogCategory } from '~/types/blog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import RandomDoodleHover from '~/components/ui/RandomDoodleHover.vue';

const props = defineProps<{
  post: BlogPost;
  showTitle?: boolean;
}>();

const { gsap } = useGSAP();
const sidebarTitleRef = ref<HTMLElement | null>(null);

// =============================================================================
// █ SIDEBAR TITLE: aparece/desaparece al hacer scroll sobre el título del post
// =============================================================================
watch(
  () => props.showTitle,
  (show) => {
    if (!sidebarTitleRef.value) return;

    if (show) {
      gsap.set(sidebarTitleRef.value, { display: 'block', height: 'auto', opacity: 1 });
      const fullHeight = sidebarTitleRef.value.offsetHeight;
      gsap.set(sidebarTitleRef.value, { height: 0, opacity: 0 });

      gsap.to(sidebarTitleRef.value, {
        height: fullHeight,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      gsap.to(sidebarTitleRef.value, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (sidebarTitleRef.value) {
            gsap.set(sidebarTitleRef.value, { display: 'none' });
          }
        },
      });
    }
  },
);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCategoryColor(category: BlogCategory): string {
  return CATEGORY_COLORS[category];
}

async function copyLink() {
  if (import.meta.client) {
    await navigator.clipboard.writeText(window.location.href);
  }
}
</script>

<template>
  <div class="blog-post-info sticky top-32">
    <!-- Back Link -->
    <div class="info-section-anim mb-10">
      <RandomDoodleHover>
        <NuxtLink to="/blog" class="nav-link inline-flex items-center gap-2">
          <span>←</span>
          <span>Back to blog</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Sidebar Title: aparece al hacer scroll -->
    <div
      ref="sidebarTitleRef"
      class="overflow-hidden mb-6"
      style="display: none; height: 0; opacity: 0"
    >
      <h2 class="text-xl font-bold tracking-tight leading-tight">
        {{ post.title }}
      </h2>
      <div class="mt-3 h-px bg-foreground/10" />
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
          {{ formatDate(post.date) }}
        </span>
      </div>

      <!-- Read Time -->
      <div class="info-section-anim info-section">
        <h3 class="meta-label">Read Time</h3>
        <div class="flex items-baseline gap-1.5">
          <span class="font-bold text-base">{{ post.time_to_read }}</span>
          <span class="meta-value text-xs">min</span>
        </div>
      </div>

      <!-- Topics -->
      <div class="info-section-anim info-section">
        <h3 class="meta-label">Topics</h3>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="topic in post.topics"
            :key="topic"
            class="tag-bordered"
            :style="{ borderColor: getCategoryColor(post.category) + '40' }"
          >
            {{ topic }}
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
