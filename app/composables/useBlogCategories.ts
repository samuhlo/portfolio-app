/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG CATEGORIES
 * ========================================================================
 * DESC:   Lista de categorías con conteo de posts publicados.
 *         Derivado de useBlogPosts — sin fetch adicional.
 *         Incluye la opción 'all' con el total de posts.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { CATEGORY_LABELS, type BlogCategory, type CategoryItem } from '~/types/blog';
import { useBlogPosts } from '~/composables/useBlogPosts';

const ALL_CATEGORIES: BlogCategory[] = ['weekly_log', 'find', 'breakdown', 'roots'];

export function useBlogCategories() {
  const { posts } = useBlogPosts();

  const categories = computed<CategoryItem[]>(() => [
    { id: 'all', label: 'all', count: posts.value.length },
    ...ALL_CATEGORIES.map((cat) => ({
      id: cat,
      label: CATEGORY_LABELS[cat],
      count: posts.value.filter((p) => p.category === cat).length,
    })),
  ]);

  return { categories };
}
