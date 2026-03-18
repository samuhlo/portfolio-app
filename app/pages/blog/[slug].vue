<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG POST DETAIL
 * =====================================================================
 * DESC:   Página individual de un post del blog.
 *         Datos desde useBlogPost(slug) — post + prev/next incluidos.
 *         ContentRenderer renderiza el markdown.
 *         Timeline GSAP: sidebar stagger → title clip reveal → excerpt
 *         → line scaleX → content fade.
 * STATUS: STABLE
 * =====================================================================
 */

definePageMeta({ layout: 'blog' });

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from '#app';
import { SITE, BREAKPOINTS } from '~/config/site';
import { useBlogPost } from '~/composables/useBlogPost';
import { useGSAP } from '~/composables/useGSAP';
import type { TocHeading } from '~/types/blog';
import BlogPostLayout from '~/components/blog/BlogPostLayout.vue';
import BlogPostInfo from '~/components/blog/BlogPostInfo.vue';
import BlogPostBody from '~/components/blog/BlogPostBody.vue';
import BlogPostNavigation from '~/components/blog/BlogPostNavigation.vue';

const route = useRoute();
const slugValue = route.params.slug as string;

const { post, prevPost, nextPost } = useBlogPost(slugValue);

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const containerRef = ref<HTMLElement | null>(null);
const postBodyRef = ref<InstanceType<typeof BlogPostBody> | null>(null);
const showTitleInSidebar = ref(false);
const revealedHeadings = ref<TocHeading[]>([]);
const activeHeadingId = ref('');

// =============================================================================
// █ SCROLL PERSISTENCE
// =============================================================================
const SCROLL_KEY = `blog-scroll-${slugValue}`;
let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null;

function saveScrollPosition() {
  if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(() => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  }, 300);
}

// SEO
useSeoMeta({
  title: computed(() => (post.value ? `${SITE.author} _ ${post.value.title}` : 'Blog')),
  description: computed(() => post.value?.description ?? ''),
  ogTitle: computed(() => (post.value ? `${SITE.author} _ ${post.value.title}` : 'Blog')),
  ogDescription: computed(() => post.value?.description ?? ''),
  ogType: 'article',
});

// =============================================================================
// █ ANIMATION CONSTANTS — editar aquí para ajustar velocidad y tipo
// =============================================================================
const ANIM = {
  // Ease por defecto del timeline
  defaultEase: 'power3.out',

  sidebar: { x: -24, duration: 0.4, stagger: 0.06 },
  eyebrow: { y: -10, duration: 0.35, overlap: '-=0.2' },
  title: { duration: 0.6, ease: 'power4.out', overlap: '-=0.15' },
  excerpt: { y: 12, duration: 0.45, overlap: '-=0.35' },
  line: { duration: 0.5, ease: 'power2.inOut', overlap: '-=0.3' },
  content: { y: 16, duration: 0.5, overlap: '-=0.2' },
} as const;

// =============================================================================
// █ GSAP SETUP: se inicia cuando post está disponible y el DOM renderizado.
//   Usa watch + nextTick para garantizar que funciona tanto en SSR como
//   en navegación client-side (donde post puede llegar tras onMounted).
// =============================================================================
let gsapInitialized = false;

function setupGSAP() {
  if (gsapInitialized || !containerRef.value) return;
  gsapInitialized = true;

  initGSAP(() => {
    if (!containerRef.value) return;

    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    const hasRestoredScroll = savedScroll && parseInt(savedScroll, 10) > 0;

    if (hasRestoredScroll) {
      // [NOTE] La nav empieza con opacity:0 en HTML para evitar flash antes de GSAP.
      // Si restauramos scroll, no hay animación → revelar inmediatamente.
      gsap.set('.blog-post-nav', { opacity: 1 });
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    } else {
      const tl = gsap.timeline({ defaults: { ease: ANIM.defaultEase } });

      tl.from('.info-section-anim', {
        x: ANIM.sidebar.x,
        opacity: 0,
        duration: ANIM.sidebar.duration,
        stagger: ANIM.sidebar.stagger,
      });
      tl.from(
        '.post-body-eyebrow',
        { y: ANIM.eyebrow.y, opacity: 0, duration: ANIM.eyebrow.duration },
        ANIM.eyebrow.overlap,
      );
      tl.from(
        '.post-body-title',
        { yPercent: 105, opacity: 0, duration: ANIM.title.duration, ease: ANIM.title.ease },
        ANIM.title.overlap,
      );
      tl.from(
        '.post-body-accent-line',
        { scaleY: 0, duration: 0.7, ease: 'power2.inOut' },
        '<',
      );
      tl.from(
        '.post-body-excerpt',
        { y: ANIM.excerpt.y, opacity: 0, duration: ANIM.excerpt.duration },
        ANIM.excerpt.overlap,
      );
      tl.from(
        '.post-body-line',
        { scaleX: 0, duration: ANIM.line.duration, ease: ANIM.line.ease },
        ANIM.line.overlap,
      );
      tl.from(
        '.post-content',
        { y: ANIM.content.y, opacity: 0, duration: ANIM.content.duration },
        ANIM.content.overlap,
      );
      // [NOTE] La nav empieza en opacity:0 (inline style en BlogPostNavigation).
      // Se revela al final del timeline para que no flicker antes de que el
      // contenido principal esté animado.
      tl.to('.blog-post-nav', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2');
    }

    // ScrollTrigger: muestra el título en la sidebar cuando el h1 sale del viewport
    // [NOTE] Solo en desktop — en móvil el sidebar está en otro orden de layout
    // y el título apareciendo causa un salto visual innecesario.
    const titleEl = containerRef.value.querySelector('.post-body-title');
    const isDesktop = window.matchMedia(`(min-width: ${BREAKPOINTS.mobile}px)`).matches;
    if (titleEl && isDesktop) {
      ScrollTrigger.create({
        trigger: titleEl,
        start: 'bottom top',
        onEnter: () => {
          showTitleInSidebar.value = true;
        },
        onLeaveBack: () => {
          showTitleInSidebar.value = false;
        },
      });

      if (
        sessionStorage.getItem(SCROLL_KEY) &&
        parseInt(sessionStorage.getItem(SCROLL_KEY)!, 10) > 0
      ) {
        ScrollTrigger.refresh();
      }
    }
  }, containerRef.value);
}

// =============================================================================
// █ TOC HEADING TRIGGERS
//   Separado de setupGSAP porque ContentRenderer puede tardar múltiples frames
//   en pintar el markdown en SPA navigation. El retry con rAF resuelve el timing
//   sin depender de nextTick ni de cuántos ciclos necesite el renderer.
// =============================================================================
interface Killable {
  kill(): void;
}
let headingTriggers: Killable[] = [];

function setupHeadingTriggers(attempt = 0) {
  if (!containerRef.value) return;
  if (!window.matchMedia(`(min-width: ${BREAKPOINTS.mobile}px)`).matches) return;

  const headingEls = Array.from(
    containerRef.value.querySelectorAll('.post-content h2'),
  ) as HTMLElement[];

  // ContentRenderer no ha pintado aún — reintentar en el siguiente frame
  if (headingEls.length === 0) {
    if (attempt < 30) requestAnimationFrame(() => setupHeadingTriggers(attempt + 1));
    return;
  }

  const headings: TocHeading[] = headingEls
    .filter((el) => el.id)
    .map((el) => ({
      id: el.id,
      text: el.textContent?.trim() ?? '',
      level: 2 as const,
    }));

  // Los h2 existen pero aún sin IDs (Nuxt Content los asigna en el siguiente
  // ciclo de render tras la hidratación en SPA navigation) → reintentar
  if (headings.length === 0) {
    if (attempt < 30) requestAnimationFrame(() => setupHeadingTriggers(attempt + 1));
    return;
  }

  headings.forEach((heading) => {
    const el = document.getElementById(heading.id);
    if (!el) return;

    const idx = headings.indexOf(heading);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 25%',
      onEnter: () => {
        if (!revealedHeadings.value.find((h) => h.id === heading.id)) {
          revealedHeadings.value = [...revealedHeadings.value, heading];
        }
        activeHeadingId.value = heading.id;
      },
      onLeaveBack: () => {
        // El heading vuelve a ser visible → el activo es el anterior
        activeHeadingId.value = idx > 0 ? headings[idx - 1]!.id : '';
      },
    });

    headingTriggers.push(trigger);
  });

  // Re-evalúa triggers con la posición de scroll actual
  // (necesario si el usuario llegó con scroll ya avanzado)
  ScrollTrigger.refresh();
}

onMounted(() => {
  if (post.value) {
    nextTick(() => requestAnimationFrame(setupGSAP));
    requestAnimationFrame(() => setupHeadingTriggers());
  } else {
    const stop = watch(post, (val) => {
      if (val) {
        nextTick(() => requestAnimationFrame(setupGSAP));
        requestAnimationFrame(() => setupHeadingTriggers());
        stop();
      }
    });
  }

  window.addEventListener('scroll', saveScrollPosition, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', saveScrollPosition);
  if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
  headingTriggers.forEach((t) => t.kill());
  headingTriggers = [];
});
</script>

<template>
  <div ref="containerRef" class="blog-post-page pb-24 md:pb-32">
    <BlogPostLayout v-if="post">
      <template #info>
        <BlogPostInfo
          :post="post"
          :show-title="showTitleInSidebar"
          :revealed-headings="revealedHeadings"
          :active-heading-id="activeHeadingId"
        />
      </template>

      <template #body>
        <BlogPostBody ref="postBodyRef" :post="post" />
        <BlogPostNavigation :prev-post="prevPost" :next-post="nextPost" />
      </template>
    </BlogPostLayout>
  </div>
</template>
