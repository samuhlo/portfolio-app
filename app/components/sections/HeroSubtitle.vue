<script setup lang="ts">
/**
 * █ [FEATURE] :: HERO SUBTITLE
 * =====================================================================
 * DESC:   Subtítulo del Hero que se tacha y escribe nuevas palabras
 *         animadas por GSAP al hacer scroll. Los SVGs de cada palabra
 *         viven en componentes dedicados bajo ui/doodles/.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted, watch, nextTick } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import type { DoodleExposed } from '~/types/doodle';
import { BREAKPOINTS } from '~/config/site';

const { gsap, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();
const { isPending } = useMobileMenuNavigationGate();

const containerRef = ref<HTMLElement | null>(null);

// Refs a los componentes doodle
const crosslineRef = ref<DoodleExposed | null>(null);
const frontRef = ref<DoodleExposed | null>(null);
const backRef = ref<DoodleExposed | null>(null);
const designRef = ref<DoodleExposed | null>(null);
const uxuiRef = ref<DoodleExposed | null>(null);
const aiRef = ref<DoodleExposed | null>(null);
const brandRef = ref<DoodleExposed | null>(null);

// CONFIGURACIÓN DE LAYOUT Y ANIMACIÓN =============================
// Posiciones y tamaños de cada SVG.
// Usamos % para posición y 'em' para tamaño (escala con el font-size del contenedor).
const LAYOUT = {
  crossline: { top: '50%', left: '-5%', width: '110%' },
  front: { bottom: '150%', right: '75%', width: '3.5em' },
  back: { bottom: '120%', right: '30%', width: '3em' },
  design: { bottom: '110%', left: '70%', width: '4em' },
  uxui: { top: '60%', left: '95%', width: '2.5em' },
  ai: { top: '2%', right: '30%', width: '1.2em' },
  brand: { top: '120%', left: '40%', width: '3.5em' },
};

const TIMING = {
  delayArranque: 0.5,
  duracionTachon: 1,
  duracionPalabra: 0.6,
  solapamiento: '-=0.6' as gsap.Position,
  staggerTrazos: 0.2,
};
// =============================================================

const buildTimeline = (): gsap.core.Timeline => {
  const tl = gsap.timeline({ paused: true });

  const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`).matches;

  const currentTiming = isMobile
    ? {
        delayArranque: 0.1,
        duracionTachon: 0.3,
        duracionPalabra: 0.2,
        solapamiento: '-=0.2' as gsap.Position,
        staggerTrazos: 0.05,
      }
    : TIMING;

  // Obtener elementos SVG de los componentes
  const crossSvg = crosslineRef.value?.svg ?? null;
  const frontSvg = frontRef.value?.svg ?? null;
  const backSvg = backRef.value?.svg ?? null;
  const designSvg = designRef.value?.svg ?? null;
  const uxuiSvg = uxuiRef.value?.svg ?? null;
  const aiSvg = aiRef.value?.svg ?? null;
  const brandSvg = brandRef.value?.svg ?? null;

  // Preparar paths de todos los SVGs
  const crossPaths = preparePaths(crossSvg);
  const frontPaths = preparePaths(frontSvg);
  const backPaths = preparePaths(backSvg);
  const designPaths = preparePaths(designSvg);
  const uxuiPaths = preparePaths(uxuiSvg);
  const aiPaths = preparePaths(aiSvg);
  const brandPaths = preparePaths(brandSvg);

  // Primero el tachón
  if (crossSvg && crossPaths.length) {
    addDrawAnimation(tl, {
      svg: crossSvg,
      paths: crossPaths,
      duration: currentTiming.duracionTachon,
      ease: 'power2.out',
      position: currentTiming.delayArranque,
    });
  }

  // Luego las palabras dibujadas secuencialmente
  const wordGroups = [
    { svg: frontSvg, paths: frontPaths },
    { svg: backSvg, paths: backPaths },
    { svg: designSvg, paths: designPaths },
    { svg: uxuiSvg, paths: uxuiPaths },
    { svg: aiSvg, paths: aiPaths },
    { svg: brandSvg, paths: brandPaths },
  ];

  wordGroups.forEach((group) => {
    if (group.svg && group.paths.length) {
      addDrawAnimation(tl, {
        svg: group.svg,
        paths: group.paths,
        duration: currentTiming.duracionPalabra,
        stagger: currentTiming.staggerTrazos,
        position: currentTiming.solapamiento,
      });
    }
  });

  return tl;
};

let subtitleTimeline: gsap.core.Timeline | null = null;
let entryAnimated = false;

const runEntryAnimation = (): void => {
  if (entryAnimated) return;

  const doAnimation = () => {
    if (!containerRef.value || entryAnimated) return;
    entryAnimated = true;

    // [CORE] El elemento ya está oculto por CSS (opacity:0, translate3d).
    // Solo necesitamos revelarlo.
    gsap.to(containerRef.value, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.45,
      ease: 'power3.inOut',
      clearProps: 'opacity,transform',
    });
  };

  if (isPending.value) {
    const stop = watch(isPending, (pending) => {
      if (!pending) {
        nextTick(doAnimation);
        stop();
      }
    });
    return;
  }

  nextTick(doAnimation);
};

const ensureSubtitleTimeline = (): gsap.core.Timeline | null => {
  if (subtitleTimeline) return subtitleTimeline;

  initGSAP(() => {
    subtitleTimeline = buildTimeline();
  });

  return subtitleTimeline;
};

onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => {
      ensureSubtitleTimeline();
      runEntryAnimation();
    });
  });
});

// HeroSection accede a este timeline para controlarlo con su ScrollTrigger unificado
defineExpose({
  getTimeline: ensureSubtitleTimeline,
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative inline-flex flex-col items-center select-none text-[clamp(1.25rem,3vw,3.5rem)]"
    style="opacity: 0; transform: translate3d(0, 45px, 0)"
  >
    <!-- Texto base -->
    <h2 ref="textRef" class="font-bold text-center md:text-left tracking-tight relative">
      Front-end Developer

      <!-- Crossline -->
      <DoodleCrossline
        ref="crosslineRef"
        class="absolute -translate-y-1/2 pointer-events-none opacity-0"
        :style="LAYOUT.crossline"
      />
    </h2>

    <!-- Palabras dibujadas alrededor del texto -->
    <DoodleWordFront
      ref="frontRef"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="LAYOUT.front"
    />
    <DoodleWordBack
      ref="backRef"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="LAYOUT.back"
    />
    <DoodleWordDesign
      ref="designRef"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="LAYOUT.design"
    />
    <DoodleWordUxui
      ref="uxuiRef"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="LAYOUT.uxui"
    />
    <DoodleWordAi
      ref="aiRef"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="LAYOUT.ai"
    />
    <DoodleWordBrand
      ref="brandRef"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="LAYOUT.brand"
    />
  </div>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
