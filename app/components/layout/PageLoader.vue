<script setup lang="ts">
/**
 * █ [UI_ATOM] :: PAGE LOADER
 * =====================================================================
 * DESC:   Overlay fullscreen que oculta la página durante la hidratación
 *         y la inicialización de GSAP. Evita el FOUC del Hero.
 *         Solo CSS — sin dependencias de GSAP para funcionar antes de su carga.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, watch } from 'vue';

interface Props {
  visible: boolean;
}
const props = defineProps<Props>();

// CONTROLAR CICLO DE VIDA -> Primero fade-out, luego desmontar del DOM
const shouldRender = ref(props.visible);
const isLeaving = ref(false);

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      // INICIAR FADE-OUT -> Al terminar la transición CSS, desmontamos
      isLeaving.value = true;
    }
  },
);

function handleTransitionEnd() {
  if (isLeaving.value) {
    shouldRender.value = false;
  }
}
</script>

<template>
  <div
    v-if="shouldRender"
    class="fixed inset-0 z-50 flex items-center justify-center bg-background"
    :class="{ 'loader-leaving': isLeaving }"
    @transitionend="handleTransitionEnd"
  >
    <!-- Punto pulsante — misma identidad del "." del HeroTitle -->
    <span
      class="loader-dot text-foreground font-black text-6xl md:text-8xl select-none"
      aria-hidden="true"
      >.</span
    >
  </div>
</template>

<style scoped>
.fixed {
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}

.loader-leaving {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

/* Pulsación del punto */
.loader-dot {
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
