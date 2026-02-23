<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE CROSSLINE
 * =====================================================================
 * DESC:   SVG del tachón (línea gruesa sobre "Front-end Developer").
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 273 32" fill="none">
    <g transform="matrix(1,0,0,1,-1488.53583,-474.540691)">
      <path
        d="M1490.536,498.565C1494.375,495.114 1531.225,460.837 1530.914,485.26C1530.833,491.676 1522.321,500.714 1530.487,503.671C1539.413,506.903 1551.244,500.139 1552.753,499.125C1555.453,497.311 1577.328,479.212 1586.536,483.893C1593.661,487.515 1583.338,495.164 1591.884,500.02C1595.752,502.217 1605.266,506.112 1619.33,496.653C1628.754,490.315 1636.373,479.868 1644.887,489.753C1650.545,496.322 1651.788,500.033 1657.083,500.43C1668.1,501.256 1688.546,478.341 1696.773,481.399C1705.244,484.547 1711.638,497.398 1736.652,490.964C1747.453,488.186 1750.435,483.001 1759.42,477.454"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
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
