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

import { computed, ref } from 'vue';
import { useI18n, useLocalePath, useRouter } from '#imports';
import type { BlogPostTranslation } from '~/types/blog';
import { useBlogNavigationContext } from '~/composables/useBlogNavigationContext';
import { useGSAP } from '~/composables/useGSAP';

const props = defineProps<{
  translations: BlogPostTranslation[];
}>();

const { locale, locales } = useI18n();
const router = useRouter();
const localePath = useLocalePath();
const { markLocaleSwitch } = useBlogNavigationContext();
const { gsap } = useGSAP();
const isSwitching = ref(false);

// =============================================================================
// █ LOCALE MATRIX
// =============================================================================
// [NOTE] Construye estado visual por locale:
// active -> locale actual
// available -> existe traducción publicada con translationKey

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

function animateBeforeLocaleChange(): Promise<void> {
  // [NOTE] Fade-out PRE-NAVEGACIÓN.
  // OBJETIVO -> Evitar cambio instantáneo de texto antes de acabar la salida.
  return new Promise((resolve) => {
    if (!import.meta.client) {
      resolve();
      return;
    }

    // [NOTE] Target global del post para salida coordinada.
    // Incluye cuerpo + sidebar + líneas de acento.
    const targets = Array.from(
      document.querySelectorAll(
        '.post-body-title, .post-body-excerpt, .post-content, .info-section-anim, .blog-post-nav, .post-body-line, .post-body-accent-line',
      ),
    );

    if (targets.length === 0) {
      resolve();
      return;
    }

    gsap.to(targets, {
      opacity: 0.4,
      duration: 0.32,
      ease: 'power3.inOut',
      stagger: 0.014,
      onComplete: () => resolve(),
    });
  });
}

async function handleLocaleClick(code: string, path: string) {
  // [NOTE] Guard anti-doble click durante transición.
  if (code === locale.value || isSwitching.value) return;

  isSwitching.value = true;

  try {
    // 1) Salida visual del idioma actual
    await animateBeforeLocaleChange();

    // 2) Marca contexto para que la página destino use animación de locale-switch
    markLocaleSwitch();

    // 3) Navega cuando la salida ya terminó
    await router.push(path);
  } finally {
    isSwitching.value = false;
  }
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
