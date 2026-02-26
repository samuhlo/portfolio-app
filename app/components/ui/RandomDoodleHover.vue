<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE HOVER
 * =====================================================================
 * DESC:   Wrapper interactivo que dibuja un underline doodle aleatorio
 *         al hacer hover. Usa useDoodleDraw para la animación stroke-dash.
 * STATUS: STABLE
 * =====================================================================
 */
import type { ComponentPublicInstance } from 'vue';
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

// [NOTE] En dispositivos táctiles no hay hover real → no animar doodles
const hasHover = import.meta.client ? window.matchMedia('(hover: hover)').matches : true;

interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const DOODLE_COUNT = 2;

const { preparePaths, addDrawAnimation } = useDoodleDraw();

const doodleRefs = ref<(DoodleExposed | null)[]>([]);

const setDoodleRef = (index: number) => (el: Element | ComponentPublicInstance | null) => {
  doodleRefs.value[index] = el as DoodleExposed | null;
};

/** Paths preparados por cada doodle, indexados igual que doodleRefs */
const allPreparedPaths = ref<SVGPathElement[][]>([]);

/** Índice del doodle actualmente visible (-1 = ninguno) */
let activeIndex = -1;
let isAnimating = false;

onMounted(() => {
  // [NOTE] Preparar los paths de ambos doodles al montar
  allPreparedPaths.value = Array.from({ length: DOODLE_COUNT }, (_, i) => {
    const doodle = doodleRefs.value[i];
    return preparePaths(doodle?.svg ?? null);
  });
});

const draw = () => {
  if (!hasHover || isAnimating) return;
  isAnimating = true;

  // [NOTE] Elegir un doodle aleatorio distinto al anterior cuando sea posible
  let nextIndex = Math.floor(Math.random() * DOODLE_COUNT);
  if (DOODLE_COUNT > 1 && nextIndex === activeIndex) {
    nextIndex = (nextIndex + 1) % DOODLE_COUNT;
  }
  activeIndex = nextIndex;

  const doodle = doodleRefs.value[activeIndex];
  const paths = allPreparedPaths.value[activeIndex];
  if (!doodle?.svg || !paths?.length) {
    isAnimating = false;
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
    },
  });

  addDrawAnimation(tl, {
    svg: doodle.svg,
    paths,
    duration: 0.35,
    stagger: 0.05,
    ease: 'power2.out',
  });
};

const erase = () => {
  if (activeIndex < 0) return;

  const doodle = doodleRefs.value[activeIndex];
  const paths = allPreparedPaths.value[activeIndex];
  if (!doodle?.svg || !paths?.length) return;

  // [NOTE] Fadeout rápido y luego resetear strokeDashoffset para re-animar
  gsap.to(doodle.svg, {
    opacity: 0,
    duration: 0.2,
    ease: 'power1.in',
    onComplete: () => {
      paths.forEach((path) => {
        const length = path.getTotalLength() + 20;
        gsap.set(path, {
          strokeDashoffset: length,
          visibility: 'hidden',
        });
      });
      activeIndex = -1;
      isAnimating = false;
    },
  });
};
</script>

<template>
  <span
    class="relative inline-block w-fit cursor-pointer z-50"
    @mouseenter="draw"
    @mouseleave="erase"
  >
    <slot />
    <!-- Contenedor absoluto para los doodles, posicionado justo debajo del texto -->
    <span
      class="absolute left-0 bottom-0 w-full pointer-events-none"
      style="transform: translateY(40%)"
    >
      <DoodleUnderlineGeneral
        :ref="setDoodleRef(0)"
        class="absolute left-0 top-0 w-full opacity-0"
      />
      <DoodleUnderlineGeneral2
        :ref="setDoodleRef(1)"
        class="absolute left-0 top-0 w-full opacity-0"
      />
    </span>
  </span>
</template>
