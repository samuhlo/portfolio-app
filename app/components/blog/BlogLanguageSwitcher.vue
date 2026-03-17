<script setup lang="ts">
/**
 * ========================================================================
 * [UI_ATOM] :: BLOG LANGUAGE SWITCHER
 * ========================================================================
 * DESC:   Muestra los 3 locales disponibles para el post actual.
 *         Activo: locale corriente. Disponible: link a switchLocalePath.
 *         No disponible: deshabilitado (no hay traducción para ese slug).
 * STATUS: STABLE
 * ========================================================================
 */

import { ref, watch } from 'vue';
import { useI18n, useSwitchLocalePath } from '#imports';

const props = defineProps<{
  slug: string;
}>();

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

type LocaleStatus = {
  code: string;
  name: string;
  path: string;
  active: boolean;
  available: boolean;
};

const localeStatuses = ref<LocaleStatus[]>([]);

async function checkAvailability() {
  const results = await Promise.all(
    locales.value.map(async (loc) => {
      let available = false;
      if (loc.code === locale.value) {
        available = true;
      } else {
        const result = await queryCollection('blog')
          .where('slug', '=', props.slug)
          .where('lang', '=', loc.code)
          .first();
        available = !!result;
      }
      return {
        code: loc.code,
        name: loc.name ?? loc.code.toUpperCase(),
        path: switchLocalePath(loc.code),
        active: loc.code === locale.value,
        available,
      };
    }),
  );
  localeStatuses.value = results;
}

await checkAvailability();
watch(() => props.slug, checkAvailability);
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
        >
          {{ loc.code }}
        </NuxtLink>

        <!-- Unavailable locale -->
        <span
          v-else
          class="text-[0.6rem] font-mono uppercase tracking-[0.15em] opacity-20 cursor-not-allowed"
          :title="`Not available in ${loc.name} yet`"
        >
          {{ loc.code }}
        </span>
      </template>
    </div>
  </div>
</template>
