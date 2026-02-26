<script setup lang="ts">
/**
 * █ [LAYOUT] :: APP NAV
 * =====================================================================
 * DESC:   Navegación principal superior (Fixed).
 *         Se oculta al hacer scroll hacia abajo y reaparece al subir.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, onMounted } from 'vue';

const { gsap, ScrollTrigger, initGSAP } = useGSAP();

const navRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!navRef.value) return;

  initGSAP(() => {
    /** [NOTE] showAnim define la transición de entrada del nav completo.
     *  ScrollTrigger detecta la dirección y ejecuta play/reverse.
     */
    const showAnim = gsap
      .from(navRef.value!, {
        yPercent: -100,
        duration: 0.35,
        ease: 'power2.out',
        paused: true,
      })
      .progress(1);

    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.play();
        } else {
          showAnim.reverse();
        }
      },
    });
  }, navRef.value);
});
</script>

<template>
  <nav
    ref="navRef"
    class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:px-12 w-full"
  >
    <div class="flex gap-8 text-xs md:text-sm uppercase tracking-widest font-medium">
      <RandomDoodleHover>
        <NuxtLink to="/" class="hover:font-bold transition-opacity">Home</NuxtLink>
      </RandomDoodleHover>
      <RandomDoodleHover>
        <NuxtLink to="/" class="hover:font-bold transition-opacity">Logs</NuxtLink>
      </RandomDoodleHover>
    </div>
    <div class="text-xs md:text-sm uppercase tracking-widest font-medium">
      <RandomDoodleHover>
        <NuxtLink to="mailto:hola@samuhlo.dev" class="hover:font-bold transition-opacity"
          >Contact</NuxtLink
        >
      </RandomDoodleHover>
    </div>
  </nav>
</template>
