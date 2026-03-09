<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG INDEX
 * =====================================================================
 * DESC:   Página principal del blog con componentes separados.
 *         BlogHeader + BlogIndex (categorías) + BlogList (posts).
 *         Timeline GSAP orquestada: breadcrumb → title reveal →
 *         animación cartoon (logs empuja B) → line → categorías →
 *         posts + dividers.
 * STATUS: WIP
 * =====================================================================
 */

import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useBlogHeaderPhysics } from '~/composables/useBlogHeaderPhysics';
import { type BlogCategory } from '~/types/blog';
import BlogHeader from '~/components/blog/BlogHeader.vue';
import BlogIndex from '~/components/blog/BlogIndex.vue';
import BlogList from '~/components/blog/BlogList.vue';

definePageMeta({
  layout: 'blog',
});

const { gsap, initGSAP } = useGSAP();
const { launch: launchBPhysics } = useBlogHeaderPhysics();

const containerRef = ref<HTMLElement | null>(null);

// Estado de categoría seleccionada
const selectedCategory = ref<BlogCategory | 'all'>('all');

function handleCategorySelect(category: BlogCategory | 'all') {
  selectedCategory.value = category;
}

// SEO
const title = 'Blog';
const description = 'Thoughts, updates, and design explorations from Samuel López.';

useSeoMeta({
  title: `Samuel López _ ${title}`,
  description,
  ogTitle: `Samuel López _ ${title}`,
  ogDescription: description,
  ogType: 'website',
});

// =============================================================================
// █ CONSTANTS: ANIMACIÓN CARTOON
// =============================================================================
/** Delay (s) tras el reveal del título antes de iniciar la animación cartoon */
const CARTOON_DELAY = 0.6;
/** Distancia que "logs" se separa hacia la derecha (wind-up) */
const WIND_UP_DISTANCE = 60;
/** Duración del wind-up */
const WIND_UP_DURATION = 0.5;
/** Duración del charge (logs se lanza hacia la B) */
const CHARGE_DURATION = 0.18;
/** Duración del settle elástico de "logs" tras el impacto */
const SETTLE_DURATION = 0.8;
/** Duración del slide de "logs" a la posición de la "B" */
const SLIDE_TO_ORIGIN_DURATION = 0.35;

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value) return;

    const letterB = containerRef.value.querySelector<HTMLElement>('.blog-letter-b');
    const wordLogs = containerRef.value.querySelector<HTMLElement>('.blog-word-logs');
    const canvas = containerRef.value.querySelector<HTMLCanvasElement>('.blog-header-canvas');

    if (!letterB || !wordLogs || !canvas) return;

    // [NOTE] Capturar ancho de la "B" antes de animar para calcular el slide final
    const bWidth = letterB.getBoundingClientRect().width;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // =================================================================
    // FASE 1 — BREADCRUMB: fade simple desde arriba
    // =================================================================
    tl.from('.blog-header-breadcrumb', {
      y: -12,
      opacity: 0,
      duration: 0.6,
    });

    // =================================================================
    // FASE 2 — TITLE "BLOGS": reveal desde abajo (yPercent clip effect)
    // El overflow-hidden en .blog-header-title hace el clip visual.
    // =================================================================
    tl.from(
      '.blog-header-title h1',
      {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
      },
      '-=0.2',
    );

    // =================================================================
    // CARTOON TIMELINE (independiente) — "logs" empuja "B" fuera
    // [NOTE] Separado del timeline principal para no bloquear el resto
    // de las fases de entrada (línea, desc, categorías, posts).
    // =================================================================
    const cartoonTl = gsap.timeline({ delay: CARTOON_DELAY });

    // Paso 1: Wind-up — "logs" se separa hacia la derecha con squash
    cartoonTl.to(wordLogs, {
      x: WIND_UP_DISTANCE,
      scaleX: 0.92,
      scaleY: 1.06,
      duration: WIND_UP_DURATION,
      ease: 'power2.in',
    });

    // Paso 2: Charge — "logs" se lanza a la izquierda con stretch
    cartoonTl.to(wordLogs, {
      x: -8,
      scaleX: 1.06,
      scaleY: 0.95,
      duration: CHARGE_DURATION,
      ease: 'power4.in',
      onComplete: () => {
        // IMPACTO -> Ocultar la "B" del DOM y lanzar con Matter.js
        gsap.set(letterB, { opacity: 0 });

        // Dimensionar canvas al container del título
        const titleContainer = containerRef.value?.querySelector('.blog-header-title');
        if (!titleContainer || !canvas) return;

        const rect = titleContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Calcular posición y tamaño de la "B" para el canvas
        const bRect = letterB.getBoundingClientRect();
        const containerRect = titleContainer.getBoundingClientRect();

        const computedStyle = getComputedStyle(letterB);
        const fontSize = parseFloat(computedStyle.fontSize);
        const fontFamily = computedStyle.fontFamily;
        const fontWeight = computedStyle.fontWeight;

        launchBPhysics(canvas, {
          text: 'B',
          font: `${fontWeight} ${fontSize}px ${fontFamily}`,
          startX: bRect.left - containerRect.left + bRect.width / 2,
          startY: bRect.top - containerRect.top + bRect.height / 2,
          charWidth: bRect.width,
          charHeight: bRect.height,
        });
      },
    });

    // Paso 3: Settle — "logs" se asienta con overshoot elástico
    cartoonTl.to(wordLogs, {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      duration: SETTLE_DURATION,
      ease: 'elastic.out(1, 0.35)',
    });

    // Paso 4: Slide — "logs" se desliza rápido a la posición original de "BLogs"
    cartoonTl.to(wordLogs, {
      x: -bWidth,
      duration: SLIDE_TO_ORIGIN_DURATION,
      ease: 'power3.inOut',
    });

    // =================================================================
    // FASE 3 — LÍNEA DECORATIVA: se extiende de izquierda a derecha
    // =================================================================
    tl.from(
      '.blog-header-line',
      {
        scaleX: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '-=0.4',
    );

    // =================================================================
    // FASE 4 — DESCRIPCIÓN: fade + slide desde abajo
    // =================================================================
    tl.from(
      '.blog-header-desc',
      {
        y: 20,
        opacity: 0,
        duration: 0.7,
      },
      '-=0.5',
    );

    // =================================================================
    // FASE 5 — CATEGORÍAS: stagger desde la izquierda
    // =================================================================
    tl.from(
      '.category-item-anim',
      {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
      },
      '-=0.3',
    );

    // =================================================================
    // FASE 6 — POSTS: stagger desde abajo
    // =================================================================
    tl.from(
      '.post-item-anim',
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      },
      '-=0.2',
    );

    // =================================================================
    // FASE 7 — DIVIDERS: scaleX desde la izquierda, sync con posts
    // [NOTE]: Se overlap con el stagger de posts para sensación fluida
    // =================================================================
    tl.from(
      '.blog-divider',
      {
        scaleX: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      '<0.05',
    );
  }, containerRef.value);
});
</script>

<template>
  <div ref="containerRef" class="blog-page pb-24 md:pb-32">
    <!-- Header -->
    <BlogHeader />

    <!-- Main Content -->
    <div class="blog-content grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
      <!-- Left: Categories Index -->
      <div class="md:col-span-3">
        <BlogIndex :selected-category="selectedCategory" @select="handleCategorySelect" />
      </div>

      <!-- Right: Posts List -->
      <div class="md:col-span-9 md:pl-8">
        <BlogList :selected-category="selectedCategory" />
      </div>
    </div>
  </div>
</template>
