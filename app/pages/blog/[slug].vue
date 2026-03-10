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

import { ref, onMounted, onUnmounted } from 'vue';
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

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value) return;

    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    const hasRestoredScroll = savedScroll && parseInt(savedScroll, 10) > 0;

    if (hasRestoredScroll) {
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    } else {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.info-section-anim', { x: -24, opacity: 0, duration: 0.6, stagger: 0.09 });
      tl.from('.post-body-eyebrow', { y: -10, opacity: 0, duration: 0.5 }, '-=0.3');
      tl.from(
        '.post-body-title',
        { yPercent: 105, opacity: 0, duration: 1, ease: 'power4.out' },
        '-=0.2',
      );
      tl.from('.post-body-excerpt', { y: 16, opacity: 0, duration: 0.7 }, '-=0.5');
      tl.from('.post-body-line', { scaleX: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.4');
      tl.from('.post-content', { y: 20, opacity: 0, duration: 0.8 }, '-=0.3');
    }

    const titleEl = containerRef.value.querySelector('.post-body-title');
    if (titleEl) {
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

      if (hasRestoredScroll) ScrollTrigger.refresh();
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
