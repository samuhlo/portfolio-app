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
 * TAMAÑO Y ALINEACIÓN:
 *   Sin maxWidth el componente ocupa el 100% del contenedor (por defecto).
 *   Con maxWidth se puede controlar el ancho y la posición horizontal:
 *
 *   ::blog-media          — centrado al 60% del contenedor
 *   ---
 *   src: blog/mi-post/cover.jpg
 *   maxWidth: 60%
 *   align: center
 *   ---
 *   ::
 *
 *   ::blog-media          — pegado a la izquierda, 400px fijos
 *   ---
 *   src: blog/mi-post/cover.jpg
 *   maxWidth: 400px
 *   align: left
 *   ---
 *   ::
 *
 *   ::blog-media          — pegado a la derecha, 45%
 *   ---
 *   src: blog/mi-post/cover.jpg
 *   maxWidth: 45%
 *   align: right
 *   ---
 *   ::
 *
 *   maxWidth acepta cualquier unidad CSS válida: px, %, rem, etc.
 *   align puede ser 'left' | 'center' | 'right' (default: 'center').
 *   Si no se pasa maxWidth, align no tiene efecto.
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
import { useRuntimeConfig } from '#imports';

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
    /**
     * Ancho máximo del componente.
     * Acepta px, %, rem, etc. (e.g. '600px', '80%', '40rem')
     * Sin valor → ocupa el 100% disponible.
     */
    maxWidth?: string;
    /**
     * Alineación horizontal cuando maxWidth está definido.
     * 'left' | 'center' | 'right'  — default: 'center'
     */
    align?: 'left' | 'center' | 'right';
  }>(),
  {
    format: 'avif,webp',
    quality: 80,
    align: 'center',
  },
);

const figureStyle = computed(() => {
  if (!props.maxWidth) return {};
  const ml = props.align === 'right' ? 'auto' : props.align === 'center' ? 'auto' : '0';
  const mr = props.align === 'left' ? 'auto' : props.align === 'center' ? 'auto' : '0';
  return { maxWidth: props.maxWidth, marginLeft: ml, marginRight: mr, width: '100%' };
});

const config = useRuntimeConfig();
const isVideo = computed(() => /\.(mp4|webm)$/i.test(props.src));

const videoSrc = computed(() => {
  if (!props.src) return '';
  if (props.src.startsWith('http')) return props.src;

  const baseUrl = config.public.assetsUrl?.replace(/\/$/, '') ?? '';
  const path = props.src.startsWith('/') ? props.src : `/${props.src}`;

  return `${baseUrl}${path}`;
});
</script>

<template>
  <figure class="my-8 not-prose" :style="figureStyle">
    <video
      v-if="isVideo"
      :src="videoSrc"
      :width="width"
      :height="height"
      autoplay
      controls
      muted
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
