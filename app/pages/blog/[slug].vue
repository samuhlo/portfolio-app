<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG POST DETAIL
 * =====================================================================
 * DESC:   Página individual de un post del blog.
 *         Renderiza el contenido con soporte básico de markdown.
 *         Layout específico sin footer de contact.
 * STATUS: STABLE
 * =====================================================================
 */

definePageMeta({
  layout: 'blog',
});

import { ref, computed, onMounted } from 'vue';
import { useRoute, createError } from '#app';
import { getBlogPostBySlug, BLOG_POSTS } from '~/data/blog-posts';
import { CATEGORY_LABELS, CATEGORY_COLORS, type BlogCategory, type BlogPost } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import RandomDoodleHover from '~/components/ui/RandomDoodleHover.vue';

const route = useRoute();
const { gsap, initGSAP } = useGSAP();

const containerRef = ref<HTMLElement | null>(null);

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

// Format fecha
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get category color
function getCategoryColor(category: BlogCategory): string {
  return CATEGORY_COLORS[category];
}

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

// Get prev/next posts
const currentIndex = computed(() => BLOG_POSTS.findIndex((p) => p.slug === post.value.slug));

const prevPost = computed(() =>
  currentIndex.value < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex.value + 1] : null,
);

const nextPost = computed(() =>
  currentIndex.value > 0 ? BLOG_POSTS[currentIndex.value - 1] : null,
);

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value) return;

    // Header animation
    gsap.from('.post-header', {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

    // Content animation
    gsap.from('.post-content > *', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.3,
    });
  }, containerRef.value);
});
</script>

<template>
  <div ref="containerRef" class="post-page pb-24 md:pb-32">
    <!-- Back Link -->
    <div class="mb-10 md:mb-14">
      <RandomDoodleHover>
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>←</span>
          <span>Back to blog</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Post Header -->
    <header class="post-header max-w-3xl">
      <!-- Category & Meta -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <span
          class="category-label text-xs uppercase tracking-widest font-bold"
          :style="{ color: getCategoryColor(post.category) }"
        >
          {{ CATEGORY_LABELS[post.category] }}
        </span>
        <span class="text-xs tracking-widest opacity-40">•</span>
        <span class="text-xs tracking-widest opacity-50">
          {{ formatDate(post.publishedAt) }}
        </span>
        <span class="text-xs tracking-widest opacity-40">•</span>
        <span class="text-xs tracking-widest opacity-50"> {{ post.readTime }} min read </span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
        {{ post.title }}
      </h1>

      <!-- Excerpt -->
      <p class="mt-6 text-lg md:text-xl opacity-60 leading-relaxed">
        {{ post.excerpt }}
      </p>
    </header>

    <!-- Post Content -->
    <article class="post-content mt-16 md:mt-24 max-w-2xl prose" v-html="renderedContent" />

    <!-- Navigation -->
    <nav class="mt-24 pt-12 border-t border-foreground/10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Next Post (newer) -->
        <div v-if="nextPost">
          <span class="text-xs uppercase tracking-widest opacity-40">← Newer</span>
          <NuxtLink :to="`/blog/${nextPost.slug}`" class="block mt-2 group">
            <RandomDoodleHover>
              <h3 class="text-lg font-bold group-hover:opacity-60 transition-opacity">
                {{ nextPost.title }}
              </h3>
            </RandomDoodleHover>
          </NuxtLink>
        </div>

        <!-- Prev Post (older) -->
        <div v-if="prevPost" class="md:text-right md:ml-auto">
          <span class="text-xs uppercase tracking-widest opacity-40">Older →</span>
          <NuxtLink :to="`/blog/${prevPost.slug}`" class="block mt-2 group">
            <RandomDoodleHover>
              <h3 class="text-lg font-bold group-hover:opacity-60 transition-opacity">
                {{ prevPost.title }}
              </h3>
            </RandomDoodleHover>
          </NuxtLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.prose :deep(.post-h1) {
  font-size: clamp(1.875rem, 5vw, 2.25rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
}

.prose :deep(.post-h2) {
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-top: 2.5rem;
  margin-bottom: 1.25rem;
}

.prose :deep(.post-h3) {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(.post-p) {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.75;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.prose :deep(.post-ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin-bottom: 1.5rem;
}

.prose :deep(.post-ul) li {
  margin-bottom: 0.5rem;
}

.prose :deep(.post-li) {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.75;
  opacity: 0.8;
}

.prose :deep(.post-hr) {
  border: none;
  height: 1px;
  background-color: rgba(12, 0, 17, 0.1);
  margin: 3rem 0;
}

.prose :deep(.code-block) {
  background-color: rgba(12, 0, 17, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.prose :deep(.code-block code) {
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.625;
}

.prose :deep(.inline-code) {
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  background-color: rgba(12, 0, 17, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
</style>
