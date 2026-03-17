<script setup lang="ts">
/**
 * ========================================================================
 * [UI_ATOM] :: BLOG NAV LOCALE SWITCHER
 * ========================================================================
 * DESC:   Switcher de idioma para el nav del blog. Tres locales (ES/EN/GL).
 *         Usa switchLocalePath + NuxtLink → router push client-side,
 *         sin recarga de página. useBlogPosts reacciona al cambio de
 *         locale via watch, por lo que la lista se actualiza sin reload.
 * STATUS: STABLE
 * ========================================================================
 */

import { useI18n, useSwitchLocalePath } from '#imports';

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
</script>

<template>
  <div class="flex items-center gap-3 text-xs uppercase tracking-widest font-medium">
    <template v-for="loc in locales" :key="loc.code">
      <span
        v-if="loc.code === locale"
        class="opacity-100 font-bold"
      >{{ loc.code }}</span>
      <NuxtLink
        v-else
        :to="switchLocalePath(loc.code)"
        class="opacity-30 hover:opacity-80 transition-opacity duration-200"
      >{{ loc.code }}</NuxtLink>
    </template>
  </div>
</template>
