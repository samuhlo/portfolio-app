<script setup lang="ts">
/**
 * █ [MDC] :: DRAW HEADING
 * =====================================================================
 * DESC:   Componente MDC block para headings con doodle SVG animado.
 *         Separado de HandDrawn porque los headings son block-level:
 *         el inline MDC syntax queda dentro de <p> y provoca HTML
 *         inválido (<h2> dentro de <p>). Este componente usa bloque
 *         (::) + ContentSlot con unwrap="p" para evitarlo.
 *
 * USAGE:
 *   ::draw-heading{svg="/blog/doodles/underline.svg" level="2"}
 *   La extracción con IA
 *   ::
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed, onMounted } from 'vue';
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
// [NOTE] MDC siempre pasa props como strings aunque el valor sea numérico.
// Los props number se declaran como string | number y se coercionan con Number().
const props = withDefaults(
  defineProps<{
    /** Nivel del heading (1–6) */
    level?: string | number;
    /** Path al SVG en /public */
    svg: string;
    /** Preset de posición del doodle */
    placement?: Placement;
    /** Color del trazo. Omitido → hereda --color-accent del post */
    strokeColor?: string;
    /** Grosor del trazo en px */
    strokeWidth?: string | number;
    /** Cómo se dispara la animación */
    trigger?: 'scroll' | 'load' | 'hover';
    /** Duración total del dibujo en segundos */
    duration?: string | number;
    /** Easing GSAP */
    ease?: string;
    // -- Overrides CSS de posición --
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
    width?: string;
    svgTransform?: string;
  }>(),
  {
    level: 2,
    placement: 'under',
    trigger: 'scroll',
    duration: 1.2,
    ease: 'power2.inOut',
  },
);

const levelNum  = computed(() => Number(props.level));
const durationNum = computed(() => Number(props.duration));

// =============================================================================
// █ COLOR RESOLUTION
// =============================================================================
const resolvedStrokeColor = computed(() => {
  if (!props.strokeColor || props.strokeColor === 'accent') return 'var(--color-accent)';
  return props.strokeColor;
});

// =============================================================================
// █ PLACEMENT PRESETS
// =============================================================================
const PRESETS: Record<Placement, CSSProperties> = {
  under:  { bottom: '-0.2em', left: '0',   width: '100%' },
  over:   { top: '-0.2em',    left: '0',   width: '100%', transform: 'translateY(-100%)' },
  around: { top: '50%',       left: '50%', width: '110%', transform: 'translate(-50%, -50%)' },
  left:   { right: '105%',    top: '50%',  width: '1.5em', transform: 'translateY(-50%)' },
  right:  { left: '105%',     top: '50%',  width: '1.5em', transform: 'translateY(-50%)' },
};

const svgContainerStyle = computed<CSSProperties>(() => ({
  ...PRESETS[props.placement],
  ...(props.top          !== undefined && { top: props.top }),
  ...(props.left         !== undefined && { left: props.left }),
  ...(props.bottom       !== undefined && { bottom: props.bottom }),
  ...(props.right        !== undefined && { right: props.right }),
  ...(props.width        !== undefined && { width: props.width }),
  ...(props.svgTransform !== undefined && { transform: props.svgTransform }),
  '--doodle-stroke-color': resolvedStrokeColor.value,
  ...(props.strokeWidth  !== undefined && { '--doodle-stroke-width': `${Number(props.strokeWidth)}px` }),
}));

// =============================================================================
// █ REFS & STATE
// =============================================================================
const anchorRef    = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const svgContent   = ref<string>('');

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation, erasePaths } = useDoodleDraw();

let preparedPaths: SVGPathElement[] = [];
let svgEl: SVGSVGElement | null = null;
let isAnimating = false;

// =============================================================================
// █ LIFECYCLE
// =============================================================================
onMounted(async () => {
  if (!import.meta.client) return;

  try {
    svgContent.value = await $fetch<string>(props.svg, { responseType: 'text' });
  } catch {
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
      addDrawAnimation(tl, { svg: svgEl, paths: preparedPaths, duration: durationNum.value, ease: props.ease, proportional: true });
      return;
    }

    if (props.trigger === 'scroll') {
      const tl = gsap.timeline({ paused: true });
      addDrawAnimation(tl, { svg: svgEl, paths: preparedPaths, duration: durationNum.value, ease: props.ease, proportional: true });
      ScrollTrigger.create({ trigger: anchorRef.value, start: 'top 88%', once: true, onEnter: () => tl.play() });
      return;
    }
  });
});

// =============================================================================
// █ HOVER HANDLERS
// =============================================================================
function handleHoverEnter() {
  if (props.trigger !== 'hover' || !svgEl || isAnimating) return;
  isAnimating = true;
  const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });
  addDrawAnimation(tl, { svg: svgEl, paths: preparedPaths, duration: durationNum.value * 0.45, ease: 'power2.out', proportional: true });
}

function handleHoverLeave() {
  if (props.trigger !== 'hover' || !svgEl) return;
  erasePaths(svgEl, preparedPaths);
  isAnimating = false;
}
</script>

<template>
  <!-- [NOTE] component :is renderiza h1–h6 según levelNum.
       Nuxt Content v3 no tiene ContentSlot — se usa <slot /> directamente.
       El <p> wrapper que genera el parser se aplana con display:contents en CSS. -->
  <component
    :is="`h${levelNum}`"
    ref="anchorRef"
    class="draw-heading relative inline-block"
    :class="{ 'cursor-pointer': trigger === 'hover' }"
    @mouseenter="handleHoverEnter"
    @mouseleave="handleHoverLeave"
  >
    <slot />
    <span
      ref="containerRef"
      class="absolute block pointer-events-none [&>svg]:overflow-visible [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
      :style="svgContainerStyle"
      v-html="svgContent"
    />
  </component>
</template>

<style scoped>
/* [NOTE] Nuxt Content envuelve el texto del slot en <p>.
   display:contents hace que el <p> sea "transparente" visualmente
   sin alterar el texto ni el flujo del heading. */
.draw-heading :deep(> p) {
  display: contents;
}
</style>
