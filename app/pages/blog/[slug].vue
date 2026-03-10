<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG POST DETAIL
 * =====================================================================
 * DESC:   Página individual de un post del blog.
 *         Post fetched desde Nuxt Content via queryCollection.
 *         ContentRenderer se encarga de renderizar el markdown.
 *         Timeline GSAP: sidebar stagger → title clip reveal → excerpt
 *         → line scaleX → content fade.
 * STATUS: STABLE
 * =====================================================================
 */

definePageMeta({
  layout: 'blog',
});

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, createError } from '#app';
import { type BlogPost } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import BlogPostLayout from '~/components/blog/BlogPostLayout.vue';
import BlogPostInfo from '~/components/blog/BlogPostInfo.vue';
import BlogPostBody from '~/components/blog/BlogPostBody.vue';
import DoodleArrowRightGeneral from '~/components/ui/doodles/general/DoodleArrowRightGeneral.vue';
import DoodleArrowLeftGeneral from '~/components/ui/doodles/general/DoodleArrowLeftGeneral.vue';

const route = useRoute();
const { gsap, ScrollTrigger, initGSAP } = useGSAP();

const containerRef = ref<HTMLElement | null>(null);
const postBodyRef = ref<InstanceType<typeof BlogPostBody> | null>(null);

// SIDEBAR TITLE: aparece cuando el título del post deja de ser visible
const showTitleInSidebar = ref(false);

// =============================================================================
// █ DATA: fetch del post actual y posts adyacentes desde Nuxt Content
// =============================================================================
const slugValue = route.params.slug as string;

const { data: post } = await useAsyncData(`blog-post-${slugValue}`, async () => {
  const result = await queryCollection('blog').path(`/blog/${slugValue}`).first();
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' });
  }
  return result as BlogPost;
});

// Fetch de todos los posts publicados para navegación prev/next
const { data: allPosts } = await useAsyncData('blog-all-for-nav', () =>
  queryCollection('blog')
    .where('published', '=', true)
    .order('date', 'DESC')
    .select(['title', 'slug', 'description', 'date'])
    .all(),
);

const currentIndex = computed(
  () => allPosts.value?.findIndex((p) => p.slug === slugValue) ?? -1,
);

// "next" = más reciente (índice inferior en array desc)
const nextPost = computed(() =>
  currentIndex.value > 0 ? (allPosts.value?.[currentIndex.value - 1] as BlogPost) : null,
);

// "prev" = más antiguo (índice superior en array desc)
const prevPost = computed(() =>
  currentIndex.value < (allPosts.value?.length ?? 0) - 1
    ? (allPosts.value?.[currentIndex.value + 1] as BlogPost)
    : null,
);

// =============================================================================
// █ SCROLL PERSISTENCE: mantener posición de lectura entre recargas
// =============================================================================
const SCROLL_STORAGE_PREFIX = 'blog-scroll-';
let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null;

function getScrollKey(): string {
  return `${SCROLL_STORAGE_PREFIX}${slugValue}`;
}

function saveScrollPosition() {
  if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(() => {
    sessionStorage.setItem(getScrollKey(), String(window.scrollY));
  }, 300);
}

function restoreScrollPosition() {
  const saved = sessionStorage.getItem(getScrollKey());
  if (!saved) return;

  const y = parseInt(saved, 10);
  if (isNaN(y) || y <= 0) return;

  window.scrollTo({ top: y, behavior: 'instant' });
  ScrollTrigger.refresh();
}

// SEO
useSeoMeta({
  title: computed(() => (post.value ? `Samuel López _ ${post.value.title}` : 'Blog')),
  description: computed(() => post.value?.description ?? ''),
  ogTitle: computed(() => (post.value ? `Samuel López _ ${post.value.title}` : 'Blog')),
  ogDescription: computed(() => post.value?.description ?? ''),
  ogType: 'article',
});

function onNextHover() {}
function onNextLeave() {}
function onPrevHover() {}
function onPrevLeave() {}

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value) return;

    // =================================================================
    // DETECTAR SI HAY SCROLL GUARDADO -> skip de animaciones de entrada
    // =================================================================
    const savedScroll = sessionStorage.getItem(getScrollKey());
    const hasRestoredScroll = savedScroll && parseInt(savedScroll, 10) > 0;

    if (hasRestoredScroll) {
      const y = parseInt(savedScroll, 10);
      window.scrollTo({ top: y, behavior: 'instant' });
    } else {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.info-section-anim', {
        x: -24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.09,
      });

      tl.from(
        '.post-body-eyebrow',
        { y: -10, opacity: 0, duration: 0.5 },
        '-=0.3',
      );

      tl.from(
        '.post-body-title',
        { yPercent: 105, opacity: 0, duration: 1, ease: 'power4.out' },
        '-=0.2',
      );

      tl.from(
        '.post-body-excerpt',
        { y: 16, opacity: 0, duration: 0.7 },
        '-=0.5',
      );

      tl.from(
        '.post-body-line',
        { scaleX: 0, duration: 0.8, ease: 'power2.inOut' },
        '-=0.4',
      );

      tl.from(
        '.post-content',
        { y: 20, opacity: 0, duration: 0.8 },
        '-=0.3',
      );
    }

    // =================================================================
    // SCROLL TRIGGER — Título en sidebar cuando .post-body-title
    // desaparece del viewport.
    // =================================================================
    const titleEl = containerRef.value.querySelector('.post-body-title');
    if (titleEl) {
      ScrollTrigger.create({
        trigger: titleEl,
        start: 'bottom top',
        onEnter: () => { showTitleInSidebar.value = true; },
        onLeaveBack: () => { showTitleInSidebar.value = false; },
      });

      if (hasRestoredScroll) {
        ScrollTrigger.refresh();
      }
    }
  }, containerRef.value);

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
      <!-- Left: Info Sidebar -->
      <template #info>
        <BlogPostInfo :post="post" :show-title="showTitleInSidebar" />
      </template>

      <!-- Right: Body Content -->
      <template #body>
        <BlogPostBody ref="postBodyRef" :post="post" />

        <!-- Post Navigation -->
        <nav class="mt-16 pt-8 border-t border-foreground/10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Next Post (newer) -->
            <div v-if="nextPost" @mouseenter="onNextHover" @mouseleave="onNextLeave">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 flex-shrink-0 arrow-doodle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <DoodleArrowLeftGeneral />
                </div>
                <div>
                  <span class="text-xs font-mono uppercase tracking-[0.15em] opacity-30">Next</span>
                  <NuxtLink :to="`/blog/${nextPost.slug}`" class="block mt-1 group">
                    <h3 class="text-base font-bold group-hover:opacity-60 transition-opacity">
                      {{ nextPost.title }}
                    </h3>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Prev Post (older) -->
            <div
              v-if="prevPost"
              class="md:text-right md:ml-auto"
              @mouseenter="onPrevHover"
              @mouseleave="onPrevLeave"
            >
              <div class="flex items-center gap-3 md:flex-row-reverse">
                <div
                  class="w-10 flex-shrink-0 arrow-doodle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <DoodleArrowRightGeneral />
                </div>
                <div>
                  <span class="text-xs font-mono uppercase tracking-[0.15em] opacity-30"
                    >Previous</span
                  >
                  <NuxtLink :to="`/blog/${prevPost.slug}`" class="block mt-1 group">
                    <h3 class="text-base font-bold group-hover:opacity-60 transition-opacity">
                      {{ prevPost.title }}
                    </h3>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </template>
    </BlogPostLayout>
  </div>
</template>
