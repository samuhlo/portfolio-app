<script setup lang="ts">
/**
 * ========================================================================
 * [UI_ATOM] :: BLOG NAV LOCALE SWITCHER
 * ========================================================================
 * DESC:   Switcher de idioma para el nav del blog. Tres locales (ES/EN/GL).
 *         En posts con slug traducido, si no existe traducción en el locale
 *         destino hace fallback al índice del blog de ese idioma.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed, ref, watch } from 'vue';
import { useI18n, useLocalePath, useRoute, useRouter, useSwitchLocalePath } from '#imports';
import { useBlogNavigationContext } from '~/composables/useBlogNavigationContext';
import { useBlogHeaderAnimationGate } from '~/composables/useBlogHeaderAnimationGate';
import { useGSAP } from '~/composables/useGSAP';

type TranslationEntry = {
  lang: string;
  slug: string;
};

type TranslationKeyEntry = {
  translationKey: string;
};

const { locale, locales } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const { markLocaleSwitch } = useBlogNavigationContext();
const { isAnimating } = useBlogHeaderAnimationGate();
const { gsap } = useGSAP();

const displayLocaleCode = (code: string): string => (code === 'gl' ? 'gz' : code);

type PendingLocaleNavigation = {
  code: string;
  path: string;
};

const pendingNavigation = ref<PendingLocaleNavigation | null>(null);
const isSwitching = ref(false);

// =============================================================================
// █ ROUTE GUARDS
// =============================================================================
// [NOTE] Solo en /blog index se bloquea click hasta que termine
// la animación del header principal.
const isBlogIndexRoute = computed(() => /^\/(?:[a-z]{2}\/)?blog\/?$/.test(route.path));

function animateBeforeLocaleChange(): Promise<void> {
  // [NOTE] Salida visual antes de cambiar de locale en post detail.
  // Evita el "texto nuevo aparece mientras se desvanece el viejo".
  return new Promise((resolve) => {
    if (!import.meta.client) {
      resolve();
      return;
    }

    // [NOTE] Targets comunes para salida coherente en artículo.
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

async function executeLocaleNavigation(code: string, path: string) {
  // [NOTE] Guard anti-race: evita 2 pushes en paralelo.
  if (isSwitching.value) return;

  isSwitching.value = true;

  try {
    if (isBlogPostRoute.value) {
      // PRE-SALIDA -> Solo para post detail.
      await animateBeforeLocaleChange();
    }

    // [NOTE] Señal consumida por páginas blog para ajustar loaders/animación.
    markLocaleSwitch();

    await router.push(path);
  } finally {
    isSwitching.value = false;
  }
}

function handleLocaleClick(code: string, path: string) {
  if (code === locale.value) return;

  // [NOTE] En /blog esperar a que termine la animación del header.
  if (isBlogIndexRoute.value && isAnimating.value) {
    pendingNavigation.value = { code, path };
    return;
  }

  // [NOTE] Flujo normal cuando no hay gating por header.
  executeLocaleNavigation(code, path);
}

watch(isAnimating, (animating) => {
  // [NOTE] Cuando termina header animation, dispara navegación pendiente.
  if (animating || !pendingNavigation.value) return;

  const nextNavigation = pendingNavigation.value;
  pendingNavigation.value = null;

  executeLocaleNavigation(nextNavigation.code, nextNavigation.path);
});

const slugParam = computed(() => {
  const slug = route.params.slug;
  return typeof slug === 'string' ? slug : '';
});

const isBlogPostRoute = computed(() => /^\/(?:[a-z]{2}\/)?blog\/[^/]+\/?$/.test(route.path));

const { data: translations } = useAsyncData(
  () => `blog-nav-translations-${locale.value}-${slugParam.value}`,
  async () => {
    if (!isBlogPostRoute.value || !slugParam.value) return [];

    const currentPost = (await queryCollection('blog')
      .where('slug', '=', slugParam.value)
      .where('lang', '=', locale.value)
      .select('translationKey')
      .first()) as TranslationKeyEntry | null;

    if (!currentPost?.translationKey) return [];

    const rows = await queryCollection('blog')
      .where('translationKey', '=', currentPost.translationKey)
      .where('published', '=', true)
      .select('lang', 'slug')
      .all();

    return rows as TranslationEntry[];
  },
  { watch: [locale, slugParam, () => route.path] },
);

const localizedRoutes = computed(() =>
  locales.value.map((loc) => {
    const code = loc.code;
    const active = code === locale.value;

    if (!isBlogPostRoute.value) {
      return {
        code,
        active,
        path: switchLocalePath(code),
      };
    }

    const translated = translations.value?.find((item) => item.lang === code);

    return {
      code,
      active,
      path: translated ? localePath(`/blog/${translated.slug}`, code) : localePath('/blog', code),
    };
  }),
);
</script>

<template>
  <div class="flex items-center gap-3 text-xs uppercase tracking-widest font-medium">
    <template v-for="loc in localizedRoutes" :key="loc.code">
      <span v-if="loc.active" class="opacity-100 font-bold">{{ displayLocaleCode(loc.code) }}</span>
      <NuxtLink
        v-else
        :to="loc.path"
        class="opacity-30 hover:opacity-80 transition-opacity duration-200"
        @click.prevent="handleLocaleClick(loc.code, loc.path)"
        >{{ displayLocaleCode(loc.code) }}</NuxtLink
      >
    </template>
  </div>
</template>
