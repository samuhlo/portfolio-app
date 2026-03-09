<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG LIST
 * =====================================================================
 * DESC:   Lista de posts filtrados por categoría.
 *         Tiene scroll interno y muestra los posts de forma elegante.
 *         Hover con movimiento GSAP y doodle de flecha.
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed } from 'vue';
import { BLOG_POSTS } from '~/data/blog-posts';
import { CATEGORY_LABELS, CATEGORY_COLORS, type BlogCategory } from '~/types/blog';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import DoodleArrowRightGeneral from '~/components/ui/doodles/general/DoodleArrowRightGeneral.vue';

const props = defineProps<{
  selectedCategory: BlogCategory | 'all';
}>();

const { gsap } = useGSAP();
const { preparePaths, addDrawAnimation, erasePaths } = useDoodleDraw();

// Filtrar posts según categoría
const filteredPosts = computed(() => {
  if (props.selectedCategory === 'all') {
    return BLOG_POSTS;
  }
  return BLOG_POSTS.filter((post) => post.category === props.selectedCategory);
});

// Formatear fecha
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Obtener color de categoría
function getCategoryColor(category: BlogCategory): string {
  return CATEGORY_COLORS[category];
}

// Formatear índice del post como _01, _02, etc.
function formatIndex(index: number): string {
  return `_${String(index + 1).padStart(2, '0')}`;
}

// GSAP hover handlers
const postRefs = ref<Record<string, HTMLElement | null>>({});
const arrowRefs = ref<Record<string, { svg: SVGSVGElement | null } | null>>({});
const arrowPaths = ref<Record<string, SVGPathElement[]>>({});

// Se ejecuta cada vez que el componente del doodle se monta o actualiza en la lista
const setArrowRef = (slug: string) => (el: any) => {
  if (el) {
    arrowRefs.value[slug] = el;
    if (!arrowPaths.value[slug] && el.svg) {
      arrowPaths.value[slug] = preparePaths(el.svg);
    }
  } else {
    delete arrowRefs.value[slug];
    delete arrowPaths.value[slug];
  }
};

function onMouseEnter(slug: string) {
  const postEl = postRefs.value[slug];
  if (postEl) {
    gsap.to(postEl, {
      x: 14,
      duration: 0.4,
      ease: 'power2.out',
    });
  }

  const arrowComponent = arrowRefs.value[slug];
  if (arrowComponent?.svg) {
    if (!arrowPaths.value[slug]) {
      arrowPaths.value[slug] = preparePaths(arrowComponent.svg);
    }

    gsap.killTweensOf(arrowComponent.svg);
    arrowPaths.value[slug].forEach((p) => gsap.killTweensOf(p));

    const tl = gsap.timeline();
    addDrawAnimation(tl, {
      svg: arrowComponent.svg,
      paths: arrowPaths.value[slug],
      duration: 0.17,
      stagger: 0.2,
      ease: 'power1.inOut',
    });
  }
}

function onMouseLeave(slug: string) {
  const postEl = postRefs.value[slug];
  if (postEl) {
    gsap.to(postEl, {
      x: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  }

  const arrowComponent = arrowRefs.value[slug];
  if (arrowComponent?.svg && arrowPaths.value[slug]) {
    erasePaths(arrowComponent.svg, arrowPaths.value[slug], {
      duration: 0.3,
      ease: 'power2.inOut',
    });
  }
}
</script>

<template>
  <div class="blog-list-container h-full">
    <div
      class="blog-list space-y-0 max-h-[60vh] overflow-x-hidden overflow-y-auto pr-4 custom-scrollbar"
    >
      <article
        v-for="(post, index) in filteredPosts"
        :key="post.slug"
        class="post-item-anim group relative cursor-pointer"
      >
        <NuxtLink
          :to="`/blog/${post.slug}`"
          class="block py-3 md:py-8"
          @mouseenter="onMouseEnter(post.slug)"
          @mouseleave="onMouseLeave(post.slug)"
        >
          <div
            :ref="
              (el) => {
                if (el) postRefs[post.slug] = el as HTMLElement;
              }
            "
            class="pl-5 md:pl-6"
          >
            <!-- Meta -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <span
                  class="text-[0.6rem] uppercase tracking-[0.2em] font-bold font-mono"
                  :style="{ color: getCategoryColor(post.category) }"
                >
                  {{ CATEGORY_LABELS[post.category] }}
                </span>
                <span class="text-[0.6rem] font-mono tracking-widest opacity-25">•</span>
                <span class="text-[0.6rem] font-mono tracking-widest opacity-40">
                  {{ formatDate(post.publishedAt) }}
                </span>
              </div>
              <!-- Índice del post: _01, _02, etc. -->
              <span class="text-[0.55rem] font-mono tracking-[0.2em] opacity-15 select-none">
                {{ formatIndex(index) }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-lg md:text-xl font-bold tracking-tight leading-snug">
              {{ post.title }}
            </h3>

            <!-- Excerpt -->
            <p class="mt-2 text-sm font-mono opacity-40 leading-relaxed line-clamp-2">
              {{ post.excerpt }}
            </p>

            <!-- Arrow Doodle -->
            <div class="mt-3 h-5 overflow-visible">
              <div class="w-14">
                <DoodleArrowRightGeneral
                  :ref="setArrowRef(post.slug)"
                  :stroke-color="getCategoryColor(post.category)"
                />
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Divider: clase blog-divider para animación GSAP con scaleX -->
        <div
          v-if="index < filteredPosts.length - 1"
          class="blog-divider border-t border-foreground/8 origin-left"
        />
      </article>

      <!-- Empty state -->
      <div v-if="filteredPosts.length === 0" class="py-12 text-center opacity-40">
        <p class="text-sm font-mono tracking-wide">No posts in this category</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(12, 0, 17, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(12, 0, 17, 0.2);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
