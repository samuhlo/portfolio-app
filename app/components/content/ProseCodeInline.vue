<script setup lang="ts">
/**
 * █ [PROSE] :: PROSE CODE INLINE
 * =====================================================================
 * DESC:   Override de <code> inline en markdown. Pill con fondo sutil
 *         y font mono consistente con los bloques de código de Shiki.
 * =====================================================================
 */

defineOptions({ inheritAttrs: false });

defineProps<{
  class?: string | null;
}>();
</script>

<template>
  <code class="font-mono text-[0.8125em] leading-[1.5] bg-foreground/[0.06] py-[0.125rem] px-[0.375rem] rounded text-foreground">
    <slot />
  </code>
</template>
