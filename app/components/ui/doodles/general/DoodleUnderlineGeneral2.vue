<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE UNDERLINE GENERAL 2
 * =====================================================================
 * DESC:   SVG de subrayado decorativo alternativo de uso general.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 73 13" fill="none">
    <g transform="matrix(1,0,0,1,-1713.301663,-624.691295)">
      <path
        d="M1715.302,633.497C1775.729,627.164 1778.287,627.014 1783.783,626.691C1775.002,627.963 1768.324,629.761 1748.589,635.278"
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
