<script setup lang="ts">
/**
 * █ [MDC] :: IMAGE SLIDER
 * =====================================================================
 * DESC:   Carrusel de imágenes con estética de asset viewer técnico.
 *
 * LAYOUT:
 *   ┌─────────────────────────────┐
 *   │  VIEWPORT (posición absoluta│  ← imágenes apiladas, solo una visible
 *   │  + cursor label con lerp)   │
 *   ├─────────────────────────────┤
 *   │  01  LABEL    path/img.webp │  ← fila activa: fondo --color-accent
 *   │  02  LABEL    path/img.webp │  ← filas inactivas: opacity 0.4
 *   └─────────────────────────────┘
 *
 * NAVEGACIÓN:
 *   - Click/tap en el viewport     → siguiente imagen
 *   - Swipe horizontal (>50px)     → siguiente / anterior
 *   - Click en una fila del índice → salta directamente a esa imagen
 *   - Botón ▶ en la fila activa    → siguiente (stopPropagation para no duplicar)
 *   - Teclas ← / →                → anterior / siguiente
 *
 * TRANSICIÓN:
 *   - fwd (avanzar): actual sale hacia abajo, nueva entra desde arriba
 *   - bwd (retroceder): actual sube, anterior entra desde abajo
 *   Las dos imágenes se animan simultáneamente con el mismo timeline GSAP.
 *   `transitioning` bloquea llamadas a goTo() durante la animación.
 *
 * CURSOR LABEL:
 *   Label "NEXT IMAGE" que sigue al ratón con interpolación lineal (lerp).
 *   Se oculta en dispositivos sin hover (touch) mediante @media (hover: none)
 *   y el guard `hasHover` que evita registrar los handlers innecesariamente.
 *
 * TAMAÑO Y ALINEACIÓN:
 *   El viewport usa aspect-ratio — el alto escala con el ancho automáticamente.
 *   Todas las imágenes del slider comparten el mismo ratio (sin saltos de altura).
 *   El ratio por defecto es '16/9'. Para imágenes portrait usar '4/3', '1/1', etc.
 *   Sin maxWidth → ocupa el 100% del contenedor.
 *   Con maxWidth → acepta px, %, rem, etc. La alineación se controla con
 *   `align` ('left' | 'center' | 'right', default 'center') via margin auto.
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
 *   ::image-slider{aspect-ratio="4/3"}   ← para imágenes cuadradas/portrait
 *   ---
 *   images: [...]
 *   ---
 *   ::
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ComponentPublicInstance } from 'vue';
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
    /**
     * Ratio del viewport. Acepta cualquier valor CSS válido: '16/9', '4/3', '1/1', '9/16'…
     * El alto se calcula automáticamente a partir del ancho → escala en todos los dispositivos.
     * Default: '16/9'
     */
    aspectRatio?: string;
    /**
     * Ancho máximo del componente completo.
     * Acepta cualquier unidad CSS válida (px, %, rem…).
     * Sin valor → ocupa el 100% disponible.
     */
    maxWidth?: string;
    /**
     * Alineación horizontal cuando maxWidth está definido.
     * Se implementa con margin: auto en el lado opuesto.
     * Default: 'center'.
     */
    align?: 'left' | 'center' | 'right';
  }>(),
  { aspectRatio: '16/9', align: 'center' },
);

// Calcula marginLeft/marginRight para centrar, alinear a izquierda o derecha.
// left  → ml:0  mr:auto   (pegado a la izquierda)
// center→ ml:auto mr:auto (centrado)
// right → ml:auto mr:0    (pegado a la derecha)
const figureStyle = computed(() => {
  if (!props.maxWidth) return {};
  return {
    maxWidth: props.maxWidth,
    width: '100%',
    marginLeft: props.align !== 'left' ? 'auto' : '0',
    marginRight: props.align !== 'right' ? 'auto' : '0',
  };
});

// =============================================================================
// █ HOVER CAPABILITY
// =============================================================================
// En dispositivos touch (hover:none) no registramos los handlers de cursor
// para evitar trabajo innecesario en el thread principal.
const hasHover = import.meta.client ? window.matchMedia('(hover: hover)').matches : true;

// =============================================================================
// █ CURSOR LABEL
// ─────────────────────────────────────────────────────────────────────────────
// useCursorLabel devuelve:
//   containerRef → ref del elemento que actúa como área de hover
//   labelRef     → ref del elemento del label (posicionado absolutamente)
//   isHovering   → bool reactivo, controla la clase --visible
//   onMouseMove  → actualiza targetX/Y para el lerp
//   onMouseEnter → snapa la posición inicial y arranca el rAF loop
//   onMouseLeave → detiene el rAF loop
// =============================================================================
const { containerRef, labelRef, isHovering, onMouseMove, onMouseEnter, onMouseLeave } =
  useCursorLabel({ lerp: 0.1, offsetX: 14, offsetY: 10 });

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
// Bandera de transición: bloquea goTo() mientras hay una animación en curso
// para evitar que el usuario dispare múltiples transiciones simultáneas.
let transitioning = false;

// Array de refs de los elementos de slide. Se popula vía setSlideRef() en v-for.
const slideRefs = ref<(HTMLElement | null)[]>([]);

// Factoría de función-ref para v-for.
// Vue pasa Element | ComponentPublicInstance | null — como el elemento es siempre
// un <div> nativo, el instanceof HTMLElement garantiza el tipo correcto sin cast.
function setSlideRef(i: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    slideRefs.value[i] = el instanceof HTMLElement ? el : null;
  };
}

// =============================================================================
// █ GSAP
// ─────────────────────────────────────────────────────────────────────────────
// Estado inicial: slide 0 visible (opacity:1, zIndex:1), resto ocultos.
// Se usa gsap.set (sin animación) para establecer el punto de partida correcto
// antes de cualquier interacción del usuario.
// =============================================================================
const { gsap, initGSAP } = useGSAP();

// =============================================================================
// █ NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
// goTo() anima la transición entre dos slides con un timeline GSAP.
// Dirección fwd (avanzar):
//   actual → sale hacia abajo (exitY: '100%')
//   nueva  → entra desde arriba (enterY: '-100%')
// Dirección bwd (retroceder):
//   actual → sale hacia arriba (exitY: '-100%')
//   anterior → entra desde abajo (enterY: '100%')
//
// Las dos animaciones corren en paralelo (mismo timestamp "0") para que la
// entrada y salida sean simétricas y duren exactamente lo mismo.
//
// Al completar: el slide saliente se oculta (opacity:0) y se resetea su Y,
// el slide entrante queda en zIndex:1 (base). Durante la animación el
// entrante está en zIndex:2 para estar siempre encima del saliente.
// =============================================================================
function goTo(index: number, dir: 'fwd' | 'bwd' = 'fwd') {
  if (index === current.value || transitioning || !props.images.length) return;
  transitioning = true;

  const fromEl = slideRefs.value[current.value];
  const toEl = slideRefs.value[index];

  // Sin elementos de DOM no hay nada que animar
  if (!fromEl || !toEl) {
    current.value = index;
    transitioning = false;
    return;
  }

  const exitY  = dir === 'fwd' ? '100%' : '-100%';
  const enterY = dir === 'fwd' ? '-100%' : '100%';

  const tl = gsap.timeline({
    onComplete: () => {
      // Limpiar el slide saliente: ocultarlo y resetear su posición
      // para que quede listo para cualquier transición futura.
      gsap.set(fromEl, { opacity: 0, y: '0%', zIndex: 0 });
      gsap.set(toEl, { zIndex: 1 });
      transitioning = false;
    },
  });

  // El entrante arranca invisible fuera del viewport, encima del saliente
  tl.set(toEl, { opacity: 1, y: enterY, zIndex: 2 });
  // Ambas animaciones en t=0 → corren en paralelo
  tl.to(fromEl, { y: exitY,  duration: 0.5, ease: 'power3.inOut' }, 0);
  tl.to(toEl,   { y: '0%',   duration: 0.5, ease: 'power3.inOut' }, 0);

  current.value = index;
}

function next() {
  goTo((current.value + 1) % props.images.length, 'fwd');
}
function prev() {
  goTo((current.value - 1 + props.images.length) % props.images.length, 'bwd');
}

// =============================================================================
// █ POINTER — swipe táctil + tap-to-next
// ─────────────────────────────────────────────────────────────────────────────
// Se usa PointerEvents en lugar de TouchEvents para cubrir tanto touch como
// mouse con un único par de handlers.
//
// Criterios de decisión en onPointerUp:
//   |dx| > 50 && |dy| < 30 → swipe horizontal intencional
//   |dx| < 8  && |dy| < 8  → tap sin movimiento → avanzar
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
    dx < 0 ? next() : prev();
  } else if (Math.abs(dx) < 8 && dy < 8) {
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

// =============================================================================
// █ LIFECYCLE
// =============================================================================
onMounted(() => {
  // Estado inicial de los slides: solo el primero visible
  initGSAP(() => {
    slideRefs.value.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, y: '0%', zIndex: i === 0 ? 1 : 0 });
    });
  });

  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

// =============================================================================
// █ HELPERS
// =============================================================================
// Índice con cero a la izquierda: 0 → "01", 1 → "02"…
function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0');
}

// Si no se proporciona label explícito, se deriva del nombre de archivo:
// "blog/post/my-screenshot.webp" → "MY_SCREENSHOT"
function extractLabel(src: string): string {
  const file = src.split('/').pop() ?? src;
  return (file.split('.')[0] ?? file).toUpperCase().replace(/-/g, '_');
}

</script>

<template>
  <figure class="image-slider not-prose my-8" aria-label="Image slider" :style="figureStyle">
    <!-- ================================================================
         VIEWPORT
         containerRef es requerido por useCursorLabel para calcular la
         posición del cursor relativa al contenedor (getBoundingClientRect).
         tabindex="0" permite recibir foco para la navegación con teclado.
         ================================================================ -->
    <div
      ref="containerRef"
      class="is-viewport"
      :style="{ aspectRatio: aspectRatio }"
      tabindex="0"
      role="img"
      :aria-label="images[current]?.alt"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
      <!-- Slides apilados con position:absolute. GSAP controla opacity y Y. -->
      <div v-for="(img, i) in images" :key="i" :ref="setSlideRef(i)" class="is-slide">
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

      <!-- Label que sigue al cursor con lerp. isHovering controla la opacidad
           via clase CSS (no JS) para evitar forzar un reflow en cada frame. -->
      <div
        ref="labelRef"
        class="is-cursor-label"
        :class="{ 'is-cursor-label--visible': isHovering }"
      >
        NEXT IMAGE
      </div>
    </div>

    <!-- ================================================================
         FILE LIST
         Índice visual de estética "asset viewer". El item activo tiene
         fondo --color-accent (heredado del post via BlogPostBody).
         aria-current marca el item activo para lectores de pantalla.
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

        <!-- El botón ▶ solo aparece en la fila activa. stopPropagation evita
             que el click se propague al div padre y llame a goTo() también. -->
        <button v-if="i === current" class="is-arrow" aria-label="Next image" @click.stop="next">
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
   aspect-ratio viene del prop → escala con el ancho en todos los
   dispositivos. overflow:hidden recorta los slides que entran/salen.
   user-select:none previene selección de texto accidental en swipe.
   ================================================================ */
.is-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: rgba(12, 0, 17, 0.06);
  user-select: none;
  cursor: pointer;
}

/* Todos los slides se apilan en el mismo espacio con position:absolute.
   La opacidad y el Y los gestiona GSAP exclusivamente — no tocar en CSS. */
.is-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
}

/* NuxtPicture genera <picture> + <img>. El :deep() es necesario porque
   el componente encapsula su DOM y scoped CSS no penetra sin él. */
.is-slide :deep(picture),
.is-slide :deep(.is-slide-img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ================================================================
   CURSOR LABEL
   Posicionado en top:0 left:0 y movido con translate() por el rAF
   loop de useCursorLabel (no con top/left para evitar reflows).
   Color heredado de --color-accent del post (BlogPostBody).
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

/* En touch no existe el label — display:none evita que ocupe memoria GPU */
@media (hover: none) {
  .is-cursor-label {
    display: none;
  }
}

/* ================================================================
   FILE LIST
   ================================================================ */
.is-list {
  border-top: 1px solid rgba(12, 0, 17, 0.08);
}

/* Grid de 4 columnas: índice | nombre | ruta | flecha.
   En móvil se colapsa a 3 columnas ocultando la ruta (ver @media abajo). */
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

/* En móvil: la ruta se oculta y el grid colapsa a 3 columnas */
@media (max-width: 640px) {
  .is-row {
    grid-template-columns: 2.5rem 1fr 2rem;
  }

  .is-path {
    display: none;
  }
}

/* ================================================================
   ARROW BUTTON
   ================================================================ */
.is-arrow {
  font-size: 0.5rem;
  color: var(--color-foreground);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
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
