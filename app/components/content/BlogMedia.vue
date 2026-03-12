<script setup lang="ts">
/**
 * █ [MDC] :: BLOG MEDIA
 * =====================================================================
 * DESC:   Componente MDC para imágenes y vídeos en posts del blog.
 *         Si el src termina en .mp4 o .webm, renderiza un <video>.
 *         En caso contrario, usa NuxtPicture con optimización AVIF/WebP.
 *         El figure, caption y clases son idénticos en ambos casos.
 *
 * USAGE (markdown):
 *   ::blog-media
 *   ---
 *   src: blog/mi-post/cover.jpg
 *   alt: Descripción de la imagen
 *   caption: Texto opcional al pie
 *   ---
 *   ::
 *
 *   ::blog-media
 *   ---
 *   src: blog/mi-post/demo.mp4
 *   caption: Demo en vídeo
 *   ---
 *   ::
 *
 * NOTAS:
 *   - alt es opcional en vídeos (no aplica al elemento <video>)
 *   - format y quality solo se usan para imágenes (NuxtPicture)
 *   - El vídeo se renderiza con controls, muted, loop y playsinline
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Path relativo al alias "blog" (e.g. blog/mi-post/cover.jpg) */
    src: string;
    /** Requerido para imágenes, ignorado en vídeos */
    alt?: string;
    width?: number;
    height?: number;
    /** Texto de pie de imagen/vídeo */
    caption?: string;
    /** Breakpoints responsive (solo imágenes) */
    sizes?: string;
    /**
     * Formato(s) de salida que genera IPX (solo imágenes).
     * Default: 'avif,webp'
     */
    format?: string;
    /**
     * Calidad de compresión 1–100 (solo imágenes).
     * Default: 80
     */
    quality?: number;
  }>(),
  {
    format: 'avif,webp',
    quality: 80,
  },
);

const isVideo = computed(() => /\.(mp4|webm)$/i.test(props.src));
</script>

<template>
  <figure class="my-8 not-prose">
    <video
      v-if="isVideo"
      :src="src"
      :width="width"
      :height="height"
      controls
      muted
      loop
      playsinline
      preload="metadata"
      class="w-full h-auto rounded-sm"
    />
    <NuxtPicture
      v-else
      :src="src"
      :alt="alt ?? ''"
      :width="width"
      :height="height"
      :sizes="sizes ?? 'sm:100vw md:90vw lg:800px'"
      :format="format"
      :quality="quality"
      loading="lazy"
      class="block w-full"
      :img-attrs="{ class: 'w-full h-auto rounded-sm' }"
    />
    <figcaption
      v-if="caption"
      class="mt-3 text-center text-xs font-mono tracking-widest uppercase opacity-30"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
