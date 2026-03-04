<script setup lang="ts">
/**
 * █ [PAGE] :: BLOG POST DETAIL
 * =====================================================================
 * DESC:   Página individual de un post del blog.
 *         Usa BlogPostLayout con BlogPostInfo (sidebar) y BlogPostBody.
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
import { type BlogPost } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import BlogPostLayout from '~/components/blog/BlogPostLayout.vue';
import BlogPostInfo from '~/components/blog/BlogPostInfo.vue';
import BlogPostBody from '~/components/blog/BlogPostBody.vue';
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

onMounted(() => {
  initGSAP(() => {
    if (!containerRef.value) return;

    // Info sidebar animation
    gsap.from('.post-info', {
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Body animation
    gsap.from('.post-body', {
      x: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.2,
    });
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
        <BlogPostBody :post="post" :content="renderedContent" />

        <!-- Post Navigation -->
        <nav class="mt-16 pt-8 border-t border-foreground/10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Next Post (newer) -->
            <div v-if="nextPost">
              <span class="text-xs font-mono uppercase tracking-[0.15em] opacity-30">← Next</span>
              <NuxtLink :to="`/blog/${nextPost.slug}`" class="block mt-2 group">
                <RandomDoodleHover>
                  <h3 class="text-base font-bold group-hover:opacity-60 transition-opacity">
                    {{ nextPost.title }}
                  </h3>
                </RandomDoodleHover>
              </NuxtLink>
            </div>

            <!-- Prev Post (older) -->
            <div v-if="prevPost" class="md:text-right md:ml-auto">
              <span class="text-xs font-mono uppercase tracking-[0.15em] opacity-30"
                >Previous →</span
              >
              <NuxtLink :to="`/blog/${prevPost.slug}`" class="block mt-2 group">
                <RandomDoodleHover>
                  <h3 class="text-base font-bold group-hover:opacity-60 transition-opacity">
                    {{ prevPost.title }}
                  </h3>
                </RandomDoodleHover>
              </NuxtLink>
            </div>
          </div>
        </nav>
      </template>
    </BlogPostLayout>
  </div>
</template>
