<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const localeHead = useLocaleHead({ seo: true });

const isLoading = ref(true);

useHead(() => {
  const dir = localeHead.value.htmlAttrs?.dir;
  const normalizedDir = dir === 'ltr' || dir === 'rtl' || dir === 'auto' ? dir : undefined;

  return {
    htmlAttrs: {
      lang: localeHead.value.htmlAttrs?.lang,
      dir: normalizedDir,
    },
    link: [...(localeHead.value.link ?? [])],
    meta: [...(localeHead.value.meta ?? [])],
    bodyAttrs: {
      class: isLoading.value ? 'noise-paused' : '',
    },
  };
});

const TRANSITION_BUFFER_MS = 100;

onMounted(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    setTimeout(() => {
      isLoading.value = false;
    }, TRANSITION_BUFFER_MS);
  });
});
</script>

<template>
  <div>
    <PageLoader :visible="isLoading" />
    <ClientOnly>
      <NoiseBackground />
    </ClientOnly>
    <AppMobileMenu />
    <ConsoleMessage />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
