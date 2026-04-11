<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: BLOG POST NAVIGATION
 * =====================================================================
 * DESC:   Navegación prev/next entre posts del blog.
 *         Al hacer hover, la flecha doodle se dibuja (draw-on via
 *         stroke-dashoffset) sobre el texto "Next"/"Previous",
 *         ocultándolo visualmente.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, onMounted } from 'vue';
import { type BlogPost, type BlogCategory, CATEGORY_COLORS } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import DoodleArrowRightGeneral from '~/components/ui/doodles/general/DoodleArrowRightGeneral.vue';
import DoodleArrowLeftGeneral from '~/components/ui/doodles/general/DoodleArrowLeftGeneral.vue';

// =============================================================================
// █ PROPS
// =============================================================================
defineProps<{
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
}>();

// =============================================================================
// █ REFS & GSAP
// =============================================================================
const { gsap, initGSAP } = useGSAP();
const localePath = useLocalePath();
const { getBufferedLength } = useDoodleDraw();

// Obtener color de categoría
function getCategoryColor(category?: BlogCategory): string | undefined {
  if (!category) return undefined;
  return CATEGORY_COLORS[category];
}

const nextLinkRef = ref<HTMLElement | null>(null);
const prevLinkRef = ref<HTMLElement | null>(null);
const nextArrowRef = ref<InstanceType<typeof DoodleArrowLeftGeneral> | null>(null);
const prevArrowRef = ref<InstanceType<typeof DoodleArrowRightGeneral> | null>(null);

let nextTimeline: gsap.core.Timeline | null = null;
let prevTimeline: gsap.core.Timeline | null = null;

// =============================================================================
// █ DRAW-ON ANIMATION SETUP
// =============================================================================
const DRAW_DURATION = 1.5;
const DRAW_EASE = 'power2.out';
const LABEL_FADE_DURATION = 0.5;

/**
 * ◼️ SETUP DRAW TIMELINE
 * ---------------------------------------------------------
 * Prepara los paths del SVG con stroke-dasharray/offset
 * y crea un timeline pausado (play en hover, reverse en leave).
 */
function setupDrawTimeline(
  linkEl: HTMLElement,
  arrowComponent: InstanceType<typeof DoodleArrowLeftGeneral | typeof DoodleArrowRightGeneral>,
): gsap.core.Timeline {
  const svgEl = arrowComponent.svg;
  if (!svgEl) return gsap.timeline();

  const paths = svgEl.querySelectorAll('path');
  const labelEl = linkEl.querySelector('.nav-label');

  // Estado inicial: paths invisibles (dashoffset = longitud total + 20)
  paths.forEach((path) => {
    const length = getBufferedLength(path);
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      visibility: 'hidden',
    });
  });

  const tl = gsap.timeline({ paused: true });

  // Fade out del label
  if (labelEl) {
    tl.to(
      labelEl,
      {
        opacity: 0,
        duration: LABEL_FADE_DURATION,
        ease: 'power1.out',
      },
      0,
    );
  }

  // Draw-on de cada path con stagger ligero
  paths.forEach((path, i) => {
    tl.to(
      path,
      {
        visibility: 'visible',
        strokeDashoffset: 0,
        duration: DRAW_DURATION,
        ease: DRAW_EASE,
      },
      i * 0.08,
    );
  });

  return tl;
}

// =============================================================================
// █ LIFECYCLE
// =============================================================================
onMounted(() => {
  initGSAP(() => {
    if (nextLinkRef.value && nextArrowRef.value) {
      nextTimeline = setupDrawTimeline(nextLinkRef.value, nextArrowRef.value);
    }
    if (prevLinkRef.value && prevArrowRef.value) {
      prevTimeline = setupDrawTimeline(prevLinkRef.value, prevArrowRef.value);
    }
  });
});

// =============================================================================
// █ INTERACTION: HANDLERS
// =============================================================================
function handleNextEnter() {
  nextTimeline?.play();
}
function handleNextLeave() {
  nextTimeline?.reverse();
}
function handlePrevEnter() {
  prevTimeline?.play();
}
function handlePrevLeave() {
  prevTimeline?.reverse();
}
</script>

<template>
  <nav
    role="navigation"
    aria-label="Blog post navigation"
    class="blog-post-nav mt-16 pt-8 border-t border-foreground/10"
    style="opacity: 0"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- ================================================================= -->
      <!-- █ PREV POST (más antiguo) -> IZQUIERDA -->
      <!-- ================================================================= -->
      <div v-if="prevPost">
        <div
          ref="prevLinkRef"
          class="block w-fit"
          @mouseenter="handlePrevEnter"
          @mouseleave="handlePrevLeave"
        >
          <NuxtLink
            :to="localePath(`/blog/${prevPost.slug}`)"
            :aria-label="`${$t('blog.nav_previous')}: ${prevPost.title}`"
            class="block group"
          >
            <div class="nav-arrow-wrapper justify-start mb-1 h-5">
              <span
                class="nav-label text-xs font-mono uppercase tracking-[0.15em] opacity-30 whitespace-nowrap"
              >
                {{ $t('blog.nav_previous') }}
              </span>
              <DoodleArrowLeftGeneral
                ref="prevArrowRef"
                class="nav-arrow-overlay"
                :stroke-width="4"
                :stroke-color="getCategoryColor(prevPost.category)"
              />
            </div>
            <h3 class="text-base font-bold group-hover:opacity-60 transition-opacity">
              {{ prevPost.title }}
            </h3>
          </NuxtLink>
        </div>
      </div>
      <!-- Celda vacía para mantener el "Next" a la derecha si no hay Prev -->
      <div v-else></div>

      <!-- ================================================================= -->
      <!-- █ NEXT POST (más reciente) -> DERECHA -->
      <!-- ================================================================= -->
      <div v-if="nextPost" class="md:text-right md:ml-auto">
        <div
          ref="nextLinkRef"
          class="block w-fit md:ml-auto"
          @mouseenter="handleNextEnter"
          @mouseleave="handleNextLeave"
        >
          <NuxtLink
            :to="localePath(`/blog/${nextPost.slug}`)"
            :aria-label="`${$t('blog.nav_next')}: ${nextPost.title}`"
            class="block group"
          >
            <div class="nav-arrow-wrapper justify-end md:justify-end mb-1 h-5">
              <!-- LABEL -> Se oculta al hover, la flecha se dibuja encima -->
              <span
                class="nav-label text-xs font-mono uppercase tracking-[0.15em] opacity-30 whitespace-nowrap"
              >
                {{ $t('blog.nav_next') }}
              </span>
              <DoodleArrowRightGeneral
                ref="nextArrowRef"
                class="nav-arrow-overlay"
                :stroke-width="4"
                :stroke-color="getCategoryColor(nextPost.category)"
              />
            </div>
            <h3 class="text-base font-bold group-hover:opacity-60 transition-opacity">
              {{ nextPost.title }}
            </h3>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* POSICIONAR la flecha sobre el texto del label */
.nav-arrow-wrapper {
  display: inline-flex;
  align-items: center;
  position: relative;
  /* Ancho fijo para que ambas flechas tengan el mismo tamaño interno siempre */
  width: 3rem;
}

.nav-arrow-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3rem;
  height: auto;
  pointer-events: none;
}
</style>
