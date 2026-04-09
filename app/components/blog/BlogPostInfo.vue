<script setup lang="ts">
/**
 * ========================================================================
 * [UI_MOLECULE] :: BLOG POST INFO
 * ========================================================================
 * DESC:   Sidebar de metadata. Estética: vertical strip minimalista
 *         con la categoría como elemento de color primario.
 *         Título sticky con GSAP al hacer scroll.
 * STATUS: STABLE
 * ========================================================================
 */

import { ref, watch, onUnmounted } from 'vue';
import type { BlogPost, TocHeading } from '~/types/blog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import { useLenis } from '~/composables/useLenis';
import RandomDoodleHover from '~/components/ui/RandomDoodleHover.vue';

const props = defineProps<{
  post: BlogPost;
  showTitle?: boolean;
  revealedHeadings?: TocHeading[];
  activeHeadingId?: string;
}>();

const lenis = useLenis();

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (!el || !lenis) return;
  // Offset negativo para compensar el nav sticky (~100px)
  lenis.scrollTo(el, { offset: -100 });
}

const { gsap } = useGSAP();
const sidebarTitleRef = ref<HTMLElement | null>(null);

watch(
  () => props.showTitle,
  (show) => {
    if (!sidebarTitleRef.value) return;

    if (show) {
      gsap.set(sidebarTitleRef.value, { display: 'block', height: 'auto', opacity: 1 });
      const fullHeight = sidebarTitleRef.value.offsetHeight;
      gsap.set(sidebarTitleRef.value, { height: 0, opacity: 0 });
      gsap.to(sidebarTitleRef.value, {
        height: fullHeight,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      gsap.to(sidebarTitleRef.value, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (sidebarTitleRef.value) gsap.set(sidebarTitleRef.value, { display: 'none' });
        },
      });
    }
  },
);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const categoryColor = computed(() => CATEGORY_COLORS[props.post.category]);

const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

async function copyLink() {
  if (import.meta.client) {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

onUnmounted(() => {
  if (copyTimer) clearTimeout(copyTimer);
})
</script>

<template>
  <div class="blog-post-info sticky top-32">
    <!-- Back link -->
    <div class="info-section-anim mb-10">
      <RandomDoodleHover :stroke-width="3" :stroke-color="categoryColor">
        <NuxtLink to="/blog" aria-label="Back to blog" class="nav-link inline-flex items-center gap-2">
          <span>←</span>
          <span>{{ $t('blog.label_back') }}</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Sidebar title (scroll reveal) -->
    <div
      ref="sidebarTitleRef"
      class="overflow-hidden mb-8"
      style="display: none; height: 0; opacity: 0"
    >
      <p class="text-xl font-bold leading-snug tracking-tight">
        {{ post.title }}
      </p>
      <div class="mt-1 h-px bg-foreground/8" />
    </div>

    <!-- TOC: headings revelados progresivamente al hacer scroll -->
    <TransitionGroup
      v-if="revealedHeadings && revealedHeadings.length > 0"
      name="toc"
      tag="div"
      class="toc-list mb-8"
    >
      <button
        v-for="heading in revealedHeadings"
        :key="heading.id"
        class="toc-item group flex items-start gap-2 w-full text-left py-0.5 cursor-pointer"
        :class="heading.level === 3 ? 'pl-3' : ''"
        @click="scrollToHeading(heading.id)"
      >
        <!-- Indicador activo -->
        <span
          class="mt-[0.35em] w-1 h-1 rounded-full shrink-0 transition-all duration-300"
          :class="
            activeHeadingId === heading.id
              ? 'opacity-100 scale-125'
              : 'opacity-25 group-hover:opacity-60'
          "
          :style="{
            backgroundColor: activeHeadingId === heading.id ? categoryColor : 'currentColor',
          }"
        />
        <span
          class="text-[0.62rem] font-mono uppercase tracking-widest leading-snug transition-opacity duration-200"
          :class="
            activeHeadingId === heading.id ? 'opacity-85' : 'opacity-35 group-hover:opacity-65'
          "
        >
          {{ heading.text }}
        </span>
      </button>
    </TransitionGroup>

    <!-- Metadata -->
    <div class="flex flex-col">
      <!-- Category — el elemento de color del sidebar -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">{{ $t('blog.label_category') }}</p>
        <div class="flex items-center gap-2">
          <!-- Dot en color de categoría -->
          <span
            class="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            :style="{ backgroundColor: categoryColor }"
          />
          <span
            class="text-xs font-mono uppercase tracking-[0.15em] font-bold"
            :style="{ color: categoryColor }"
          >
            {{ CATEGORY_LABELS[post.category] }}
          </span>
        </div>
      </div>

      <!-- Published -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">{{ $t('blog.label_published') }}</p>
        <p class="text-xs font-mono opacity-75">{{ formatDate(post.date) }}</p>
      </div>

      <!-- Read time -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">{{ $t('blog.label_read_time') }}</p>
        <p class="text-xs font-mono opacity-60">
          <span class="font-bold text-sm">{{ post.time_to_read }}</span>
          <span class="opacity-60"> min</span>
        </p>
      </div>

      <!-- Topics -->
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-3">{{ $t('blog.label_topics') }}</p>
        <div class="flex flex-col gap-1.5">
          <span
            v-for="topic in post.topics"
            :key="topic"
            class="text-[0.6rem] font-mono uppercase tracking-[0.12em] opacity-65"
          >
            {{ topic }}
          </span>
        </div>
      </div>

      <!-- Language switcher -->
      <BlogLanguageSwitcher :slug="post.slug" />

      <!-- Share -->
      <div class="info-section-anim pt-4">
        <button aria-label="Copy link to this post" class="group flex items-center gap-2 cursor-pointer" @click="copyLink">
          <span
            class="text-[0.6rem] font-mono uppercase tracking-[0.2em] opacity-45 group-hover:opacity-85 transition-opacity duration-200"
          >
            {{ $t('blog.label_copy_link') }}
          </span>
        </button>
        <span aria-live="polite" class="sr-only">{{ copied ? 'Link copied' : '' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── TOC TransitionGroup ─────────────────────────────────── */
.toc-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.toc-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toc-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.toc-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
/* Evita saltos de layout al eliminar items */
.toc-leave-active {
  position: absolute;
}
.toc-list {
  position: relative;
}
</style>
