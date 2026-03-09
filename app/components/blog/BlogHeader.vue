<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG HEADER
 * =====================================================================
 * DESC:   Título principal de la sección logs.
 *         Encapsula el header grande con breadcrumb.
 *         La "B" y "logs" están separados para la animación cartoon
 *         donde "logs" empuja a la "B" fuera de pantalla.
 * STATUS: WIP
 * =====================================================================
 */
</script>

<template>
  <header class="blog-header max-w-3xl mb-8 md:mb-12">
    <div class="blog-header-breadcrumb flex items-baseline gap-4 mb-6">
      <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Blog</span>
      <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-20">/</span>
      <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Thoughts</span>
    </div>

    <!-- [NOTE]: overflow-hidden es crítico para el clip-path reveal de GSAP -->
    <!-- Container relativo para posicionar el canvas encima del h1 -->
    <div class="blog-header-title overflow-hidden relative">
      <h1
        class="text-[clamp(3.5rem,18vw,11rem)] font-black uppercase tracking-tighter leading-[0.85]"
      >
        <!-- [NOTE]: Split para animación cartoon. "logs" empuja "B" fuera de pantalla -->
        <span class="blog-letter-b inline-block">B</span
        ><span class="blog-word-logs inline-block">Logs</span>
      </h1>

      <!-- Canvas para renderizar la "B" con Matter.js tras el impacto -->
      <canvas
        class="blog-header-canvas absolute inset-0 w-full h-full pointer-events-none"
        style="color: var(--color-foreground, #0c0011)"
      />
    </div>

    <!-- Línea decorativa que se anima con scaleX (transform-origin: left) -->
    <div class="blog-header-line mt-6 h-px bg-foreground/10 origin-left" />

    <p
      class="blog-header-desc mt-8 text-base font-mono md:text-lg tracking-wide opacity-50 max-w-lg leading-relaxed"
    >
      Thoughts, discoveries and updates from a mind that collects everything.
    </p>
  </header>
</template>
