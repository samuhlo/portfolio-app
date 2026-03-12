<script setup lang="ts">
/**
 * █ [MDC] :: HAND DRAWN DOODLE
 * =====================================================================
 * DESC:   Componente MDC que envuelve texto/contenido y ancla un doodle
 *         SVG animado sobre él. El SVG se posiciona absolutamente sobre
 *         el slot con presets (under, over, around, left, right) o con
 *         valores CSS explícitos. Reutiliza useDoodleDraw para el efecto
 *         stroke-dash.
 *
 * COLOR:
 *   Sin stroke-color  → hereda --color-accent del post (color de categoría)
 *   stroke-color="accent" → idem, explícito
 *   stroke-color="#hex"   → color fijo
 *   El color se aplica via CSS variable --doodle-stroke-color sobre el
 *   contenedor del SVG, que los paths del SVG leen con var().
 *
 * USAGE (inline):
 *   :hand-drawn{svg="/blog/doodles/underline.svg"}[design systems]
 *   :hand-drawn{svg="/blog/doodles/circle.svg" placement="around" stroke-color="#ff0000"}[Zod]
 *
 * USAGE EN TÍTULOS (inline dentro del heading):
 *   ## :hand-drawn{svg="/blog/doodles/underline.svg"}[Mi sección]
 *
 * PLACEMENTS:
 *   under  — debajo del texto (default, ideal para underlines)
 *   over   — encima del texto
 *   around — centrado sobre el texto (ideal para circles)
 *   left   — flotando a la izquierda
 *   right  — flotando a la derecha
 *
 * CUSTOM POSITION: top / left / bottom / right / width / svgTransform
 *   sobreescriben el preset seleccionado.
 *
 * TRIGGERS: scroll | load | hover
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed, onMounted, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

// =============================================================================
// █ TYPES
// =============================================================================
type Placement = 'under' | 'over' | 'around' | 'left' | 'right';

// =============================================================================
// █ PROPS
// =============================================================================
const props = withDefaults(
  defineProps<{
    /** Path al SVG en /public (e.g. /blog/doodles/underline.svg) */
    svg: string;
    /** Preset de posición del doodle respecto al contenido del slot */
    placement?: Placement;
    /**
     * Color del trazo. Opciones:
     *   - omitido / "accent" → usa var(--color-accent) del post (color de categoría)
     *   - "#hexvalue"        → color fijo
     */
    strokeColor?: string;
    /** Grosor del trazo en px */
    strokeWidth?: string | number;
    /** Cómo se dispara la animación */
    trigger?: 'scroll' | 'load' | 'hover';
    /** Duración total del dibujo en segundos */
    duration?: string | number;
    /** Easing GSAP */
    ease?: string;
    // -- Overrides CSS de posición (sobreescriben el preset) --
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
    /** Ancho del SVG (e.g. '110%', '3em') */
    width?: string;
    /** CSS transform aplicado al contenedor del SVG */
    svgTransform?: string;
  }>(),
  {
    placement: 'under',
    trigger: 'scroll',
    duration: 1.2,
    ease: 'power2.inOut',
  },
);

// =============================================================================
// █ COLOR RESOLUTION
// =============================================================================
// [NOTE] Sin stroke-color o con "accent" → hereda --color-accent del post,
// que BlogPostBody setea dinámicamente al color de la categoría.
// Cualquier otro valor se usa directamente como color CSS.
// [NOTE] MDC siempre pasa props como strings aunque el valor sea numérico
const durationNum = computed(() => Number(props.duration));

const resolvedStrokeColor = computed(() => {
  if (!props.strokeColor || props.strokeColor === 'accent') return 'var(--color-accent)';
  return props.strokeColor;
});

// =============================================================================
// █ PLACEMENT PRESETS
// =============================================================================
// [NOTE] Valores en em para que escalen con el tamaño de fuente del contexto
const PRESETS: Record<Placement, CSSProperties> = {
  under:  { bottom: '-0.35em', left: '0',   width: '100%' },
  over:   { top: '-0.35em',    left: '0',   width: '100%', transform: 'translateY(-100%)' },
  around: { top: '50%',        left: '50%', width: '115%', transform: 'translate(-50%, -50%)' },
  left:   { right: '110%',     top: '50%',  width: '2em',  transform: 'translateY(-50%)' },
  right:  { left: '110%',      top: '50%',  width: '2em',  transform: 'translateY(-50%)' },
};

const svgContainerStyle = computed<CSSProperties>(() => {
  const preset = PRESETS[props.placement];
  return {
    ...preset,
    // [NOTE] Props individuales sobreescriben el preset selectivamente
    ...(props.top          !== undefined && { top: props.top }),
    ...(props.left         !== undefined && { left: props.left }),
    ...(props.bottom       !== undefined && { bottom: props.bottom }),
    ...(props.right        !== undefined && { right: props.right }),
    ...(props.width        !== undefined && { width: props.width }),
    ...(props.svgTransform !== undefined && { transform: props.svgTransform }),
    // CSS variables para el color y grosor — los paths del SVG las leen con var()
    '--doodle-stroke-color': resolvedStrokeColor.value,
    ...(props.strokeWidth !== undefined && { '--doodle-stroke-width': `${Number(props.strokeWidth)}px` }),
  };
});

// =============================================================================
// █ REFS & STATE
// =============================================================================
const anchorRef  = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const svgContent = ref<string>('');

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation, erasePaths } = useDoodleDraw();

// [NOTE] Los paths se guardan en module scope para reusar en hover sin re-query
let preparedPaths: SVGPathElement[] = [];
let svgEl: SVGSVGElement | null = null;
let isAnimating = false;

// =============================================================================
// █ LIFECYCLE: FETCH SVG + SETUP ANIMATION
// =============================================================================
onMounted(async () => {
  if (!import.meta.client) return;

  try {
    svgContent.value = await $fetch<string>(props.svg, { responseType: 'text' });
  } catch {
    // [NOTE] SVG no encontrado → componente queda vacío silenciosamente
    return;
  }

  await nextTick();

  svgEl = containerRef.value?.querySelector('svg') ?? null;
  if (!svgEl) return;

  initGSAP(() => {
    if (!svgEl) return;

    preparedPaths = preparePaths(svgEl);

    if (props.trigger === 'load') {
      const tl = gsap.timeline();
      addDrawAnimation(tl, {
        svg: svgEl,
        paths: preparedPaths,
        duration: durationNum.value,
        ease: props.ease,
        proportional: true,
      });
      return;
    }

    if (props.trigger === 'scroll') {
      // [NOTE] ScrollTrigger usa anchorRef (el texto visible) como trigger,
      // no el SVG que arranca invisible y no ocupa espacio real.
      const tl = gsap.timeline({ paused: true });
      addDrawAnimation(tl, {
        svg: svgEl,
        paths: preparedPaths,
        duration: durationNum.value,
        ease: props.ease,
        proportional: true,
      });

      ScrollTrigger.create({
        trigger: anchorRef.value,
        start: 'top 88%',
        once: true,
        onEnter: () => tl.play(),
      });
      return;
    }

    // trigger === 'hover': paths preparados (ocultos), handlers activos en template
  });
});

// =============================================================================
// █ HOVER HANDLERS
// =============================================================================
function handleHoverEnter() {
  if (props.trigger !== 'hover' || !svgEl || isAnimating) return;
  isAnimating = true;

  const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });
  addDrawAnimation(tl, {
    svg: svgEl,
    paths: preparedPaths,
    // [NOTE] Hover más rápido — sensación responsiva
    duration: durationNum.value * 0.45,
    ease: 'power2.out',
    proportional: true,
  });
}

function handleHoverLeave() {
  if (props.trigger !== 'hover' || !svgEl) return;
  erasePaths(svgEl, preparedPaths);
  isAnimating = false;
}
</script>

<template>
  <span
    ref="anchorRef"
    class="relative inline-block"
    :class="{ 'cursor-pointer': trigger === 'hover' }"
    @mouseenter="handleHoverEnter"
    @mouseleave="handleHoverLeave"
  >
    <slot />
    <!-- SVG posicionado absolutamente sobre el contenido del slot.
         svgContainerStyle incluye posición + --doodle-stroke-color que los paths leen con var() -->
    <span
      ref="containerRef"
      class="absolute block pointer-events-none [&>svg]:overflow-visible [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
      :style="svgContainerStyle"
      v-html="svgContent"
    />
  </span>
</template>
