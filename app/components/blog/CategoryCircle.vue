<script setup lang="ts">
/**
 * ========================================================================
 * [UI_ATOM] :: CATEGORY CIRCLE
 * ========================================================================
 * DESC:   Dibuja un círculo alrededor cuando está activo.
 *         Simple y robusto.
 * STATUS: STABLE
 * ========================================================================
 */

import { ref, watch, onMounted, nextTick } from 'vue';
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import DoodleCircleGeneral from '~/components/ui/doodles/general/DoodleCircleGeneral.vue';

const props = defineProps<{
  isActive: boolean;
  color: string;
}>();

const { preparePaths, addDrawAnimation, resetPaths, erasePaths } = useDoodleDraw();

const circleRef = ref<{ svg: SVGSVGElement | null } | null>(null);
const circlePaths = ref<SVGPathElement[]>([]);

// Pre-inicializar paths al montar: getTotalLength() se llama aquí,
// cuando el SVG ya está en el DOM y pintado, no en el primer click.
onMounted(async () => {
  await nextTick();
  if (!circleRef.value?.svg) return;
  circlePaths.value = preparePaths(circleRef.value.svg);
  if (props.isActive) {
    draw();
  }
});

// Animar
function draw() {
  if (!circleRef.value?.svg || !circlePaths.value.length) return;

  // Reset al estado inicial antes de redibujar
  resetPaths(circleRef.value.svg, circlePaths.value);

  const tl = gsap.timeline();
  addDrawAnimation(tl, {
    svg: circleRef.value.svg,
    paths: circlePaths.value,
    duration: 0.8,
    ease: 'power2.out',
  });
}

// Borrar
function erase() {
  if (!circleRef.value?.svg || !circlePaths.value.length) return;

  erasePaths(circleRef.value.svg, circlePaths.value, {
    duration: 0.15,
    ease: 'power2.in',
  });
}

watch(
  () => props.isActive,
  (active) => {
    if (active) {
      draw();
    } else {
      erase();
    }
  },
);
</script>

<template>
  <div class="category-circle-wrapper relative">
    <!-- Circle SVG - tamaño fijo para cubrir cualquier texto -->
    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
      :class="isActive ? 'opacity-100' : 'opacity-0'"
      style="width: 140px; height: 36px; margin-left: -12px"
    >
      <DoodleCircleGeneral
        ref="circleRef"
        class="w-full h-full"
        :stroke-color="color"
        :stroke-width="2"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.category-circle-wrapper div:first-child {
  transition: opacity 0.2s ease;
}

.category-circle-wrapper :deep(svg) {
  color: var(--color-accent, #ffca40);
}
</style>
