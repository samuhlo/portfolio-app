<script setup lang="ts">
/**
 * █ [MDC] :: IMAGE SLIDER
 * =====================================================================
 * DESC:   Carrusel de imágenes con estética de asset viewer técnico.
 *         Layout: viewport de imagen + lista de archivos debajo.
 *         El item activo tiene fondo --color-accent (igual que en la
 *         referencia de diseño). Navegación por click en filas,
 *         click/tap en el viewport, swipe táctil y teclas ←→.
 *         Cursor label "NEXT IMAGE" que sigue al ratón con lerp
 *         (mismo sistema que ProjectCard en playground).
 *
 * USAGE (markdown):
 *   ::image-slider
 *   ---
 *   images:
 *     - src: blog/mi-post/screenshot-01.webp
 *       alt: Vista del dashboard
 *       label: DASHBOARD_MAIN
 *     - src: blog/mi-post/screenshot-02.webp
 *       alt: Vista mobile
 *   ---
 *   ::
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed, onMounted, onUnmounted, type ComponentPublicInstance } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useCursorLabel } from '~/composables/useCursorLabel';

// =============================================================================
// █ TYPES
// =============================================================================
interface SliderImage {
  src: string;
  alt: string;
  label?: string;
}

// =============================================================================
// █ PROPS
// =============================================================================
const props = withDefaults(
  defineProps<{
    images: SliderImage[];
    /** Alto del viewport de imagen en px */
    height?: string | number;
  }>(),
  { height: 420 },
);

// =============================================================================
// █ HOVER CAPABILITY
// =============================================================================
// [NOTE] En touch no hay hover → no mostrar cursor label
const hasHover = import.meta.client ? window.matchMedia('(hover: hover)').matches : true;

// =============================================================================
// █ CURSOR LABEL
// =============================================================================
const {
  containerRef,
  labelRef,
  isHovering,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
} = useCursorLabel({ lerp: 0.1, offsetX: 14, offsetY: 10 });

function handleMouseEnter(e: MouseEvent) {
  if (!hasHover) return;
  onMouseEnter(e);
}

function handleMouseLeave() {
  if (!hasHover) return;
  onMouseLeave();
}

function handleMouseMove(e: MouseEvent) {
  if (!hasHover) return;
  onMouseMove(e);
}

// =============================================================================
// █ STATE
// =============================================================================
const current = ref(0);
let transitioning = false;

const slideRefs = ref<(HTMLElement | null)[]>([]);

function setSlideRef(i: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    slideRefs.value[i] = el as HTMLElement | null;
  };
}

// =============================================================================
// █ GSAP
// =============================================================================
const { gsap, initGSAP } = useGSAP();

onMounted(() => {
  initGSAP(() => {
    slideRefs.value.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, y: '0%', zIndex: i === 0 ? 1 : 0 });
    });
  });
});

// =============================================================================
// █ NAVIGATION
// =============================================================================
// [NOTE] fwd → la actual cae hacia abajo, la siguiente baja desde arriba.
//        bwd → la actual sube, la anterior sube desde abajo.
function goTo(index: number, dir: 'fwd' | 'bwd' = 'fwd') {
  if (index === current.value || transitioning || !props.images.length) return;
  transitioning = true;

  const fromEl = slideRefs.value[current.value];
  const toEl   = slideRefs.value[index];

  const exitY  = dir === 'fwd' ? '100%'  : '-100%';
  const enterY = dir === 'fwd' ? '-100%' : '100%';

  const tl = gsap.timeline({
    onComplete: () => {
      if (fromEl) gsap.set(fromEl, { opacity: 0, y: '0%', zIndex: 0 });
      if (toEl)   gsap.set(toEl, { zIndex: 1 });
      transitioning = false;
    },
  });

  tl.set(toEl, { opacity: 1, y: enterY, zIndex: 2 });
  tl.to(fromEl, { y: exitY, duration: 0.5, ease: 'power3.inOut' }, 0);
  tl.to(toEl,   { y: '0%',  duration: 0.5, ease: 'power3.inOut' }, 0);

  current.value = index;
}

function next() { goTo((current.value + 1) % props.images.length, 'fwd'); }
function prev() { goTo((current.value - 1 + props.images.length) % props.images.length, 'bwd'); }

// =============================================================================
// █ POINTER — swipe + tap-to-next
// =============================================================================
let swipeStartX = 0;
let swipeStartY = 0;

function onPointerDown(e: PointerEvent) {
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;
}

function onPointerUp(e: PointerEvent) {
  const dx = e.clientX - swipeStartX;
  const dy = Math.abs(e.clientY - swipeStartY);

  if (Math.abs(dx) > 50 && dy < 30) {
    // Swipe horizontal
    dx < 0 ? next() : prev();
  } else if (Math.abs(dx) < 8 && dy < 8) {
    // [NOTE] Tap sin movimiento → next (igual que click en el viewport)
    next();
  }
}

// =============================================================================
// █ KEYBOARD
// =============================================================================
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft')  prev();
}

onMounted(() => window.addEventListener('keydown', onKeyDown));
onUnmounted(() => window.removeEventListener('keydown', onKeyDown));

// =============================================================================
// █ HELPERS
// =============================================================================
function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0');
}

function extractLabel(src: string): string {
  const file = src.split('/').pop() ?? src;
  return file.split('.')[0].toUpperCase().replace(/-/g, '_');
}

const viewportHeight = computed(() => `${Number(props.height)}px`);
</script>

<template>
  <figure class="image-slider not-prose my-8" aria-label="Image slider">

    <!-- ================================================================
         VIEWPORT — imágenes apiladas + cursor label
         containerRef viene de useCursorLabel
         ================================================================ -->
    <div
      ref="containerRef"
      class="is-viewport"
      :style="{ height: viewportHeight }"
      tabindex="0"
      role="img"
      :aria-label="images[current]?.alt"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
      <div
        v-for="(img, i) in images"
        :key="i"
        :ref="setSlideRef(i)"
        class="is-slide"
      >
        <NuxtPicture
          :src="img.src"
          :alt="img.alt"
          :loading="i === 0 ? 'eager' : 'lazy'"
          sizes="sm:100vw md:100vw lg:860px"
          format="avif,webp"
          :quality="85"
          :img-attrs="{ class: 'is-slide-img' }"
        />
      </div>

      <!-- Cursor label — sigue al ratón con lerp, color de categoría del post -->
      <div
        ref="labelRef"
        class="is-cursor-label"
        :class="{ 'is-cursor-label--visible': isHovering }"
      >
        NEXT IMAGE
      </div>
    </div>

    <!-- ================================================================
         FILE LIST — índice técnico, item activo con fondo acento
         ================================================================ -->
    <div class="is-list" role="list">
      <div
        v-for="(img, i) in images"
        :key="i"
        class="is-row"
        :class="{ 'is-row--active': i === current }"
        role="listitem"
        :aria-current="i === current ? 'true' : undefined"
        @click="goTo(i, i > current ? 'fwd' : 'bwd')"
      >
        <span class="is-index">{{ padIndex(i) }}</span>
        <span class="is-label">{{ img.label ?? extractLabel(img.src) }}</span>
        <span class="is-path">{{ img.src }}</span>

        <button
          v-if="i === current"
          class="is-arrow"
          aria-label="Next image"
          @click.stop="next"
        >
          &#9658;
        </button>
        <span v-else class="is-arrow-placeholder" />
      </div>
    </div>

  </figure>
</template>

<style scoped>
/* ================================================================
   VIEWPORT
   ================================================================ */
.is-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: rgba(12, 0, 17, 0.06);
  user-select: none;
}

.is-viewport { cursor: pointer; }

.is-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.is-slide :deep(picture),
.is-slide :deep(.is-slide-img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ================================================================
   CURSOR LABEL
   Mismo patrón que ProjectCard. Color de fondo = --color-accent
   del post (seteado dinámicamente por BlogPostBody).
   ================================================================ */
.is-cursor-label {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 20;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  white-space: nowrap;
  color: var(--color-accent);
  opacity: 0;
  will-change: transform;
  transition: opacity 0.2s ease;
}

.is-cursor-label--visible {
  opacity: 1;
}

@media (hover: none) {
  .is-cursor-label { display: none; }
}

/* ================================================================
   FILE LIST
   ================================================================ */
.is-list {
  border-top: 1px solid rgba(12, 0, 17, 0.08);
}

.is-row {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2fr 2rem;
  align-items: center;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: background 0.1s ease;
  gap: 0.5rem;
}

.is-row:not(.is-row--active) {
  opacity: 0.4;
}

.is-row:not(.is-row--active):hover {
  opacity: 0.75;
  background: rgba(12, 0, 17, 0.03);
}

.is-row--active {
  background: var(--color-accent);
  opacity: 1;
  cursor: default;
}

/* ================================================================
   ROW CELLS
   ================================================================ */
.is-index,
.is-label,
.is-path {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-foreground);
}

.is-index {
  font-weight: 700;
  opacity: 0.9;
}

.is-label {
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.is-path {
  opacity: 0.65;
  font-size: 0.55rem;
}

/* ================================================================
   ARROW
   ================================================================ */
.is-arrow {
  font-size: 0.5rem;
  color: var(--color-foreground);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.15s ease, transform 0.15s ease;
  justify-self: end;
}

.is-arrow:hover {
  opacity: 1;
  transform: translateX(2px);
}

.is-arrow-placeholder {
  display: block;
  width: 1rem;
}
</style>
