<script setup lang="ts">
/**
 * █ [FEATURE] :: ERROR PAGE
 * =====================================================================
 * DESC:   Página de error 404. Bloque "404" cae con Matter.js hasta
 *         mitad de pantalla, se dibuja DoodleWorking404General al
 *         estabilizarse, y botón "back" con RandomDoodleHover.
 * STATUS: STABLE
 * =====================================================================
 */
import type { NuxtError } from '#app';
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import { useErrorPhysics } from '~/composables/useErrorPhysics';

defineProps({
  error: Object as () => NuxtError,
});

// =============================================================================
// █ REFS Y STATE
// =============================================================================
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const doodleRef = ref<{ svg: SVGSVGElement | null } | null>(null);

// Tiempos para un efecto de escritura perfecto
const TIMING = {
  duracion: 0.2,
  stagger: 0.06,
  ease: 'power3.out',
};

const { preparePaths, addDrawAnimation } = useDoodleDraw();
let doodleTimeline: gsap.core.Timeline | null = null;

// =============================================================================
// █ CORE: PHYSICS
// =============================================================================
// [NOTE] La física de Matter.js ha sido extraída a un composable dedicado para
// mantener la vista limpia y mejorar la mantenibilidad.
const { textWidthPx } = useErrorPhysics(containerRef, canvasRef);

// =============================================================================
// █ NAVIGATION
// =============================================================================
const handleBack = (): void => {
  clearError({ redirect: '/' });
};

// =============================================================================
// █ LIFECYCLE
// =============================================================================
onMounted(() => {
  // PREPARAR DOODLE -> se anima independiente de la física desde el montaje
  if (doodleRef.value?.svg) {
    const paths = preparePaths(doodleRef.value.svg);
    doodleTimeline = gsap.timeline(); // Se reproduce instantáneamente
    addDrawAnimation(doodleTimeline, {
      svg: doodleRef.value.svg,
      paths,
      duration: TIMING.duracion,
      stagger: TIMING.stagger,
      ease: TIMING.ease,
    });
  }
});

onUnmounted(() => {
  if (doodleTimeline) {
    doodleTimeline.kill();
    doodleTimeline = null;
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full h-screen bg-background text-foreground overflow-hidden"
  >
    <!-- Canvas: mundo físico del bloque 404 -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
      style="color: var(--color-foreground, #0c0011)"
    />

    <!-- Doodle animado independiente centrado (escala con el texto 404) -->
    <div
      class="absolute pointer-events-none"
      :style="{
        width: `${textWidthPx}px`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }"
    >
      <DoodleNotFound ref="doodleRef" class="w-full" />
    </div>

    <!-- Botón back estático abajo -->
    <div class="absolute z-10 bottom-32 left-1/2 -translate-x-1/2">
      <RandomDoodleHover>
        <button
          class="text-foreground font-bold tracking-widest text-xl md:text-3xl cursor-pointer"
          @click="handleBack"
        >
          back
        </button>
      </RandomDoodleHover>
    </div>
  </div>
</template>
