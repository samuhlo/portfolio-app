<script setup lang="ts">
/**
 * ========================================================================
 * [UI_ATOM] :: BLOG LANGUAGE SWITCHER
 * ========================================================================
 * DESC:   Muestra los locales disponibles para el post actual.
 *         Usa translationKey (slug traducido por idioma) para resolver links.
 *         No disponible: deshabilitado si no existe traducción publicada.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed } from 'vue';
import { useI18n, useLocalePath } from '#imports';
import type { BlogPostTranslation } from '~/types/blog';

const props = defineProps<{
  translations: BlogPostTranslation[];
}>();

const { locale, locales } = useI18n();
const localePath = useLocalePath();

// =============================================================================
// █ LOCALE MATRIX
// =============================================================================
type LocaleStatus = {
  code: string;
  name: string;
  path: string;
  active: boolean;
  available: boolean;
};

const localeStatuses = computed<LocaleStatus[]>(() =>
  locales.value.map((loc) => {
    const code = loc.code;
    const name = loc.name ?? loc.code.toUpperCase();
    const translation = props.translations.find((item) => item.lang === code);
    const active = code === locale.value;
    const available = active || Boolean(translation);

    return {
      code,
      name,
      path: translation ? localePath(`/blog/${translation.slug}`, code) : '',
      active,
      available,
    };
  }),
);

function handleLocaleClick(code: string, path: string) {
  if (code === locale.value) return;
  navigateTo(path);
}
</script>

<template>
  <div class="info-section-anim py-4 border-b border-foreground/8">
    <div class="flex items-center gap-3">
      <template v-for="loc in localeStatuses" :key="loc.code">
        <!-- Active locale -->
        <span
          v-if="loc.active"
          class="text-[0.6rem] font-mono uppercase tracking-[0.15em] font-bold cursor-default"
        >
          {{ loc.code }}
        </span>

        <!-- Available locale -->
        <NuxtLink
          v-else-if="loc.available"
          :to="loc.path"
          class="text-[0.6rem] font-mono uppercase tracking-[0.15em] opacity-45 hover:opacity-85 transition-opacity duration-200"
          @click.prevent="handleLocaleClick(loc.code, loc.path)"
        >
          {{ loc.code }}
        </NuxtLink>

        <!-- Unavailable locale -->
        <span
          v-else
          class="text-[0.6rem] font-mono uppercase tracking-[0.15em] opacity-20 cursor-not-allowed"
          :title="`${loc.name} · ${$t('blog.label_locale_not_available')}`"
        >
          {{ loc.code }}
        </span>
      </template>
    </div>
  </div>
</template>
