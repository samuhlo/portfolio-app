<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE X CLOSE GENERAL
 * =====================================================================
 * DESC:   SVG de cruz para cerrar modal (general).
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 46 42" fill="none">
    <g transform="matrix(1,0,0,1,-1367.795926,-135.446296)">
      <path
        d="M1371.796,139.903C1383.87,151.78 1382.89,152.419 1408.811,172.764"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1377.787,172.855C1393.471,156.446 1393.619,156.892 1407.801,139.446"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="7"
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
