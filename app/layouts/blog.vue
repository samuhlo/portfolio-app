<script setup lang="ts">
/**
 * █ [LAYOUT] :: BLOG LAYOUT
 * =====================================================================
 * DESC:   Layout específico para las páginas del blog.
 *         Sin el footer con contact, más minimalista.
 * STATUS: STABLE
 * =====================================================================
 */
</script>

<template>
  <div class="blog-layout flex flex-col min-h-screen font-sans">
    <AppNav />
    <main class="grow w-full overflow-x-clip">
      <div class="pt-20 md:pt-28 px-6 md:px-12">
        <slot />
      </div>
    </main>
  </div>
</template>
