<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const isLoading = ref(true);

// ESPERAR HIDRATACIÓN COMPLETA -> onMounted de los hijos (GSAP) ya ejecutó.
// nextTick asegura DOM actualizado, rAF asegura que el browser ya pintó.
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
    <!-- [NOTE] Inyecta ASCII Art onMounted y se mantiene invisible -->
    <ConsoleMessage />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- [NOTE] Global para no re-renderizar la animación de grain entre páginas -->
    <NoiseBackground />
  </div>
</template>
