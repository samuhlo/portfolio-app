<script setup lang="ts">
/**
 * █ [LAYOUT] :: APP NAV
 * =====================================================================
 * DESC:   Navegación principal superior (Fixed).
 *         Se oculta al hacer scroll hacia abajo y reaparece al subir.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { SITE } from '~/config/site';

const { gsap, initGSAP } = useGSAP();
const localePath = useLocalePath();
const { $lenis } = useNuxtApp() as any;

const navRef = ref<HTMLElement | null>(null);
let cleanupLenis: (() => void) | null = null;

onMounted(() => {
  if (!navRef.value) return;

  initGSAP(() => {
    const showAnim = gsap
      .from(navRef.value!, {
        yPercent: -100,
        duration: 0.35,
        ease: 'power2.out',
        paused: true,
      })
      .progress(1);

    // [NOTE] Lenis directo en lugar de ScrollTrigger — evita el race condition
    // de primera carga donde ScrollTrigger aún no recibe eventos de Lenis.
    // scroll > 80 previene ocultar el nav en micro-scrolls al tope de la página.
    const handler = ({ scroll, direction }: { scroll: number; direction: number }) => {
      if (direction === 1 && scroll > 80) {
        showAnim.reverse();
      } else if (direction === -1) {
        showAnim.play();
      }
    };

    $lenis?.on('scroll', handler);
    cleanupLenis = () => $lenis?.off('scroll', handler);
  }, navRef.value);
});

onUnmounted(() => {
  cleanupLenis?.();
});
</script>

<template>
  <nav
    ref="navRef"
    role="navigation"
    aria-label="Main navigation"
    class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:px-12 w-full"
  >
    <div class="flex gap-8 text-xs md:text-sm uppercase tracking-widest font-medium">
      <RandomDoodleHover :stroke-width="3">
        <NuxtLink :to="localePath('/')" class="hover:font-bold transition-opacity">Home</NuxtLink>
      </RandomDoodleHover>
      <RandomDoodleHover :stroke-width="3">
        <NuxtLink :to="localePath('/blog')" class="hover:font-bold transition-opacity"
          >Logs</NuxtLink
        >
      </RandomDoodleHover>
    </div>
    <slot />

    <div class="text-xs md:text-sm uppercase tracking-widest font-medium">
      <RandomDoodleHover :stroke-width="3">
        <NuxtLink :to="`mailto:${SITE.email}`" class="hover:font-bold transition-opacity"
          >Contact</NuxtLink
        >
      </RandomDoodleHover>
    </div>
  </nav>
</template>
