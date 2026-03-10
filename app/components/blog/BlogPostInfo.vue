<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST INFO
 * =====================================================================
 * DESC:   Sidebar de metadata. Estética: vertical strip minimalista
 *         con la categoría como elemento de color primario.
 *         Título sticky con GSAP al hacer scroll.
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
          if (sidebarTitleRef.value) gsap.set(sidebarTitleRef.value, { display: 'none' });
        },
      });
    }
  },
);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const categoryColor = computed(() => CATEGORY_COLORS[props.post.category]);

async function copyLink() {
  if (import.meta.client) {
    await navigator.clipboard.writeText(window.location.href);
  }
}
</script>

<template>
  <div class="blog-post-info sticky top-32">
    <!-- Back link -->
    <div class="info-section-anim mb-10">
      <RandomDoodleHover :stroke-width="3">
        <NuxtLink to="/blog" class="nav-link inline-flex items-center gap-2">
          <span>←</span>
          <span>Back</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Sidebar title (scroll reveal) -->
    <div
      ref="sidebarTitleRef"
      class="overflow-hidden mb-8"
      style="display: none; height: 0; opacity: 0"
    >
      <p class="text-xl font-bold leading-snug tracking-tight">
        {{ post.title }}
      </p>
      <div class="mt-1 h-px bg-foreground/8" />
    </div>

    <!-- Metadata -->
    <div class="flex flex-col">
      <!-- Category — el elemento de color del sidebar -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">Category</p>
        <div class="flex items-center gap-2">
          <!-- Dot en color de categoría -->
          <span
            class="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            :style="{ backgroundColor: categoryColor }"
          />
          <span
            class="text-xs font-mono uppercase tracking-[0.15em] font-bold"
            :style="{ color: categoryColor }"
          >
            {{ CATEGORY_LABELS[post.category] }}
          </span>
        </div>
      </div>

      <!-- Published -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">Published</p>
        <p class="text-xs font-mono opacity-60">{{ formatDate(post.date) }}</p>
      </div>

      <!-- Read time -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">Read time</p>
        <p class="text-xs font-mono opacity-60">
          <span class="font-bold text-sm opacity-100">{{ post.time_to_read }}</span>
          <span class="opacity-40"> min</span>
        </p>
      </div>

      <!-- Topics -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-3">Topics</p>
        <div class="flex flex-col gap-1.5">
          <span
            v-for="topic in post.topics"
            :key="topic"
            class="text-[0.6rem] font-mono uppercase tracking-[0.12em] opacity-40"
          >
            {{ topic }}
          </span>
        </div>
      </div>

      <!-- Share -->
      <div class="info-section-anim pt-4">
        <button class="group flex items-center gap-2 cursor-pointer" @click="copyLink">
          <span
            class="text-[0.6rem] font-mono uppercase tracking-[0.2em] opacity-25 group-hover:opacity-70 transition-opacity duration-200"
          >
            Copy link
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
