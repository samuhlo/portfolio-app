<template>
  <div class="noise-overlay" aria-hidden="true" />
</template>

<script setup lang="ts">
/**
 * █ [UI_ATOM] :: NOISE BACKGROUND
 * =====================================================================
 * DESC:   Capa overlay interactiva para generar ruido/grano de celuloide.
 * STATUS: STABLE
 * =====================================================================
 */
import { computed } from 'vue';

interface NoiseBackgroundProps {
  /** Opacidad del ruido. 0 = invisible, 1 = opaco total. */
  opacity?: number;
  /** Tamaño del grano. Valores altos = grano fino. Valores bajos = grano grueso. */
  baseFrequency?: number;
  /** Mix blend mode CSS. 'screen' para fondos oscuros, 'multiply' para fondos claros. */
  blendMode?: string;
  /** Velocidad de la animación en segundos. Más bajo = más frenético. */
  speed?: number;
}

const props = withDefaults(defineProps<NoiseBackgroundProps>(), {
  opacity: 0.25,
  baseFrequency: 0.65,
  blendMode: 'screen',
  speed: 0.35,
});

// [NOTE] Generamos el noise como SVG inline en base64. Es equivalente a tener un noise.png
// pero sin necesidad de un asset externo, y reactivo a cambios de props.
const noiseUrl = computed(() => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='${props.baseFrequency}' numOctaves='4' stitchTiles='stitch'/>
    </filter>
    <rect width='200' height='200' filter='url(#n)' opacity='1'/>
  </svg>`;

  return `url("data:image/svg+xml;base64,${btoa(svg)}")`;
});
</script>

<style scoped>
.noise-overlay {
  position: fixed;
  inset: 0;
  /* Elemento más grande que la pantalla para que los saltos de la animación no dejen huecos */
  top: -10rem;
  left: -10rem;
  width: calc(100% + 20rem);
  height: calc(100% + 20rem);
  pointer-events: none;
  z-index: 9999;
  opacity: v-bind('props.opacity');
  mix-blend-mode: v-bind('props.blendMode');
  background-image: v-bind(noiseUrl);
  background-repeat: repeat;
  /* steps(2) = el efecto clave: los saltos son bruscos (como grano de celuloide), no suaves */
  animation: grain v-bind('`${props.speed}s`') steps(2) infinite;
}

@keyframes grain {
  0% {
    transform: translate3d(0, 9rem, 0);
  }
  10% {
    transform: translate3d(-1rem, -4rem, 0);
  }
  20% {
    transform: translate3d(-8rem, 2rem, 0);
  }
  30% {
    transform: translate3d(9rem, -9rem, 0);
  }
  40% {
    transform: translate3d(-2rem, 7rem, 0);
  }
  50% {
    transform: translate3d(-9rem, -4rem, 0);
  }
  60% {
    transform: translate3d(2rem, 6rem, 0);
  }
  70% {
    transform: translate3d(7rem, -8rem, 0);
  }
  80% {
    transform: translate3d(-9rem, 1rem, 0);
  }
  90% {
    transform: translate3d(6rem, -5rem, 0);
  }
  100% {
    transform: translate3d(-7rem, 0, 0);
  }
}
</style>
