<template>
  <div>
    <!-- [NOTE] Inyecta ASCII Art onMounted y se mantiene invisible -->
    <ConsoleMessage />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- [NOTE] Global para no re-renderizar la animación de grain entre páginas -->
    <NoiseBackground />
  </div>
</template>
