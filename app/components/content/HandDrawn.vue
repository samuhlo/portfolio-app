<script setup lang="ts">
/**
 * █ [MDC] :: HAND DRAWN DOODLE
 * =====================================================================
 * DESC:   Componente MDC que envuelve texto/contenido y ancla uno o
 *         varios doodles SVG animados sobre él. El SVG se posiciona
 *         absolutamente sobre el slot con presets (under, over, around,
 *         left, right) o con valores CSS explícitos.
 *         Reutiliza useDoodleDraw para el efecto stroke-dash.
 *
 * COLOR:
 *   Sin stroke-color  → hereda --color-accent del post (color de categoría)
 *   stroke-color="accent" → idem, explícito
 *   stroke-color="#hex"   → color fijo
 *
 * COUNT:
 *   count="2" → dibuja dos copias del SVG en línea, cada una offset
 *   respecto a la anterior por el ancho del SVG + un gap de 0.1em.
 *   Útil para "??" o "!!" decorativos.
 *   En placement="right" los doodles van hacia la derecha.
 *   En placement="left" van hacia la izquierda.
 *   En placement="under"/"over" van hacia la derecha (en línea).
 *
 * USAGE (inline):
 *   :hand-drawn{svg="/blog/doodles/underline.svg"}[design systems]
 *   :hand-drawn{svg="/blog/doodles/circle.svg" placement="around"}[Zod]
 *   :hand-drawn{svg="/blog/doodles/inter.svg" placement="right" count="2"}[¿valió la pena?]
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
import type { ComponentPublicInstance, CSSProperties } from 'vue';
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
     *   - omitido / "accent" → usa var(--color-accent) del post
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
    /**
     * Número de copias del SVG a renderizar en línea.
     * Cada copia se desplaza respecto a la anterior por su ancho + 0.1em gap.
     * Útil para "??" o "!!" → count="2"
     */
    count?: string | number;
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
    count: 1,
  },
);

// =============================================================================
// █ COLOR & DURATION RESOLUTION
// =============================================================================
// [NOTE] MDC siempre pasa props como strings aunque el valor sea numérico
const durationNum = computed(() => Number(props.duration));
const countNum = computed(() => Math.max(1, Number(props.count)));

const resolvedStrokeColor = computed(() => {
  if (!props.strokeColor || props.strokeColor === 'accent') return 'var(--color-accent)';
  return props.strokeColor;
});

// =============================================================================
// █ PLACEMENT PRESETS
// =============================================================================
// [NOTE] Valores en em para que escalen con el tamaño de fuente del contexto
const PRESETS: Record<Placement, CSSProperties> = {
  under: { bottom: '-0.35em', left: '0', width: '100%' },
  over: { top: '-0.35em', left: '0', width: '100%', transform: 'translateY(-100%)' },
  around: { top: '50%', left: '50%', width: '115%', transform: 'translate(-50%, -50%)' },
  left: { right: '110%', top: '50%', width: '2em', transform: 'translateY(-50%)' },
  right: { left: '110%', top: '50%', width: '2em', transform: 'translateY(-50%)' },
};

// Estilo base de la primera copia (índice 0)
const svgContainerStyle = computed<CSSProperties>(() => {
  const preset = PRESETS[props.placement];
  return {
    ...preset,
    ...(props.top !== undefined && { top: props.top }),
    ...(props.left !== undefined && { left: props.left }),
    ...(props.bottom !== undefined && { bottom: props.bottom }),
    ...(props.right !== undefined && { right: props.right }),
    ...(props.width !== undefined && { width: props.width }),
    ...(props.svgTransform !== undefined && { transform: props.svgTransform }),
    '--doodle-stroke-color': resolvedStrokeColor.value,
    ...(props.strokeWidth !== undefined && {
      '--doodle-stroke-width': `${Number(props.strokeWidth)}px`,
    }),
  };
});

// =============================================================================
// █ MULTI-COPY OFFSET
// ─────────────────────────────────────────────────────────────────────────────
// Para la copia i > 0, desplaza el eje de posicionamiento según el placement:
//   right  → incrementa `left`  (las copias van hacia la derecha)
//   left   → incrementa `right` (las copias van hacia la izquierda)
//   resto  → incrementa `left`  (en línea horizontal)
//
// El desplazamiento es i * (width + gap). Gap fijo de 0.1em para que las
// copias queden pegadas pero sin solaparse.
// =============================================================================
function getNthContainerStyle(i: number): CSSProperties {
  if (i === 0) return svgContainerStyle.value;

  const w = props.width ?? '2em';
  const gap = '0.1em';
  // offset total para la i-ésima copia
  const offset = `calc(${i} * (${w} + ${gap}))`;

  const base = { ...svgContainerStyle.value };

  if (props.placement === 'left') {
    // `left` placement usa `right` para posicionarse → aumentar `right` aleja hacia la izquierda
    const baseRight = String(base.right ?? '110%');
    base.right = `calc(${baseRight} + ${offset})`;
  } else {
    // `right`, `under`, `over`, `around` → aumentar `left` desplaza hacia la derecha
    const baseLeft = String(base.left ?? '0%');
    base.left = `calc(${baseLeft} + ${offset})`;
  }

  return base;
}

// =============================================================================
// █ REFS & STATE
// =============================================================================
const anchorRef = ref<HTMLElement | null>(null);
const containerRefs = ref<(HTMLElement | null)[]>([]);
const svgContent = ref<string>('');

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation, erasePaths } = useDoodleDraw();

// Un array de SVGSVGElement y paths preparados por cada copia
let svgEls: (SVGSVGElement | null)[] = [];
let allPreparedPaths: SVGPathElement[][] = [];
let isAnimating = false;

function setContainerRef(i: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    containerRefs.value[i] = el instanceof HTMLElement ? el : null;
  };
}

// =============================================================================
// █ LIFECYCLE: FETCH SVG + SETUP ANIMATION
// =============================================================================
onMounted(async () => {
  if (!import.meta.client) return;

  try {
    svgContent.value = await $fetch<string>(props.svg, { responseType: 'text' });
  } catch {
    return;
  }

  await nextTick();

  svgEls = containerRefs.value.map((el) => el?.querySelector('svg') ?? null);
  if (svgEls.every((el) => !el)) return;

  initGSAP(() => {
    allPreparedPaths = svgEls.map((svgEl) => (svgEl ? preparePaths(svgEl) : []));

    if (props.trigger === 'load') {
      // Todas las copias se dibujan al mismo tiempo
      svgEls.forEach((svgEl, i) => {
        if (!svgEl) return;
        const tl = gsap.timeline();
        addDrawAnimation(tl, {
          svg: svgEl,
          paths: allPreparedPaths[i] ?? [],
          duration: durationNum.value,
          ease: props.ease,
          proportional: true,
        });
      });
      return;
    }

    if (props.trigger === 'scroll') {
      // Una timeline por copia para poder dispararlas simultáneamente en onEnter
      const timelines = svgEls.map((svgEl, i) => {
        if (!svgEl) return null;
        const tl = gsap.timeline({ paused: true });
        addDrawAnimation(tl, {
          svg: svgEl,
          paths: allPreparedPaths[i] ?? [],
          duration: durationNum.value,
          ease: props.ease,
          proportional: true,
        });
        return tl;
      });

      ScrollTrigger.create({
        trigger: anchorRef.value,
        start: 'top 88%',
        once: true,
        onEnter: () => timelines.forEach((tl) => tl?.play()),
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
  if (props.trigger !== 'hover' || isAnimating) return;
  isAnimating = true;

  svgEls.forEach((svgEl, i) => {
    if (!svgEl) return;
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });
    addDrawAnimation(tl, {
      svg: svgEl,
      paths: allPreparedPaths[i] ?? [],
      duration: durationNum.value * 0.45,
      ease: 'power2.out',
      proportional: true,
    });
  });
}

function handleHoverLeave() {
  if (props.trigger !== 'hover') return;
  svgEls.forEach((svgEl, i) => {
    if (svgEl) erasePaths(svgEl, allPreparedPaths[i] ?? []);
  });
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
    <!-- Una copia del SVG por cada índice en countNum.
         El estilo de cada copia añade un offset acumulativo sobre el eje
         correcto según el placement, para que queden en línea. -->
    <span
      v-for="i in countNum"
      :key="i"
      :ref="setContainerRef(i - 1)"
      class="absolute block pointer-events-none doodle-svg-container [&>svg]:overflow-visible [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
      :style="getNthContainerStyle(i - 1)"
      v-html="svgContent"
    />
  </span>
</template>

<style>
.doodle-svg-container path,
.doodle-svg-container circle,
.doodle-svg-container line,
.doodle-svg-container polyline,
.doodle-svg-container polygon,
.doodle-svg-container rect,
.doodle-svg-container ellipse {
  stroke: var(--doodle-stroke-color, var(--color-accent, #ffca40)) !important;
}
</style>
