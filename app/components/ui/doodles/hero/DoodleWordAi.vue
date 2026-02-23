<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE WORD AI
 * =====================================================================
 * DESC:   SVG de la letra "Ai" para animación de dibujo.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 40 57">
    <g
      transform="matrix(1,0,0,1,-1617.317563,-206.287224)"
      fill="none"
      stroke="var(--color-accent, #ffca40)"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M1519.929,344.46C1525.08,319.828 1526.189,320.283 1532.82,296.08C1536.292,320.548 1535.551,320.461 1536.932,345.15"
      />
      <path d="M1515.318,333.464C1528.46,330.687 1528.315,330.717 1541.554,328.968" />
      <path d="M1550.887,344.171C1550.284,339.653 1549.965,338.7 1549.058,321.293" />
      <path d="M1547.218,305.809C1547.636,299.035 1547.633,299.065 1547.579,292.287" />
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
