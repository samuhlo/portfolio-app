<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG POST BODY
 * =====================================================================
 * DESC:   Cuerpo del post con el contenido renderizado.
 *         Aquí irán los componentes adicionales en el futuro
 *         (BlogImageSlider, etc.)
 * STATUS: STABLE
 * =====================================================================
 */

import type { BlogPost } from '~/types/blog';

const props = defineProps<{
  post: BlogPost;
  content: string;
}>();

// Aquí se pueden añadir más slots o componentes según se necesiten
// Ej: <slot name="gallery" /> para imágenes
</script>

<template>
  <div class="blog-post-body">
    <!-- Post Header -->
    <header class="mb-12 md:mb-16">
      <!-- Title -->
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6">
        {{ post.title }}
      </h1>

      <!-- Excerpt -->
      <p class="text-lg md:text-xl opacity-60 leading-relaxed">
        {{ post.excerpt }}
      </p>
    </header>

    <!-- Post Content -->
    <!-- Las clases .prose y .post-* están definidas en main.css -->
    <div class="post-content prose" v-html="content" />

    <!-- Post Footer / Navigation placeholder -->
    <footer class="mt-16 pt-8 border-t border-foreground/10">
      <!-- Aquí puedes añadir: Author info, related posts, etc. -->
    </footer>
  </div>
</template>
