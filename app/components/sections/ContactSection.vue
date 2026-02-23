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

const TEXT = 'Contact';

const sectionRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { initPhysics, destroy } = usePhysicsLetters();

let observer: IntersectionObserver | null = null;
let triggered = false;

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
      syncCanvasSize();
      initPhysics(canvasRef.value, TEXT, { isMobile: canvasRef.value.width < 768 });
    }
  }
};

onMounted(() => {
  syncCanvasSize();

  observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.2,
  });

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
  destroy();
});
</script>

<template>
  <section
    ref="sectionRef"
    class="relative min-h-[80vh] bg-foreground text-background overflow-hidden"
  >
    <!-- Canvas que ocupa toda la sección — letras caen desde el tope -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
      style="color: var(--color-background, #f5f0e8)"
    />

    <!-- Links: en móvil se apilan a la derecha; en desktop grid de 3 columnas -->
    <div
      class="relative z-10 w-full py-10 px-6 md:px-12 font-bold tracking-widest md:mt-20 flex flex-col items-end gap-2 text-sm md:grid md:grid-cols-3 md:gap-0 md:text-[1.75rem] md:items-end md:h-full"
    >
      <!-- móvil: los 3 links apilados a la derecha -->
      <a
        href="mailto:hola@samuhlo.dev"
        class="hover:text-accent transition-colors md:text-left md:col-start-1 md:row-start-1"
      >
        hola@samuhlo.dev
      </a>
      <a
        href="#"
        class="hover:text-accent transition-colors md:text-center md:col-start-2 md:row-start-1"
      >
        github
      </a>
      <a
        href="#"
        class="hover:text-accent transition-colors md:text-right md:col-start-3 md:row-start-1"
      >
        linkedin
      </a>
    </div>
  </section>
</template>
