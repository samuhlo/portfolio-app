<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST BODY
 * =====================================================================
 * DESC:   Cuerpo del post. El header (título, categoría, descripción)
 *         se renderiza manualmente; el contenido markdown vía <ContentRenderer>.
 *         Exposé refs para animaciones GSAP desde la página padre.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref } from 'vue';
import type { BlogPost } from '~/types/blog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '~/types/blog';

const props = defineProps<{
  post: BlogPost;
}>();

// Refs expuestos para targeting GSAP desde [slug].vue
const postHeaderRef = ref<HTMLElement | null>(null);
const postContentRef = ref<HTMLElement | null>(null);

defineExpose({ postHeaderRef, postContentRef });
</script>

<template>
  <div class="blog-post-body">
    <!-- Post Header -->
    <header ref="postHeaderRef" class="post-body-header mb-12 md:mb-16">
      <!-- Eyebrow: label de categoría con color -->
      <div class="post-body-eyebrow flex items-center gap-3 mb-5">
        <span
          class="text-[0.6rem] font-mono uppercase tracking-[0.25em] font-bold"
          :style="{ color: CATEGORY_COLORS[post.category] }"
        >
          {{ CATEGORY_LABELS[post.category] }}
        </span>
        <span class="text-[0.6rem] font-mono tracking-widest opacity-20">·</span>
        <span class="text-[0.6rem] font-mono uppercase tracking-[0.25em] opacity-30">
          {{ post.time_to_read }} min read
        </span>
      </div>

      <!-- [NOTE]: overflow-hidden en el wrapper para el clip-path reveal del título -->
      <div class="overflow-hidden">
        <h1
          class="post-body-title text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6"
        >
          {{ post.title }}
        </h1>
      </div>

      <!-- Description -->
      <p class="post-body-excerpt text-lg md:text-xl opacity-60 leading-relaxed">
        {{ post.description }}
      </p>

      <!-- Línea separadora: animada con scaleX desde [slug].vue -->
      <div class="post-body-line mt-8 h-px bg-foreground/10 origin-left" />
    </header>

    <!-- Post Content — Nuxt Content renderiza el markdown del body -->
    <div ref="postContentRef" class="post-content prose">
      <ContentRenderer :value="(post as any)" />
    </div>

    <!-- Post Footer -->
    <footer class="mt-16 pt-8 border-t border-foreground/10">
      <!-- Espacio para author info, related posts, etc. -->
    </footer>
  </div>
</template>
