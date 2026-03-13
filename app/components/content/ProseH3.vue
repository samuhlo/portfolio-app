<script setup lang="ts">
/**
 * ========================================================================
 * [PROSE] :: PROSE H3
 * ========================================================================
 * DESC:   Override de <h3> en markdown. scroll-margin-top para que
 *         los IDs generados por Nuxt Content funcionen con navegación.
 * STATUS: STABLE
 * ========================================================================
 */

defineOptions({ inheritAttrs: false });

defineProps<{
  id?: string;
}>();
</script>

<template>
  <h3 :id="id" class="prose-reveal scroll-mt-16">
    <slot />
  </h3>
</template>
