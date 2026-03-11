<script setup lang="ts">
/**
 * █ [PROSE] :: PROSE A (LINK)
 * =====================================================================
 * DESC:   Override de <a>. NuxtLink para internos, target blank para
 *         externos. El icono externo (↗) es un doodle dibujado con
 *         stroke-dash al hacer hover — mismo sistema que los doodles
 *         del resto del portfolio.
 * =====================================================================
 */

import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  href: string;
  target?: string | null;
}>();

const isInternal = computed(() => props.href.startsWith('/') || props.href.startsWith('#'));

// =============================================================================
// █ DOODLE — solo para links externos
// =============================================================================
const { preparePaths, addDrawAnimation, erasePaths } = useDoodleDraw();

const iconRef = ref<SVGSVGElement | null>(null);
let paths: SVGPathElement[] = [];
let isAnimating = false;

onMounted(() => {
  // [NOTE] iconRef solo existe en el branch externo — null en links internos
  paths = preparePaths(iconRef.value);
});

onUnmounted(() => {
  if (iconRef.value) gsap.killTweensOf(iconRef.value);
  paths.forEach((p) => gsap.killTweensOf(p));
});

function draw() {
  if (!iconRef.value || !paths.length || isAnimating) return;
  isAnimating = true;
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
    },
  });
  addDrawAnimation(tl, {
    svg: iconRef.value,
    paths,
    duration: 0.28,
    stagger: 0.06,
    ease: 'power2.out',
    proportional: true,
  });
}

function erase() {
  if (!iconRef.value || !paths.length) return;
  erasePaths(iconRef.value, paths, { duration: 0.15 });
  isAnimating = false;
}
</script>

<template>
  <!-- Link interno: NuxtLink para SPA, sin icono -->
  <NuxtLink
    v-if="isInternal"
    :to="href"
    class="text-inherit decoration-foreground/25 transition-colors duration-200 hover:text-accent hover:decoration-accent"
  >
    <slot />
  </NuxtLink>

  <!-- Link externo: target blank + doodle ↗ dibujado al hover -->
  <a
    v-else
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="text-inherit decoration-foreground/25 transition-colors duration-200 hover:text-accent hover:decoration-accent"
    @mouseenter="draw"
    @mouseleave="erase"
  >
    <slot />

    <!-- Flecha ↗ hand-drawn: shaft diagonal + esquina superior-derecha -->
    <svg
      ref="iconRef"
      viewBox="0 0 13 13"
      fill="none"
      width="12"
      height="12"
      class="inline-block align-middle ml-[0.25em] -translate-y-[0.05em]"
      style="overflow: visible"
    >
      <!-- Shaft diagonal -->
      <path
        d="M2,11 C5,8 7.5,5.5 11,2"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <!-- Esquina L: horizontal top + vertical right -->
      <path
        d="M6.5,1.8 C8,1.9 9.5,1.9 11,2 C11,3.5 11,5 11,6.5"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </a>
</template>
