<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const reqUrl = useRequestURL();

useHead({
  link: [{ rel: 'canonical', href: reqUrl.href }],
});

const isLoading = ref(true);

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
    <ConsoleMessage />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
