<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST BODY
 * =====================================================================
 * DESC:   Cuerpo del post. Header con firma visual de categoría (left
 *         accent line en color de categoría). ContentRenderer para el
 *         markdown. Refs expuestos para GSAP desde [slug].vue.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed } from 'vue';
import type { BlogPost } from '~/types/blog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '~/types/blog';

const props = defineProps<{
  post: BlogPost;
}>();

const postHeaderRef = ref<HTMLElement | null>(null);
const postContentRef = ref<HTMLElement | null>(null);

defineExpose({ postHeaderRef, postContentRef });

const categoryColor = computed(() => CATEGORY_COLORS[props.post.category]);
</script>

<template>
  <div class="blog-post-body">
    <!-- ================================================================
         POST HEADER
         La línea izquierda (gradient del color de categoría) es la
         "firma visual" del post. El único elemento de color en la página.
         ================================================================ -->
    <header ref="postHeaderRef" class="post-body-header relative pl-7 mb-14 md:mb-20">
      <!-- Accent line: gradiente color → transparente, sólo en el header -->
      <div
        class="absolute left-0 top-0 h-full w-[2.5px] rounded-full"
        :style="{
          background: `linear-gradient(to bottom, ${categoryColor} 0%, ${categoryColor}00 100%)`,
        }"
      />

      <!-- Eyebrow
      <div class="post-body-eyebrow flex items-center gap-3 mb-7">
        <span
          class="text-[0.6rem] font-mono uppercase tracking-[0.28em] font-bold"
          :style="{ color: categoryColor }"
        >
          {{ CATEGORY_LABELS[post.category] }}
        </span>
        <span class="text-[0.55rem] font-mono opacity-15">—</span>
        <span class="text-[0.6rem] font-mono uppercase tracking-[0.2em] opacity-25">
          {{ post.time_to_read }} min read
        </span>
      </div> -->

      <!-- [NOTE] overflow-hidden crítico para clip-path reveal de GSAP -->
      <div class="overflow-hidden">
        <h1
          class="post-body-title text-[clamp(2.25rem,6vw,4rem)] font-black tracking-[-0.035em] leading-[1.0] mb-7"
        >
          {{ post.title }}
        </h1>
      </div>

      <!-- Description -->
      <p
        class="post-body-excerpt text-base md:text-lg opacity-70 leading-[1.75] font-mono max-w-xl"
      >
        {{ post.description }}
      </p>
    </header>

    <!-- Divider: animado con scaleX desde [slug].vue -->
    <div class="post-body-line mb-14 h-px bg-foreground/8 origin-left" />

    <!-- Post Content -->
    <!-- [NOTE] --color-accent aquí overridea el global → todos los MDC del post
         (HandDrawn, ProsePre borders, etc.) heredan el color de categoría via cascade -->
    <div ref="postContentRef" class="post-content prose" :style="{ '--color-accent': categoryColor }">
      <ContentRenderer :value="post as any" />
    </div>

    <footer class="mt-20 pt-8 border-t border-foreground/8" />
  </div>
</template>
