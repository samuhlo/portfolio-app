<script setup lang="ts">
/**
 * █ [FEATURE] :: HERO TITLE
 * =====================================================================
 * DESC:   Título animado principal. Manipula nodos DOM con GSAP ScrollTrigger.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

const { gsap, initGSAP } = useGSAP();
const { preparePaths } = useDoodleDraw();

// =========================================================================
// CONFIGURACIÓN VISUAL Y DE ANIMACIÓN
// Ajusta estos valores para modificar el tamaño, posición de la letra "h",
// el hueco que se crea y los tiempos de la animación sin tocar la lógica.
// =========================================================================
const ANIMATION_CONFIG = {
  // [NOTE] El tamaño y posición de la "h" se definen en CSS em en el template.
  // Solo conservamos el ancho del hueco (gapWidth) y los tiempos.

  // Tamaño del hueco al empujar las letras L y O. (El usuario ajustó a 0.85)
  gapWidth: 0.85,

  // --- ANIMACIONES ---
  durations: {
    bump: 0.25,
    fall: 0.7,
    push: 0.5,
    draw: 0.85,
    dotFadIn: 0.3,
  },

  // Rotaciones aleatorizadas
  rotationsBump: [-8, 12, 0, -15, 8, -12],
  rotationsFall: [-40, 60, 0, -80, 50, -70],
};
// =========================================================================

const containerRef = ref<HTMLElement | null>(null);
const dotRef = ref<HTMLElement | null>(null);

// Ref al componente DoodleH (expone { svg: Ref<SVGSVGElement> })
interface DoodleExposed {
  svg: SVGSVGElement | null;
}
const doodleHRef = ref<DoodleExposed | null>(null);
const hWrapRef = ref<HTMLElement | null>(null);

// Caen
const letraE1 = ref<HTMLElement | null>(null);
const letraL1 = ref<HTMLElement | null>(null);
const espacioRef = ref<HTMLElement | null>(null);
const letraP = ref<HTMLElement | null>(null);
const letraE2 = ref<HTMLElement | null>(null);
const letraZ = ref<HTMLElement | null>(null);

const buildTimeline = (): gsap.core.Timeline => {
  const fallingEls = [
    letraE1.value,
    letraL1.value,
    espacioRef.value,
    letraP.value,
    letraE2.value,
    letraZ.value,
  ];

  const tl = gsap.timeline({ paused: true });

  // 1. GOLPECITO (pierden equilibrio)
  tl.to(fallingEls, {
    y: '-10px',
    rotation: (i: number) => ANIMATION_CONFIG.rotationsBump[i] ?? 0,
    duration: ANIMATION_CONFIG.durations.bump,
    ease: 'power2.out',
    stagger: 0.02,
  });

  // 2. CAÍDA Y GRAVEDAD
  tl.to(
    fallingEls,
    {
      y: '120vh',
      rotation: (i: number) => ANIMATION_CONFIG.rotationsFall[i] ?? 0,
      duration: ANIMATION_CONFIG.durations.fall,
      ease: 'power3.in',
      stagger: 0.04,
    },
    '-=0.1',
  );

  // 3. EMPUJAR BLOQUES PARA HACER SITIO
  tl.to(
    fallingEls,
    {
      width: 0,
      opacity: 0,
      duration: ANIMATION_CONFIG.durations.push,
      ease: 'back.out(1)',
    },
    '+=0',
  ).to(
    hWrapRef.value,
    {
      // [NOTE] Usamos 'em' (en lugar de píxeles) para que el hueco escale
      // automáticamente con el font-size al redimensionar la ventana.
      width: `${ANIMATION_CONFIG.gapWidth}em`,
      duration: ANIMATION_CONFIG.durations.push,
      ease: 'back.out(1)',
    },
    '<',
  );

  // 4. BOLÍGRAFO MÁGICO (DIBUJA LA H) Y EL PUNTO
  const hSvg = doodleHRef.value?.svg ?? null;
  const hPaths = preparePaths(hSvg);

  if (hSvg) {
    tl.to(hSvg, { opacity: 1, duration: 0.01 }, '-=0.1');
  }

  if (hPaths.length) {
    tl.to(hPaths, {
      strokeDashoffset: 0,
      visibility: 'visible',
      duration: ANIMATION_CONFIG.durations.draw,
      ease: 'power2.inOut',
    });
  }

  tl.to(
    dotRef.value,
    {
      opacity: 1,
      duration: ANIMATION_CONFIG.durations.dotFadIn,
      ease: 'power2.inOut',
    },
    '-=0.5',
  );

  return tl;
};

// El timeline se almacena y expone para que HeroSection pueda controlarlo
let titleTimeline: gsap.core.Timeline | null = null;

onMounted(() => {
  initGSAP(() => {
    titleTimeline = buildTimeline();

    // Animación de entrada: el título aparece al cargar la página
    // El scroll timeline arranca desde este estado final
    gsap.from(containerRef.value, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
    });
  });
});

// HeroSection accede al timeline para controlarlo con un único ScrollTrigger
defineExpose({
  getTimeline: () => titleTimeline,
});
</script>

<template>
  <!--
    [NOTE] Arquitectura:
    - Estado inicial: . (oculto) S A M U E(cae) L(cae) _(cae) L O P(cae) E(cae) Z(cae)
    - Al caer las letras, reducimos su width a 0 (el flex colapsa "haciendo sitio").
    - Se anima el anchor (hWrap) aumentando ligeramente su width.
    - Se dibuja la "h" con un clipPath que crece de L->R
  -->
  <div
    ref="containerRef"
    class="relative inline-flex items-baseline leading-none select-none"
    style="overflow: visible; gap: 0"
  >
    <!-- Punto oculto (revelado después) -->
    <span
      ref="dotRef"
      class="font-black"
      style="color: var(--color-foreground, #0f0a0a); opacity: 0"
      aria-hidden="true"
      >.</span
    >

    <!-- Fijas -->
    <span class="font-black">S</span>
    <span class="font-black">A</span>
    <span class="font-black">M</span>
    <span class="font-black">U</span>

    <!-- Cae 1 -->
    <span ref="letraE1" class="font-black inline-block shrink-0 origin-bottom">E</span>
    <span ref="letraL1" class="font-black inline-block shrink-0 origin-bottom">L</span>
    <span ref="espacioRef" class="inline-block shrink-0" style="min-width: 0.2em" aria-hidden="true"
      >&nbsp;</span
    >

    <!-- Wrapper para la "h" entre U y L. Crece cuando empujamos los bloques -->
    <span
      ref="hWrapRef"
      class="relative inline-block h-0 pointer-events-none"
      style="width: 0; z-index: 10; overflow: visible"
    >
      <DoodleH
        ref="doodleHRef"
        class="absolute"
        style="
          opacity: 0;
          pointer-events: none;
          width: 1.22em;
          height: 1.35em;
          top: -1.3em;
          left: 50%;
          transform: translateX(-56%);
        "
      />
    </span>

    <!-- Fijas -->
    <span class="font-black">L</span>
    <span class="font-black">O</span>

    <!-- Cae 2 -->
    <span ref="letraP" class="font-black inline-block shrink-0 origin-bottom">P</span>
    <span ref="letraE2" class="font-black inline-block shrink-0 origin-bottom">E</span>
    <span ref="letraZ" class="font-black inline-block shrink-0 origin-bottom">Z</span>
  </div>
</template>

<style scoped>
div {
  overflow: visible;
}
/* Evitar espacios raros o white-space si colapsamos a 0 */
.inline-block {
  white-space: nowrap;
}
</style>
