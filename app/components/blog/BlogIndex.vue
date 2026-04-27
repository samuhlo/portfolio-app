<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG INDEX
 * =====================================================================
 * DESC:   Lista de categorías del blog con contador de posts.
 *         Puramente presentacional — recibe categorías pre-computadas
 *         desde useBlogCategories() a través del padre.
 * STATUS: STABLE
 * =====================================================================
 */

import gsap from 'gsap';
import { ref, watch, onMounted, nextTick, type ComponentPublicInstance } from 'vue';

import { useDoodleDraw } from '~/composables/useDoodleDraw';
import CategoryCircle from '~/components/blog/CategoryCircle.vue';
import DoodleUnderlineGeneral from '~/components/ui/doodles/general/DoodleUnderlineGeneral.vue';
import { CATEGORY_COLORS, type BlogCategory, type CategoryItem } from '~/types/blog';
import type { DoodleExposed } from '~/types/doodle';

const props = defineProps<{
  selectedCategory: BlogCategory | 'all';
  categories: CategoryItem[];
}>();

const emit = defineEmits<{
  (e: 'select', category: BlogCategory | 'all'): void;
}>();

const { preparePaths, addDrawAnimation, erasePaths, resetPaths } = useDoodleDraw();

const mobileUnderlineRefs = ref<Record<string, DoodleExposed | null>>({});
const mobileUnderlinePaths = ref<Record<string, SVGPathElement[]>>({});

const setMobileUnderlineRef = (id: string) => (el: Element | ComponentPublicInstance | null) => {
  const doodle = el as DoodleExposed | null;

  if (doodle) {
    mobileUnderlineRefs.value[id] = doodle;

    if (doodle.svg) {
      mobileUnderlinePaths.value[id] = preparePaths(doodle.svg);
    }

    return;
  }

  delete mobileUnderlineRefs.value[id];
  delete mobileUnderlinePaths.value[id];
};

function getCategoryColor(category: BlogCategory | 'all'): string {
  if (category === 'all') return 'currentColor';
  return CATEGORY_COLORS[category];
}

function selectCategory(category: BlogCategory | 'all') {
  emit('select', category);
}

function drawMobileUnderline(id: string) {
  const doodle = mobileUnderlineRefs.value[id];
  const paths = mobileUnderlinePaths.value[id];

  if (!doodle?.svg || !paths?.length) return;

  // BLINDAJE -> Evitar animaciones huerfanas en taps rapidos.
  gsap.killTweensOf(doodle.svg);
  paths.forEach((p) => gsap.killTweensOf(p));

  resetPaths(doodle.svg, paths);

  const tl = gsap.timeline();

  addDrawAnimation(tl, {
    svg: doodle.svg,
    paths,
    duration: 0.8,
    ease: 'power2.out',
  });
}

function eraseMobileUnderlines() {
  Object.entries(mobileUnderlineRefs.value).forEach(([id, doodle]) => {
    if (!doodle?.svg) return;

    const paths = mobileUnderlinePaths.value[id];

    if (paths?.length) {
      erasePaths(doodle.svg, paths);
    }
  });
}

watch(
  () => props.selectedCategory,
  async (newCat) => {
    eraseMobileUnderlines();

    if (newCat === 'all') return;

    await nextTick();
    drawMobileUnderline(newCat);
  },
);

onMounted(() => {
  if (props.selectedCategory !== 'all') {
    drawMobileUnderline(props.selectedCategory);
  }
});
</script>

<template>
  <nav
    class="blog-index-mobile flex flex-row overflow-x-auto no-scrollbar gap-3 pb-3 pt-1 md:hidden"
  >
    <div v-for="cat in categories" :key="cat.id" class="category-wrapper shrink-0">
      <button
        @click="selectCategory(cat.id)"
        class="category-item-anim group relative flex items-center gap-2 px-3 py-1.5 text-left cursor-pointer shrink-0"
        :class="[
          selectedCategory === cat.id ? 'opacity-100 font-bold' : 'opacity-80',
        ]"
      >
        <span class="text-xs font-mono uppercase tracking-wide pr-4">
          {{ cat.label }}
        </span>

        <DoodleUnderlineGeneral
          v-if="cat.id !== 'all' && selectedCategory === cat.id"
          :ref="setMobileUnderlineRef(cat.id)"
          :stroke-color="getCategoryColor(cat.id)"
          :stroke-width="2"
          class="absolute left-0 bottom-0 w-full pointer-events-none"
          style="height: 0.6em"
        />
      </button>
    </div>
  </nav>

  <nav class="blog-index-desktop hidden flex-col gap-0 py-7 md:flex">
    <div v-for="cat in categories" :key="cat.id" class="category-wrapper">
      <button
        @click="selectCategory(cat.id)"
        class="category-item-anim group flex items-center justify-between w-full py-2 text-left cursor-pointer relative"
        :class="[
          selectedCategory === cat.id ? 'opacity-100 font-bold' : 'opacity-90 hover:opacity-100',
        ]"
      >
        <CategoryCircle
          v-if="cat.id !== 'all'"
          :is-active="selectedCategory === cat.id"
          :color="getCategoryColor(cat.id)"
        >
          <span class="text-xs md:text-sm font-mono uppercase tracking-wide pl-3">
            {{ cat.label }}
          </span>
        </CategoryCircle>

        <span v-else class="text-xs md:text-sm font-mono uppercase tracking-wide pl-3">
          {{ cat.label }}
        </span>

        <span class="text-xs tracking-[0.15em] opacity-60 font-mono">
          {{ cat.count }}
        </span>
      </button>
    </div>
  </nav>
</template>
