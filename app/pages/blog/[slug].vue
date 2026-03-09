<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG POST DETAIL
 * =====================================================================
 * DESC:   Página individual de un post del blog.
 *         Timeline GSAP: sidebar stagger → title clip reveal → excerpt
 *         → line scaleX → content fade.
 * STATUS: STABLE
 * =====================================================================
 */

definePageMeta({
  layout: 'blog',
});

import { ref, computed, onMounted } from 'vue';
import { useRoute, createError } from '#app';
import { getBlogPostBySlug, BLOG_POSTS } from '~/data/blog-posts';
import { type BlogPost } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import BlogPostLayout from '~/components/blog/BlogPostLayout.vue';
import BlogPostInfo from '~/components/blog/BlogPostInfo.vue';
import BlogPostBody from '~/components/blog/BlogPostBody.vue';
import DoodleArrowRightGeneral from '~/components/ui/doodles/general/DoodleArrowRightGeneral.vue';
import DoodleArrowLeftGeneral from '~/components/ui/doodles/general/DoodleArrowLeftGeneral.vue';

const route = useRoute();
const { gsap, initGSAP } = useGSAP();

const containerRef = ref<HTMLElement | null>(null);
const postBodyRef = ref<InstanceType<typeof BlogPostBody> | null>(null);

// Get slug from route
const slug = computed(() => route.params.slug as string);

// Get post from slug - must exist or throw error
const post = computed<BlogPost>(() => {
  const foundPost = getBlogPostBySlug(slug.value);
  if (!foundPost) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    });
  }
  return foundPost;
});

// SEO
useSeoMeta({
  title: computed(() => `Samuel López _ ${post.value.title}`),
  description: computed(() => post.value.excerpt),
  ogTitle: computed(() => `Samuel López _ ${post.value.title}`),
  ogDescription: computed(() => post.value.excerpt),
  ogType: 'article',
});

// Simple markdown parser (basic support for headings, paragraphs, lists, code blocks)
function parseMarkdown(content: string): string {
  return (
    content
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="post-h3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="post-h2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="post-h1">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="post-hr" />')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="post-li">$1</li>')
      // Paragraphs (lines that don't start with special chars)
      .replace(/^(?!<[hlpu]|<pre|<li)(.*$)/gm, (match) => {
        const trimmed = match.trim();
        if (trimmed === '') return '';
        return `<p class="post-p">${trimmed}</p>`;
      })
      // Wrap consecutive li elements
      .replace(/(<li class="post-li">.*<\/li>\n?)+/g, '<ul class="post-ul">$&</ul>')
      // Clean up empty paragraphs
      .replace(/<p class="post-p"><\/p>/g, '')
  );
}

// Rendered content
const renderedContent = computed(() => parseMarkdown(post.value.content));

// Get prev/next posts for navigation
const currentIndex = computed(() => BLOG_POSTS.findIndex((p) => p.slug === post.value.slug));

const prevPost = computed(() =>
  currentIndex.value < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex.value + 1] : null,
);

const nextPost = computed(() =>
  currentIndex.value > 0 ? BLOG_POSTS[currentIndex.value - 1] : null,
);

function onNextHover() {}
function onNextLeave() {}
function onPrevHover() {}
function onPrevLeave() {}

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // =================================================================
    // FASE 1 — SIDEBAR: info sections entran con stagger desde izquierda
    // =================================================================
    tl.from('.info-section-anim', {
      x: -24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.09,
    });

    // =================================================================
    // FASE 2 — POST EYEBROW (category label): fade desde arriba
    // =================================================================
    tl.from(
      '.post-body-eyebrow',
      {
        y: -10,
        opacity: 0,
        duration: 0.5,
      },
      '-=0.3',
    );

    // =================================================================
    // FASE 3 — POST TITLE: clip reveal desde abajo
    // El overflow-hidden del wrapper hace el efecto de máscara.
    // =================================================================
    tl.from(
      '.post-body-title',
      {
        yPercent: 105,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
      },
      '-=0.2',
    );

    // =================================================================
    // FASE 4 — EXCERPT: fade + slide
    // =================================================================
    tl.from(
      '.post-body-excerpt',
      {
        y: 16,
        opacity: 0,
        duration: 0.7,
      },
      '-=0.5',
    );

    // =================================================================
    // FASE 5 — LÍNEA SEPARADORA: scaleX de izquierda a derecha
    // =================================================================
    tl.from(
      '.post-body-line',
      {
        scaleX: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '-=0.4',
    );

    // =================================================================
    // FASE 6 — CONTENIDO DEL POST: fade general del bloque
    // No animamos elementos individuales del v-html (muy costoso).
    // =================================================================
    tl.from(
      '.post-content',
      {
        y: 20,
        opacity: 0,
        duration: 0.8,
      },
      '-=0.3',
    );
  }, containerRef.value);
});
</script>

<template>
  <div ref="containerRef" class="blog-post-page pb-24 md:pb-32">
    <BlogPostLayout>
      <!-- Left: Info Sidebar -->
      <template #info>
        <BlogPostInfo :post="post" />
      </template>

      <!-- Right: Body Content -->
      <template #body>
        <BlogPostBody ref="postBodyRef" :post="post" :content="renderedContent" />

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
