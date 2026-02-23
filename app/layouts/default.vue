<template>
  <div class="flex flex-col min-h-screen font-sans">
    <AppNav />
    <main class="grow w-full">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
/**
 * █ [LAYOUT] :: DEFAULT LAYOUT
 * =====================================================================
 * DESC:   Estructura base de la aplicación (Nav + Main slot + Footer).
 * STATUS: STABLE
 * =====================================================================
 */
</script>
