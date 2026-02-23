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
    <span ref="letraU" class="font-black">U</span>

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
      <svg
        ref="hSvgRef"
        viewBox="0 0 283 309"
        class="absolute"
        style="opacity: 0; pointer-events: none; overflow: visible"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <g transform="matrix(1,0,0,1,-1592.318648,-729.828613)">
          <path
            ref="hPathRef"
            d="M1610.819,982.62C1659.384,946.61 1669.392,941.37 1704.585,910C1723.756,892.913 1794.526,818.542 1789.224,764.617C1786.439,736.29 1759.267,738.627 1714.275,822.739C1684.521,878.364 1622.776,1018.05 1679.444,1020.219C1700.227,1021.014 1798.139,881.45 1813.827,893.53C1829.418,905.536 1759.602,1023.83 1806.973,1015.531C1818.625,1013.49 1822.113,1009.34 1856.315,987.878"
            fill="none"
            stroke="var(--color-accent, #ffca40)"
            stroke-width="37"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
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

<script setup lang="ts">
/**
 * █ [FEATURE] :: HERO TITLE
 * =====================================================================
 * DESC:   Título animado principal. Manipula nodos DOM con GSAP ScrollTrigger.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// CONFIGURACIÓN VISUAL Y DE ANIMACIÓN
// Ajusta estos valores para modificar el tamaño, posición de la letra "h",
// el hueco que se crea y los tiempos de la animación sin tocar la lógica.
// =========================================================================
const ANIMATION_CONFIG = {
  // --- TAMAÑO Y POSICIONAMIENTO DE LA "h" ---
  // Escala de la "h" relativa al tamaño de la fuente.
  // (El usuario ajustó a 1.35)
  hScale: 1.35,

  // Offset vertical de la "h" respecto a su base.
  // Valores mayores suben más la letra. (El usuario ajustó a 0.67)
  hTopOffset: 0.67,

  // Offset horizontal de la "h".
  // -50 la centra perfectamente. Menos de -50 la tira hacia la izquierda.
  hLeftOffsetPercent: -56,

  // Tamaño del hueco al empujar las letras L y O. (El usuario ajustó a 0.9)
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

// Fijos mid
const letraU = ref<HTMLElement | null>(null);
const hWrapRef = ref<HTMLElement | null>(null);
const hSvgRef = ref<SVGSVGElement | null>(null);
const hPathRef = ref<SVGPathElement | null>(null);

// Caen
const letraE1 = ref<HTMLElement | null>(null);
const letraL1 = ref<HTMLElement | null>(null);
const espacioRef = ref<HTMLElement | null>(null);
const letraP = ref<HTMLElement | null>(null);
const letraE2 = ref<HTMLElement | null>(null);
const letraZ = ref<HTMLElement | null>(null);

let scrollTriggerInstance: ScrollTrigger | null = null;
let calculatedFontSize = 0;

/**
 * Prepara el SVG "h": calcula el tamaño alineado a la fuente base
 * y usa los valores de ANIMATION_CONFIG para su posicionamiento.
 */
const prepareSvgStroke = (): void => {
  const u = letraU.value;
  const svg = hSvgRef.value;
  if (!u || !svg) return;

  calculatedFontSize = parseFloat(getComputedStyle(u).fontSize);

  // Reducimos o escalamos la 'h' dependiendo del config
  const svgH = calculatedFontSize * ANIMATION_CONFIG.hScale;
  const svgW = svgH * (280 / 311);
  const capH = calculatedFontSize * 0.72;

  gsap.set(svg, {
    width: svgW,
    height: svgH,
    left: '50%', // Centrado geométrico inicial
    xPercent: ANIMATION_CONFIG.hLeftOffsetPercent, // Offset a la izquierda controlable
    // Usamos capH de la "U" para alinear bases + desplazamiento extra hacia arriba
    top: -(svgH - capH) - calculatedFontSize * ANIMATION_CONFIG.hTopOffset,
  });

  if (hPathRef.value) {
    // Sumamos 10px de margen (dash) extra para asegurar que cubre
    // y pinta todo el trazo sin cortar la redondez final por errores de subpíxel.
    const length = hPathRef.value.getTotalLength() + 10;
    gsap.set(hPathRef.value, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
  }
};

const buildTimeline = (): void => {
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
  // Las letras caídas colapsan su anchura a 0, haciendo "vacío".
  // A la vez, hWrapRef crece un ancho igual al gap configurado.
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
      width: calculatedFontSize * ANIMATION_CONFIG.gapWidth,
      duration: ANIMATION_CONFIG.durations.push,
      ease: 'back.out(1)',
    },
    '<',
  );

  // 4. BOLÍGRAFO MÁGICO (DIBUJA LA H) Y EL PUNTO
  // Revelamos la opacidad de golpe para empezar a dibujar
  tl.to(hSvgRef.value, { opacity: 1, duration: 0.01 }, '-=0.1');

  // Animamos el trazo perfecto midiendo la longitud del SVG
  if (hPathRef.value) {
    tl.to(hPathRef.value, {
      strokeDashoffset: 0,
      duration: ANIMATION_CONFIG.durations.draw,
      ease: 'power2.inOut',
    });
  }

  // Aparece el punto
  tl.to(
    dotRef.value,
    {
      opacity: 1,
      duration: ANIMATION_CONFIG.durations.dotFadIn,
      ease: 'power2.inOut',
    },
    '-=0.5',
  );

  // Obtenemos la sección padre para fijarla entera
  const parentSection = containerRef.value?.closest('section') || containerRef.value;

  let isCompleted = false;

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: parentSection,
    start: 'top top',
    end: '+=1500', // 1500px de scroll hasta completar la animación
    pin: true, // Fija la pantalla en el sitio
    // Quitamos la unión directa para evitar que rebobine cuando vuelve arriba
    onUpdate: (self) => {
      if (isCompleted) return; // Ya terminó, se queda fijo en su final

      gsap.to(tl, {
        progress: self.progress,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      if (self.progress >= 1) {
        isCompleted = true;
      }
    },
  });
};

onMounted(() => {
  prepareSvgStroke();
  buildTimeline();
});

onUnmounted(() => {
  scrollTriggerInstance?.kill();
});
</script>

<style scoped>
div {
  overflow: visible;
}
/* Evitar espacios raros o white-space si colapsamos a 0 */
.inline-block {
  white-space: nowrap;
}
</style>
