<script setup lang="ts">
/**
 * █ [FEATURE] :: PLAYGROUND TITLE
 * =====================================================================
 * DESC:   Título principal de la Playground Section con el doodle
 *         "digitallab" animado mediante stroke-draw (GSAP) al entrar
 *         en viewport una sola vez. Queda fijo al terminar la animación.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

const { gsap, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();

interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const titleRef = ref<HTMLElement | null>(null);
const digitallabRef = ref<DoodleExposed | null>(null);

// CONFIGURACIÓN DE LAYOUT ==========================================
// Posición relativa al h2. Usa em para que escale con el font-size.
const LAYOUT = {
  // [NOTE] Ajusta bottom/right para alinear con la maqueta
  digitallab: { bottom: '-0.15em', right: '-0.2em', width: '2.5em' },
};

const TIMING = {
  duracion: 0.4,
  stagger: 0.12,
  ease: 'power3.out',
};
// ==================================================================

let observer: IntersectionObserver | null = null;

onMounted(() => {
  initGSAP(() => {
    const digitallabSvg = digitallabRef.value?.svg ?? null;
    if (!digitallabSvg || !titleRef.value) return;

    const paths = preparePaths(digitallabSvg);
    if (!paths.length) return;

    const tl = gsap.timeline({ paused: true });

    addDrawAnimation(tl, {
      svg: digitallabSvg,
      paths,
      duration: TIMING.duracion,
      stagger: TIMING.stagger,
      ease: TIMING.ease,
    });

    // [NOTE] Se desconecta al primer disparo para que la animación quede fija.
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          tl.play();
          observer?.disconnect();
          observer = null;
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(titleRef.value);
  });
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div class="relative inline-block self-start mb-16 md:mb-32">
    <h2
      ref="titleRef"
      class="text-[clamp(3rem,12vw,12rem)] leading-none font-black uppercase tracking-tighter relative"
    >
      Playground

      <!-- Doodle "digital lab" animado, posicionado relativo al h2 -->
      <DoodleDigitallabPlayground
        ref="digitallabRef"
        class="absolute h-auto pointer-events-none opacity-0"
        :style="LAYOUT.digitallab"
      />
    </h2>
  </div>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
