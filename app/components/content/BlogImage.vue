<script setup lang="ts">
/**
 * █ [MDC] :: BLOG IMAGE
 * =====================================================================
 * DESC:   Componente MDC para imágenes en posts del blog. Wrappea
 *         NuxtPicture para optimización automática con lazy loading y
 *         responsive sizes. El src usa el alias "blog" configurado en
 *         nuxt.config → assets.samuhlo.dev/blog/...
 *
 * OPTIMIZACIÓN:
 *   IPX convierte el original (JPEG/PNG) a AVIF + WebP on-the-fly.
 *   El navegador recibe el formato más eficiente que soporte.
 *   format y quality son configurables por imagen.
 *
 * USAGE (markdown):
 *   ::blog-image
 *   ---
 *   src: blog/mi-post/cover.jpg
 *   alt: Descripción
 *   width: 1200
 *   height: 675
 *   quality: 75
 *   caption: Texto opcional al pie
 *   ---
 *   ::
 *
 * STATUS: STABLE
 * =====================================================================
 */

withDefaults(
  defineProps<{
    /** Path relativo al alias "blog" (e.g. blog/mi-post/cover.jpg) */
    src: string;
    alt: string;
    width?: number;
    height?: number;
    /** Texto de pie de imagen */
    caption?: string;
    /** Breakpoints responsive */
    sizes?: string;
    /**
     * Formato(s) de salida que genera IPX. Orden = prioridad del <source>.
     * Opciones: 'avif', 'webp', 'jpeg', 'png'
     * Default: 'avif,webp' — AVIF para modernos, WebP como fallback
     */
    format?: string;
    /**
     * Calidad de compresión 1–100.
     * Fotos naturales: 75–80. Diagramas/capturas: 85–90.
     * Default: 80 (configurado globalmente en nuxt.config)
     */
    quality?: number;
  }>(),
  {
    format: 'avif,webp',
    quality: 80,
  },
);
</script>

<template>
  <figure class="my-8 not-prose">
    <NuxtPicture
      :src="src"
      :alt="alt"
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
