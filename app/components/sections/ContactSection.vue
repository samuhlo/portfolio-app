<script setup lang="ts">
/**
 * █ [FEATURE] :: CONTACT SECTION
 * =====================================================================
 * DESC:   Sección de contacto interactiva. Despliega simulación 2D con Matter.js.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { usePhysicsLetters } from '~/composables/usePhysicsLetters';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

const TEXT = 'Contact';

const sectionRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const circleDoodleRef = ref<{ svg: SVGSVGElement | null } | null>(null);

const { initPhysics, slam, destroy } = usePhysicsLetters();
const { gsap, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();

let observer: IntersectionObserver | null = null;
let triggered = false;
let circleAnimation: gsap.core.Timeline | null = null;

const syncCanvasSize = (): void => {
  const section = sectionRef.value;
  const canvas = canvasRef.value;
  if (!section || !canvas) return;

  // [NOTE] Se asignan los píxeles reales del section al canvas
  // para que el mundo físico use las dimensiones correctas
  canvas.width = section.clientWidth;
  canvas.height = section.clientHeight;
};

const handleIntersection: IntersectionObserverCallback = (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !triggered && canvasRef.value) {
      triggered = true;

      // [NOTE] Doble rAF para asegurar que el layout CSS está completamente calculado
      // antes de medir el canvas y lanzar la física.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncCanvasSize();

          if (canvasRef.value) {
            prevCanvasWidth = canvasRef.value.width;
            initPhysics(canvasRef.value, TEXT, { isMobile: canvasRef.value.width < 768 });
          }

          if (circleAnimation) {
            circleAnimation.play();
          }
        });
      });
    }
  }
};

// [NOTE] Debounce para el resize: destruye y re-inicia la simulación
// con las nuevas dimensiones para que las letras no queden deformadas.
// SOLO si el width cambió → ignora el hide/show de la barra de URL del móvil
// que solo modifica el height.
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let prevCanvasWidth = 0;
const RESIZE_DEBOUNCE_MS = 300;

const handleResize = (): void => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!triggered || !canvasRef.value || !sectionRef.value) return;

    const newWidth = sectionRef.value.clientWidth;
    if (newWidth === prevCanvasWidth) return;
    prevCanvasWidth = newWidth;

    destroy();
    syncCanvasSize();
    initPhysics(canvasRef.value, TEXT, { isMobile: canvasRef.value.width < 768 });
  }, RESIZE_DEBOUNCE_MS);
};

onMounted(() => {
  syncCanvasSize();

  initGSAP(() => {
    if (circleDoodleRef.value?.svg) {
      const paths = preparePaths(circleDoodleRef.value.svg);
      // [NOTE] Animación pausada, se reproduce con 1.5s de delay tras IntersectionObserver
      circleAnimation = gsap.timeline({ paused: true, delay: 0.6 });
      addDrawAnimation(circleAnimation, {
        svg: circleDoodleRef.value.svg,
        paths,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  });

  observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.9,
  });

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
  window.removeEventListener('resize', handleResize);
  if (resizeTimer) clearTimeout(resizeTimer);
  destroy();
});

const openMail = (): void => {
  slam();
  window.location.href = 'mailto:hola@samuhlo.dev';
};
</script>

<template>
  <section
    ref="sectionRef"
    class="relative min-h-[80vh] bg-foreground text-background overflow-hidden"
  >
    <!-- Canvas que ocupa toda la sección — letras caen desde el tope -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full cursor-pointer"
      style="color: var(--color-background, #f5f0e8)"
      @click="openMail"
    />

    <!-- Links: en móvil se apilan a la derecha; en desktop grid de 3 columnas -->
    <div
      class="relative z-10 w-full py-10 px-6 md:px-12 font-bold tracking-widest md:mt-20 flex flex-col items-end gap-4 text-sm md:grid md:grid-cols-3 md:gap-0 md:text-[1.75rem] md:items-end md:h-full"
    >
      <NuxtLink to="mailto:hola@samuhlo.dev" class="md:text-left md:col-start-1 md:row-start-1">
        <span class="relative inline-block w-fit">
          hola@samuhlo.dev
          <DoodleCircleGeneral
            ref="circleDoodleRef"
            class="absolute top-1/2 left-1/2 w-[115%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0"
          />
        </span>
      </NuxtLink>

      <RandomDoodleHover class="md:col-start-2 md:row-start-1 md:justify-self-center">
        <NuxtLink to="https://github.com/samuhlo" target="_blank">github</NuxtLink>
      </RandomDoodleHover>
      <RandomDoodleHover class="md:col-start-3 md:row-start-1 md:justify-self-end">
        <NuxtLink to="https://www.linkedin.com/in/samuhlo/" target="_blank">linkedin</NuxtLink>
      </RandomDoodleHover>
    </div>
  </section>
</template>
