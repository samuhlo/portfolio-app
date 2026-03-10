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
import { useBlogPost } from '~/composables/useBlogPost';
import { useGSAP } from '~/composables/useGSAP';
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
  title: computed(() => (post.value ? `Samuel López _ ${post.value.title}` : 'Blog')),
  description: computed(() => post.value?.description ?? ''),
  ogTitle: computed(() => (post.value ? `Samuel López _ ${post.value.title}` : 'Blog')),
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
  eyebrow:  { y: -10,  duration: 0.35, overlap: '-=0.2' },
  title:    { duration: 0.6, ease: 'power4.out', overlap: '-=0.15' },
  excerpt:  { y: 12,   duration: 0.45, overlap: '-=0.35' },
  line:     { duration: 0.5, ease: 'power2.inOut', overlap: '-=0.3' },
  content:  { y: 16,   duration: 0.5, overlap: '-=0.2' },
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
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    } else {
      const tl = gsap.timeline({ defaults: { ease: ANIM.defaultEase } });

      tl.from('.info-section-anim', { x: ANIM.sidebar.x, opacity: 0, duration: ANIM.sidebar.duration, stagger: ANIM.sidebar.stagger });
      tl.from('.post-body-eyebrow', { y: ANIM.eyebrow.y, opacity: 0, duration: ANIM.eyebrow.duration }, ANIM.eyebrow.overlap);
      tl.from('.post-body-title',   { yPercent: 105, opacity: 0, duration: ANIM.title.duration, ease: ANIM.title.ease }, ANIM.title.overlap);
      tl.from('.post-body-excerpt', { y: ANIM.excerpt.y, opacity: 0, duration: ANIM.excerpt.duration }, ANIM.excerpt.overlap);
      tl.from('.post-body-line',    { scaleX: 0, duration: ANIM.line.duration, ease: ANIM.line.ease }, ANIM.line.overlap);
      tl.from('.post-content',      { y: ANIM.content.y, opacity: 0, duration: ANIM.content.duration }, ANIM.content.overlap);
    }

    // ScrollTrigger: muestra el título en la sidebar cuando el h1 sale del viewport
    const titleEl = containerRef.value.querySelector('.post-body-title');
    if (titleEl) {
      ScrollTrigger.create({
        trigger: titleEl,
        start: 'bottom top',
        onEnter: () => { showTitleInSidebar.value = true; },
        onLeaveBack: () => { showTitleInSidebar.value = false; },
      });

      if (sessionStorage.getItem(SCROLL_KEY) && parseInt(sessionStorage.getItem(SCROLL_KEY)!, 10) > 0) {
        ScrollTrigger.refresh();
      }
    }
  }, containerRef.value);
}

onMounted(() => {
  // Si post ya está disponible, iniciar GSAP en el siguiente tick (DOM listo).
  // Si aún no está disponible (client-side navigation), esperar al watch.
  if (post.value) {
    nextTick(setupGSAP);
  } else {
    const stop = watch(post, (val) => {
      if (val) {
        nextTick(setupGSAP);
        stop();
      }
    });
  }

  window.addEventListener('scroll', saveScrollPosition, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', saveScrollPosition);
  if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
});
</script>

<template>
  <div ref="containerRef" class="blog-post-page pb-24 md:pb-32">
    <BlogPostLayout v-if="post">
      <template #info>
        <BlogPostInfo :post="post" :show-title="showTitleInSidebar" />
      </template>

      <template #body>
        <BlogPostBody ref="postBodyRef" :post="post" />
        <BlogPostNavigation :prev-post="prevPost" :next-post="nextPost" />
      </template>
    </BlogPostLayout>
  </div>
</template>
