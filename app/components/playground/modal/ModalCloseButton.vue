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
  autoPlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  autoPlay: false,
});

const emit = defineEmits<{
  close: [];
}>();

const positionClass = computed(() => (props.size === 'sm' ? 'top-3 right-3' : 'top-8 right-8'));

// [NOTE] Superficie de hover más grande que el icono visual
const buttonSize = computed(() => (props.size === 'sm' ? 'w-12 h-12' : 'w-18 h-18'));

// ---------------------------------------------------------------------------
// Doodle Draw Animation
// ---------------------------------------------------------------------------
interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const { preparePaths, addDrawAnimation } = useDoodleDraw();
const doodleRef = ref<DoodleExposed | null>(null);
let preparedPaths: SVGPathElement[] = [];

onMounted(() => {
  preparedPaths = preparePaths(doodleRef.value?.svg ?? null);

  // [NOTE] En móvil, dibujar el doodle automáticamente al montar (no hay hover)
  if (props.autoPlay) {
    nextTick(() => {
      setTimeout(draw, 400);
    });
  }
});

function killAllTweens() {
  const svg = doodleRef.value?.svg;
  if (svg) gsap.killTweensOf(svg);
  preparedPaths.forEach((p) => gsap.killTweensOf(p));
}

function resetPaths() {
  const svg = doodleRef.value?.svg;
  if (!svg) return;
  gsap.set(svg, { opacity: 0 });
  preparedPaths.forEach((path) => {
    const length = path.getTotalLength() + 20;
    gsap.set(path, {
      strokeDashoffset: length,
      visibility: 'hidden',
    });
  });
}

function draw() {
  const svg = doodleRef.value?.svg;
  if (!svg || !preparedPaths.length) return;

  // [FIX] Matar cualquier animación pendiente y resetear antes de redibujar
  killAllTweens();
  resetPaths();

  const tl = gsap.timeline();

  addDrawAnimation(tl, {
    svg,
    paths: preparedPaths,
    duration: 0.3,
    stagger: 0.08,
    ease: 'power2.out',
  });
}

function erase() {
  // [NOTE] En autoPlay (mobile) el doodle queda permanente, no borrar
  if (props.autoPlay) return;

  const svg = doodleRef.value?.svg;
  if (!svg || !preparedPaths.length) return;

  killAllTweens();

  gsap.to(svg, {
    opacity: 0,
    duration: 0.2,
    ease: 'power1.in',
    onComplete: () => resetPaths(),
  });
}
</script>

<template>
  <button
    @click="emit('close')"
    @mouseenter="draw"
    @mouseleave="erase"
    :class="[positionClass, buttonSize]"
    class="absolute flex items-center justify-center cursor-pointer z-20 group p-3"
    aria-label="Cerrar modal"
  >
    <!-- Doodle X (se dibuja en hover) -->
    <DoodleXCloseGeneral
      ref="doodleRef"
      class="absolute inset-3 w-auto h-auto opacity-0 pointer-events-none"
    />

    <!-- Icono base (SVG líneas rectas) — oculto en autoPlay/mobile -->
    <svg
      v-if="!autoPlay"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      class="stroke-background w-full h-full transition-opacity duration-200 group-hover:opacity-0 p-1"
    >
      <path d="M18 6L6 18M6 6l12 12" stroke-width="1.5" stroke-linecap="square" />
    </svg>
  </button>
</template>
