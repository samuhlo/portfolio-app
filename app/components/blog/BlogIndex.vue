<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG INDEX
 * =====================================================================
 * DESC:   Lista de categorías del blog con contador de posts.
 *         Recibe posts desde el padre para calcular contadores.
 *         CategoryCircle rodea la categoría activa.
 * STATUS: STABLE
 * =====================================================================
 */

import { computed } from 'vue';
import { CATEGORY_LABELS, CATEGORY_COLORS, type BlogCategory, type BlogPost } from '~/types/blog';
import CategoryCircle from './CategoryCircle.vue';

const props = defineProps<{
  selectedCategory: BlogCategory | 'all';
  posts: BlogPost[];
}>();

const emit = defineEmits<{
  (e: 'select', category: BlogCategory | 'all'): void;
}>();

const categories = computed(() => [
  { id: 'all' as const, label: 'all', count: props.posts.length },
  {
    id: 'weekly_log' as const,
    label: CATEGORY_LABELS['weekly_log'],
    count: props.posts.filter((p) => p.category === 'weekly_log').length,
  },
  {
    id: 'find' as const,
    label: CATEGORY_LABELS['find'],
    count: props.posts.filter((p) => p.category === 'find').length,
  },
  {
    id: 'breakdown' as const,
    label: CATEGORY_LABELS['breakdown'],
    count: props.posts.filter((p) => p.category === 'breakdown').length,
  },
  {
    id: 'outside' as const,
    label: CATEGORY_LABELS['outside'],
    count: props.posts.filter((p) => p.category === 'outside').length,
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
  <nav class="blog-index flex flex-col gap-0 py-7">
    <div v-for="cat in categories" :key="cat.id" class="category-wrapper">
      <button
        @click="selectCategory(cat.id)"
        class="category-item-anim group flex items-center justify-between w-full py-1.5 md:py-2 px-0 text-left cursor-pointer relative"
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
        <span class="text-xs tracking-[0.15em] opacity-50 font-mono">
          {{ cat.count }}
        </span>
      </button>
    </div>
  </nav>
</template>
