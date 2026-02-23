<script setup lang="ts">
/**
 * █ [UI_ATOM] :: APP_LINK
 * =====================================================================
 * DESC:   Wrapper sobre NuxtLink para navegación.
 * STATUS: STABLE
 * =====================================================================
 */
defineProps<{ to: string }>();
</script>

<template>
  <NuxtLink :to="to">
    <slot />
  </NuxtLink>
</template>
