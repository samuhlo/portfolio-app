<script setup lang="ts">
/**
 * █ [PROSE] :: PROSE BLOCKQUOTE
 * =====================================================================
 * DESC:   Override de <blockquote> en markdown. Borde acento lateral,
 *         fondo semitransparente, esquinas derechas redondeadas.
 * =====================================================================
 */
</script>

<template>
  <blockquote class="not-prose relative my-8 border-l-4 border-accent bg-foreground/[0.025] py-5 px-6 rounded-r-md">
    <slot />
  </blockquote>
</template>

<style scoped>
/* [NOTE] :deep() necesario para estilar el <p> del slot desde fuera */
:deep(p) {
  font-size: clamp(1rem, 2vw, 1.0625rem);
  line-height: 1.8;
  font-style: italic;
  opacity: 0.85;
  margin: 0;
}

:deep(p + p) {
  margin-top: 0.75rem;
}
</style>
