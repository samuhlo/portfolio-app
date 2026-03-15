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
import type { DoodleExposed } from '~/types/doodle';

withDefaults(
  defineProps<{
    strokeWidth?: number;
    strokeColor?: string;
  }>(),
  {
    strokeWidth: 4,
    strokeColor: '#ffca40',
  },
);

// [NOTE] En dispositivos táctiles no hay hover real → no animar doodles
const hasHover = import.meta.client ? window.matchMedia('(hover: hover)').matches : true;

const DOODLE_COUNT = 2;

const { preparePaths, addDrawAnimation, erasePaths, resetPaths } = useDoodleDraw();

const doodleRefs = ref<(DoodleExposed | null)[]>([]);

const setDoodleRef = (index: number) => (el: Element | ComponentPublicInstance | null) => {
  doodleRefs.value[index] = el as DoodleExposed | null;
};

/** Paths preparados por cada doodle, indexados igual que doodleRefs */
const allPreparedPaths = ref<SVGPathElement[][]>([]);

/** Índice del doodle actualmente visible (-1 = ninguno) */
let activeIndex = -1;

// [NOTE] Multiplier por doodle: DoodleUnderlineGeneral2 tiene beziers que hacen
// un recorrido de ida y vuelta, lo que hace que getTotalLength() subestime
// significativamente la longitud real. Con 1.05 el strokeDasharray queda menor
// que el path real y el patrón dash genera un "chunk" visible por wrap-around
// en la primera frame de la animación. Multiplier 2.0 previene esto.
const DOODLE_MULTIPLIERS = [1.05, 2.0] as const;

onMounted(() => {
  // [NOTE] Preparar los paths de ambos doodles al montar
  allPreparedPaths.value = Array.from({ length: DOODLE_COUNT }, (_, i) => {
    const doodle = doodleRefs.value[i];
    return preparePaths(doodle?.svg ?? null, DOODLE_MULTIPLIERS[i]);
  });
});

const draw = () => {
  if (!hasHover) return;

  // [NOTE] Elegir un doodle aleatorio distinto al anterior cuando sea posible
  let nextIndex = Math.floor(Math.random() * DOODLE_COUNT);
  if (DOODLE_COUNT > 1 && nextIndex === activeIndex) {
    nextIndex = (nextIndex + 1) % DOODLE_COUNT;
  }
  activeIndex = nextIndex;

  const doodle = doodleRefs.value[activeIndex];
  const paths = allPreparedPaths.value[activeIndex];
  if (!doodle?.svg || !paths?.length) return;

  // [NOTE] Resetear TODOS los doodles antes de animar. Esto mata cualquier
  // erasePaths.onComplete pendiente que pudiera sobrescribir strokeDashoffset
  // mientras la nueva animación ya está corriendo (race condition de hover rápido).
  for (let i = 0; i < DOODLE_COUNT; i++) {
    const d = doodleRefs.value[i];
    const p = allPreparedPaths.value[i];
    if (d?.svg && p?.length) resetPaths(d.svg, p);
  }

  const tl = gsap.timeline();
  addDrawAnimation(tl, {
    svg: doodle.svg,
    paths,
    duration: 1.2,
    stagger: 0.05,
    ease: 'power2.out',
  });
};

const erase = () => {
  if (activeIndex < 0) return;

  const doodle = doodleRefs.value[activeIndex];
  const paths = allPreparedPaths.value[activeIndex];
  if (!doodle?.svg || !paths?.length) return;

  erasePaths(doodle.svg, paths);
  activeIndex = -1;
};

// [FIX] Cleanup GSAP tweens al desmontar para evitar memory leaks
onUnmounted(() => {
  for (let i = 0; i < DOODLE_COUNT; i++) {
    const doodle = doodleRefs.value[i];
    const paths = allPreparedPaths.value[i];
    if (doodle?.svg && paths?.length) {
      gsap.killTweensOf(doodle.svg);
      paths.forEach((p) => gsap.killTweensOf(p));
    }
  }
});
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
        :stroke-width="strokeWidth"
        :stroke-color="strokeColor"
        :ref="setDoodleRef(0)"
        class="absolute left-0 top-0 w-full opacity-0"
      />
      <DoodleUnderlineGeneral2
        :stroke-width="strokeWidth"
        :stroke-color="strokeColor"
        :ref="setDoodleRef(1)"
        class="absolute left-0 top-0 w-full opacity-0"
      />
    </span>
  </span>
</template>
