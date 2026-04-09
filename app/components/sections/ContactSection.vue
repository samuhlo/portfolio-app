<script setup lang="ts">
/**
 * █ [FEATURE] :: CONTACT SECTION
 * =====================================================================
 * DESC:   Sección de contacto interactiva. Despliega simulación 2D con Matter.js.
 *         Letras caen con física real. Click en email → slam effect.
 * USAGE:  Incluir como última section. Email link dispara slam().
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { usePhysicsLetters } from '~/composables/usePhysicsLetters';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import { SITE, BREAKPOINTS, COLORS } from '~/config/site';

const TEXT = 'Contact';

const sectionRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const circleDoodleRef = ref<{ svg: SVGSVGElement | null } | null>(null);

const { initPhysics, slam, pause, resume, destroy } = usePhysicsLetters();
const { gsap, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();

let observer: IntersectionObserver | null = null;
let triggered = false;
let circleAnimation: gsap.core.Timeline | null = null;

// [NOTE] threshold 0 → detecta salida del viewport para pausar la física.
// threshold 0.6 → dispara la caída inicial de letras cuando el 60% es visible.
const TRIGGER_THRESHOLD = 0.6;
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
    // [NOTE] Para el disparo inicial necesitamos que el ratio alcance el threshold.
    // Si la sección es más alta que el viewport, usamos el alto visible como fallback.
    const ratioOk =
      entry.intersectionRatio >= TRIGGER_THRESHOLD ||
      entry.intersectionRect.height >= window.innerHeight * TRIGGER_THRESHOLD;

    if (entry.isIntersecting && !triggered && canvasRef.value && ratioOk) {
      // Primera vez visible → iniciar física
      triggered = true;

      // [NOTE] Doble rAF para asegurar que el layout CSS está completamente calculado
      // antes de medir el canvas y lanzar la física.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncCanvasSize();

          if (canvasRef.value) {
            prevCanvasWidth = canvasRef.value.width;
            initPhysics(canvasRef.value, TEXT, {
              isMobile: canvasRef.value.width < BREAKPOINTS.mobile,
            });
          }

          if (circleAnimation) {
            circleAnimation.play();
          }
        });
      });
    } else if (triggered) {
      // Ya iniciada → pause/resume según visibilidad
      if (entry.isIntersecting) {
        resume();
      } else {
        pause();
      }
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
    if (Math.abs(newWidth - prevCanvasWidth) < 50) return;
    prevCanvasWidth = newWidth;

    destroy();
    syncCanvasSize();
    initPhysics(canvasRef.value, TEXT, { isMobile: canvasRef.value.width < BREAKPOINTS.mobile });
  }, RESIZE_DEBOUNCE_MS);
};

onMounted(async () => {
  // [NOTE] nextTick antes de preparePaths para que el DOM esté estable.
  // Sin esto el SVG aparece brevemente dibujado antes de que GSAP lo oculte
  // (mismo flick que tenía CategoryCircle en el primer click).
  await nextTick();

  let circlePaths: SVGPathElement[] = [];
  if (circleDoodleRef.value?.svg) {
    // [NOTE] multiplier 2.0 — este bezier complejo tiene un getTotalLength()
    // que subestima la longitud real, 1.05 no es suficiente para completar el trazo.
    circlePaths = preparePaths(circleDoodleRef.value.svg, 2.0);
  }

  syncCanvasSize();

  initGSAP(() => {
    if (circleDoodleRef.value?.svg && circlePaths.length) {
      // [NOTE] Animación pausada, se reproduce con delay tras IntersectionObserver
      circleAnimation = gsap.timeline({ paused: true, delay: 1.2 });
      addDrawAnimation(circleAnimation, {
        svg: circleDoodleRef.value.svg,
        paths: circlePaths,
        duration: 0.6,
        ease: 'power1.out',
      });
    }
  });

  observer = new IntersectionObserver(handleIntersection, {
    threshold: [0, TRIGGER_THRESHOLD],
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
  circleAnimation?.kill();
  circleAnimation = null;
  destroy();
});

const openMail = (): void => {
  slam();
  window.location.href = `mailto:${SITE.email}`;
};
</script>

<template>
  <section
    ref="sectionRef"
    class="relative min-h-[60vh] md:min-h-[80vh] bg-foreground text-background overflow-hidden"
  >
    <!-- Canvas que ocupa toda la sección — letras caen desde el tope -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full cursor-pointer"
      style="color: var(--color-background, #faf3f0)"
      @click="openMail"
    />

    <!-- Links: en móvil se apilan a la derecha; en desktop grid de 3 columnas -->
    <div
      class="relative z-10 w-full py-10 px-6 md:px-12 font-bold tracking-widest md:mt-20 flex flex-col items-end gap-4 text-sm md:grid md:grid-cols-3 md:gap-0 md:text-[1.75rem] md:items-end md:h-full"
    >
      <a :href="`mailto:${SITE.email}`" class="md:text-left md:col-start-1 md:row-start-1">
        <span class="relative inline-block w-fit">
          {{ SITE.email }}
          <DoodleCircleGeneral
            ref="circleDoodleRef"
            class="absolute top-1/2 left-1/2 w-[115%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />
        </span>
      </a>

      <RandomDoodleHover class="md:col-start-2 md:row-start-1 md:justify-self-center">
        <NuxtLink :to="SITE.github" target="_blank">github</NuxtLink>
      </RandomDoodleHover>
      <RandomDoodleHover class="md:col-start-3 md:row-start-1 md:justify-self-end">
        <NuxtLink :to="SITE.linkedin" target="_blank">linkedin</NuxtLink>
      </RandomDoodleHover>
    </div>
  </section>
</template>
