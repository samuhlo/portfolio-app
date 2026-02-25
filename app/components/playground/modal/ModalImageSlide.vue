<script setup lang="ts">
/**
 * █ [UI_ATOM] :: MODAL IMAGE SLIDE
 * =====================================================================
 * DESC:   Placeholder de imagen con aspecto 4:3 y marcas X.
 *         Acepta clases externas para sizing contextual.
 * =====================================================================
 */
</script>

<template>
  <div
    class="aspect-4/3 shrink-0 border border-background/20 relative overflow-hidden bg-background/5"
  >
    <svg class="absolute inset-0 w-full h-full stroke-background/20" preserveAspectRatio="none">
      <line x1="0" y1="0" x2="100%" y2="100%" stroke-width="1.5" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke-width="1.5" />
    </svg>
  </div>
</template>
