<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG INDEX
 * =====================================================================
 * DESC:   Lista de categorías del blog con contador de posts.
 *         Permite filtrar los posts por categoría.
 * STATUS: STABLE
 * =====================================================================
 */

import { computed } from 'vue';
import { BLOG_POSTS } from '~/data/blog-posts';
import { CATEGORY_LABELS, CATEGORY_COLORS, type BlogCategory } from '~/types/blog';

const props = defineProps<{
  selectedCategory: BlogCategory | 'all';
}>();

const emit = defineEmits<{
  (e: 'select', category: BlogCategory | 'all'): void;
}>();

// Calcular posts por categoría
const categoryCounts = computed(() => {
  const counts: Record<BlogCategory | 'all', number> = {
    all: BLOG_POSTS.length,
    'weekly-update': 0,
    'design-article': 0,
    thoughts: 0,
  };

  BLOG_POSTS.forEach((post) => {
    counts[post.category]++;
  });

  return counts;
});

const categories = computed(() => [
  { id: 'all' as const, label: 'All', count: categoryCounts.value.all },
  {
    id: 'weekly-update' as const,
    label: CATEGORY_LABELS['weekly-update'],
    count: categoryCounts.value['weekly-update'],
  },
  {
    id: 'design-article' as const,
    label: CATEGORY_LABELS['design-article'],
    count: categoryCounts.value['design-article'],
  },
  {
    id: 'thoughts' as const,
    label: CATEGORY_LABELS['thoughts'],
    count: categoryCounts.value['thoughts'],
  },
]);

function getCategoryColor(category: BlogCategory | 'all'): string {
  if (category === 'all') return 'currentColor';
  return CATEGORY_COLORS[category];
}

function selectCategory(category: BlogCategory | 'all') {
  emit('select', category);
}
</script>

<template>
  <nav class="blog-index flex flex-col gap-1">
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="selectCategory(cat.id)"
      class="category-item group flex items-center justify-between w-full py-3 px-0 text-left transition-all duration-300 cursor-pointer"
      :class="[selectedCategory === cat.id ? 'opacity-100' : 'opacity-40 hover:opacity-70']"
    >
      <span
        class="text-sm md:text-base font-sans tracking-wide"
        :style="{ color: selectedCategory === cat.id ? getCategoryColor(cat.id) : undefined }"
      >
        {{ cat.label }}
      </span>
      <span class="text-xs tracking-[0.15em] opacity-50 font-mono">
        {{ cat.count }}
      </span>
    </button>
  </nav>
</template>
