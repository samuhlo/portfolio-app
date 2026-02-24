<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE FUN BIO
 * =====================================================================
 * DESC:   SVG de decoración "fun" (líneas de diversión / destellos) para la bio.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 64 42" fill="none">
    <g transform="matrix(1,0,0,1,-1530.634236,-651.622808)">
      <path
        d="M1532.634,671.618C1535.684,681.613 1535.2,681.71 1539.174,691.408"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1532.954,672.578C1539.412,669.647 1539.326,669.529 1548.091,667.379"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1533.594,681.215C1538.403,679.6 1538.327,679.594 1543.163,678.172"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1554.227,669.219C1554.23,670.242 1553.229,695.352 1561.114,688.162C1567.113,682.69 1562.937,663.562 1562.931,663.527"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1573.981,686.725C1573.08,675.921 1572.729,676.003 1572.027,665.213C1581.044,671.962 1580.153,672.86 1592.378,685.432C1592.786,671.615 1590.903,671.793 1588.998,653.623"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="5"
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
