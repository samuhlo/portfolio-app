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

import { ref, watch } from 'vue';
import { useI18n, useLocalePath } from '#imports';
import type { BlogPost, TocHeading, BlogPostTranslation } from '~/types/blog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import { useLenis } from '~/composables/useLenis';
import RandomDoodleHover from '~/components/ui/RandomDoodleHover.vue';

const props = withDefaults(
  defineProps<{
    post: BlogPost;
    showTitle?: boolean;
    revealedHeadings?: TocHeading[];
    activeHeadingId?: string;
    translations?: BlogPostTranslation[];
    compact?: boolean;
  }>(),
  {
    showTitle: false,
    revealedHeadings: () => [],
    activeHeadingId: '',
    translations: () => [],
    compact: false,
  },
);

const lenis = useLenis();
const localePath = useLocalePath();
const { locale } = useI18n();

const dateLocale = computed(() => {
  if (locale.value === 'gl') return 'gl-ES';
  if (locale.value === 'es') return 'es-ES';
  return 'en-US';
});

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
  const date = parsePostDate(dateStr);
  if (!date) return '—';

  return date.toLocaleDateString(dateLocale.value, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  const date = parsePostDate(dateStr);
  if (!date) return '—';

  return date.toLocaleDateString(dateLocale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parsePostDate(dateStr: string): Date | null {
  let date: Date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    date = new Date(year as number, (month as number) - 1, day as number);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return null;
  return date;
}

const categoryColor = computed(() => CATEGORY_COLORS[props.post.category]);

</script>

<template>
  <div class="blog-post-info" :class="{ 'sticky top-32': !compact }">
    <!-- Back link -->
    <div v-if="!compact" class="info-section-anim mb-10">
      <RandomDoodleHover :stroke-width="3" :stroke-color="categoryColor">
        <NuxtLink
          :to="localePath('/blog')"
          :aria-label="$t('blog.label_back')"
          class="nav-link inline-flex items-center gap-2"
        >
          <span>←</span>
          <span>{{ $t('blog.label_back') }}</span>
        </NuxtLink>
      </RandomDoodleHover>
    </div>

    <!-- Sidebar title (scroll reveal) -->
    <div
      v-if="!compact"
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
      v-if="!compact && revealedHeadings && revealedHeadings.length > 0"
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

    <div
      v-if="compact"
      class="info-section-anim text-[0.65rem] font-mono uppercase tracking-widest opacity-60 leading-relaxed mt-9"
    >
      <span :style="{ color: categoryColor }" class="font-bold">{{
        CATEGORY_LABELS[post.category]
      }}</span>
      <span> · {{ formatShortDate(post.date) }}</span>
      <span> · {{ post.time_to_read }} min</span>
      <span v-if="post.topics.length > 0"> · {{ post.topics.slice(0, 3).join(', ') }}</span>

      <BlogCopyLink :color="categoryColor" compact />
    </div>

    <div v-else class="flex flex-col">
      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">{{ $t('blog.label_category') }}</p>
        <div class="flex items-center gap-2">
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

      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">{{ $t('blog.label_published') }}</p>
        <p class="text-xs font-mono opacity-75">{{ formatDate(post.date) }}</p>
      </div>

      <div class="info-section-anim py-4 border-b border-foreground/8">
        <p class="meta-label mb-2">{{ $t('blog.label_read_time') }}</p>
        <p class="text-xs font-mono opacity-60">
          <span class="font-bold text-sm">{{ post.time_to_read }}</span>
          <span class="opacity-60"> min</span>
        </p>
      </div>

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

      <BlogLanguageSwitcher :translations="translations ?? []" />

      <div class="info-section-anim pt-4">
        <BlogCopyLink :color="categoryColor" />
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
