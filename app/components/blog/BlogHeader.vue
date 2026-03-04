<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG HEADER
 * =====================================================================
 * DESC:   Título principal de la sección logs.
 *         Encapsula el header grande con breadcrumb.
 * STATUS: STABLE
 * =====================================================================
 */
</script>

<template>
  <header class="blog-header max-w-3xl mb-16 md:mb-20">
    <div class="flex items-baseline gap-4 mb-6">
      <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Blog</span>
      <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-20">/</span>
      <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Thoughts</span>
    </div>

    <h1 class="text-[clamp(3.5rem,18vw,11rem)] font-black uppercase tracking-tighter leading-[0.8]">
      Logs
    </h1>

    <p
      class="mt-8 text-base font-mono md:text-lg tracking-wide opacity-50 max-w-lg leading-relaxed"
    >
      A collection of weekly updates, design explorations, and thoughts on building digital
      products.
    </p>
  </header>
</template>
