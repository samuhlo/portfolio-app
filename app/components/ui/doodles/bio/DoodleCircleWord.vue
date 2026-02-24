<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE CIRCLE WORD
 * =====================================================================
 * DESC:   SVG del círculo de la palabra para la sección bio.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 280 84" fill="none">
    <g transform="matrix(1,0,0,1,-1530.462186,-837.698094)">
      <path
        d="M1608.119,865.832C1706.106,821.557 1814.093,853.725 1808.137,889.047C1802.614,921.802 1667.113,919.77 1659.33,919.474C1634.862,918.541 1530.07,926.639 1532.504,888.581C1534.679,854.566 1613.401,827.203 1663.633,845.627"
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
