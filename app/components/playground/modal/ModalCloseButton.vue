<script setup lang="ts">
/**
 * █ [UI_ATOM] :: MODAL CLOSE BUTTON
 * =====================================================================
 * DESC:   Botón de cierre con doodle X que se dibuja al hacer hover.
 *         Usa useDoodleDraw para la animación stroke-dash.
 * =====================================================================
 */
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

interface Props {
  size?: 'sm' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
});

const emit = defineEmits<{
  close: [];
}>();

const positionClass = computed(() => (props.size === 'sm' ? 'top-6 right-6' : 'top-12 right-12'));

const buttonSize = computed(() => (props.size === 'sm' ? 'w-10 h-10' : 'w-14 h-14'));

// ---------------------------------------------------------------------------
// Doodle Draw Animation
// ---------------------------------------------------------------------------
interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const { preparePaths, addDrawAnimation } = useDoodleDraw();
const doodleRef = ref<DoodleExposed | null>(null);
let preparedPaths: SVGPathElement[] = [];
let isAnimating = false;

onMounted(() => {
  preparedPaths = preparePaths(doodleRef.value?.svg ?? null);
});

function draw() {
  if (isAnimating) return;
  isAnimating = true;

  const svg = doodleRef.value?.svg;
  if (!svg || !preparedPaths.length) {
    isAnimating = false;
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
    },
  });

  addDrawAnimation(tl, {
    svg,
    paths: preparedPaths,
    duration: 0.3,
    stagger: 0.08,
    ease: 'power2.out',
  });
}

function erase() {
  const svg = doodleRef.value?.svg;
  if (!svg || !preparedPaths.length) return;

  gsap.to(svg, {
    opacity: 0,
    duration: 0.2,
    ease: 'power1.in',
    onComplete: () => {
      preparedPaths.forEach((path) => {
        const length = path.getTotalLength() + 20;
        gsap.set(path, {
          strokeDashoffset: length,
          visibility: 'hidden',
        });
      });
      isAnimating = false;
    },
  });
}
</script>

<template>
  <button
    @click="emit('close')"
    @mouseenter="draw"
    @mouseleave="erase"
    :class="[positionClass, buttonSize]"
    class="absolute flex items-center justify-center cursor-pointer z-20 group"
    aria-label="Cerrar modal"
  >
    <!-- Doodle X (se dibuja en hover) -->
    <DoodleXCloseGeneral
      ref="doodleRef"
      class="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
    />

    <!-- Icono base (SVG líneas rectas) -->
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      class="stroke-background w-full h-full transition-opacity duration-200 group-hover:opacity-0"
    >
      <path d="M18 6L6 18M6 6l12 12" stroke-width="1.5" stroke-linecap="square" />
    </svg>
  </button>
</template>
