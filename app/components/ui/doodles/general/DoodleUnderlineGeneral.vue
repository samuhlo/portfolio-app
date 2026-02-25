<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE UNDERLINE GENERAL
 * =====================================================================
 * DESC:   SVG de subrayado decorativo de uso general.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 107 14" fill="none">
    <g transform="matrix(1,0,0,1,-1707.981116,-668.720724)">
      <path
        d="M1709.981,674.541C1711.164,674.425 1718.825,671.735 1812.119,670.721C1775.314,673.519 1757.217,673.597 1743.644,677.009C1758.789,678.468 1763.731,677.63 1768.754,680.325"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
