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

import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from '#app';

import { useSetI18nParams } from '#imports';

import { BREAKPOINTS } from '~/config/site';

import { useBlogPost } from '~/composables/useBlogPost';
import { useGSAP } from '~/composables/useGSAP';
import { useBlogSeo } from '~/composables/useBlogSeo';
import type { TocHeading } from '~/types/blog';
import BlogPostLayout from '~/components/blog/BlogPostLayout.vue';
import BlogPostInfo from '~/components/blog/BlogPostInfo.vue';
import BlogPostBody from '~/components/blog/BlogPostBody.vue';
import BlogPostNavigation from '~/components/blog/BlogPostNavigation.vue';

const setI18nParams = useSetI18nParams();

const route = useRoute();
const slugValue = route.params.slug as string;

const { post, prevPost, nextPost, translations } = await useBlogPost(slugValue);

useBlogSeo({ post });

watch(
  [post, translations],
  ([currentPost, currentTranslations]) => {
    if (!currentPost) return;

    // [NOTE] Slugs traducidos por locale.
    // Sin este mapeo, switchLocalePath puede resolver params incorrectos.

    const params: Record<string, { slug: string }> = Object.fromEntries(
      currentTranslations.map((item) => [item.lang, { slug: item.slug }]),
    );

    if (!params[currentPost.lang]) {
      params[currentPost.lang] = { slug: currentPost.slug };
    }

    setI18nParams(params);
  },
  { immediate: true },
);

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const containerRef = ref<HTMLElement | null>(null);
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

// =============================================================================
// █ ANIMATION CONSTANTS — editar aquí para ajustar velocidad y tipo
// =============================================================================
const ANIM = {
  defaultEase: 'power3.out',
  sidebar: { x: -24, duration: 0.4, stagger: 0.06 },
  eyebrow: { y: -10, duration: 0.35, overlap: '-=0.2' },
  title: { duration: 0.6, ease: 'power4.out', overlap: '-=0.15' },
  excerpt: { y: 12, duration: 0.45, overlap: '-=0.35' },
  line: { duration: 0.5, ease: 'power2.inOut', overlap: '-=0.3' },
  content: { y: 16, duration: 0.5, overlap: '-=0.2' },
} as const;

// =============================================================================
// █ GSAP SETUP
// =============================================================================
let gsapInitialized = false;

function setupGSAP() {
  if (gsapInitialized || !containerRef.value) return;
  gsapInitialized = true;

  initGSAP(() => {
    if (!containerRef.value) return;

    const navEl = containerRef.value.querySelector('.blog-post-nav');

    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    const hasRestoredScroll = savedScroll && parseInt(savedScroll, 10) > 0;

    if (hasRestoredScroll) {
      // [NOTE] Scroll restaurado: revelar nav sin animación.
      if (navEl) {
        gsap.set(navEl, { opacity: 1 });
      }
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    } else {
      // [NOTE] Animación normal de entrada — scroll desde arriba
      window.scrollTo({ top: 0, behavior: 'instant' });

      const tl = gsap.timeline({ defaults: { ease: ANIM.defaultEase } });

      const sidebarEls = containerRef.value.querySelectorAll('.info-section-anim');
      const eyebrowEl = containerRef.value.querySelector('.post-body-eyebrow');
      const titleAnimEl = containerRef.value.querySelector('.post-body-title');
      const accentLineEl = containerRef.value.querySelector('.post-body-accent-line');
      const excerptEl = containerRef.value.querySelector('.post-body-excerpt');
      const bodyLineEl = containerRef.value.querySelector('.post-body-line');
      const contentEl = containerRef.value.querySelector('.post-content');

      if (sidebarEls.length > 0) {
        tl.from(sidebarEls, {
          x: ANIM.sidebar.x,
          opacity: 0,
          duration: ANIM.sidebar.duration,
          stagger: ANIM.sidebar.stagger,
        });
      }

      if (eyebrowEl) {
        tl.from(
          eyebrowEl,
          { y: ANIM.eyebrow.y, opacity: 0, duration: ANIM.eyebrow.duration },
          ANIM.eyebrow.overlap,
        );
      }

      if (titleAnimEl) {
        tl.from(
          titleAnimEl,
          { yPercent: 105, opacity: 0, duration: ANIM.title.duration, ease: ANIM.title.ease },
          ANIM.title.overlap,
        );
      }

      if (accentLineEl) {
        tl.from(accentLineEl, { scaleY: 0, duration: 0.7, ease: 'power2.inOut' }, '<');
      }

      if (excerptEl) {
        tl.from(
          excerptEl,
          { y: ANIM.excerpt.y, opacity: 0, duration: ANIM.excerpt.duration },
          ANIM.excerpt.overlap,
        );
      }

      if (bodyLineEl) {
        tl.from(
          bodyLineEl,
          { scaleX: 0, duration: ANIM.line.duration, ease: ANIM.line.ease },
          ANIM.line.overlap,
        );
      }

      if (contentEl) {
        tl.from(
          contentEl,
          { y: ANIM.content.y, opacity: 0, duration: ANIM.content.duration },
          ANIM.content.overlap,
        );
      }

      if (navEl) {
        tl.to(navEl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2');
      }
    }

    // ScrollTrigger: muestra el título en la sidebar cuando el h1 sale del viewport
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
        activeHeadingId.value = idx > 0 ? headings[idx - 1]!.id : '';
      },
    });

    headingTriggers.push(trigger);
  });

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
          :translations="translations"
        />
      </template>

      <template #body>
        <BlogPostBody :post="post">
          <template #post-info>
            <div class="md:hidden">
              <BlogPostInfo
                :post="post"
                :translations="translations"
                compact
              />
            </div>
          </template>
        </BlogPostBody>
        <BlogPostNavigation :prev-post="prevPost" :next-post="nextPost" />
      </template>
    </BlogPostLayout>

    <div v-else class="mx-auto max-w-3xl px-6 pt-20 text-sm text-zinc-500 md:pt-28">
      Cargando articulo...
    </div>
  </div>
</template>
