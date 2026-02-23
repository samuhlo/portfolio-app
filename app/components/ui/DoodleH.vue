<template>
  <svg
    ref="svgRef"
    viewBox="0 0 283 309"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <g transform="matrix(1,0,0,1,-1592.318648,-729.828613)">
      <path
        d="M1610.819,982.62C1659.384,946.61 1669.392,941.37 1704.585,910C1723.756,892.913 1794.526,818.542 1789.224,764.617C1786.439,736.29 1759.267,738.627 1714.275,822.739C1684.521,878.364 1622.776,1018.05 1679.444,1020.219C1700.227,1021.014 1798.139,881.45 1813.827,893.53C1829.418,905.536 1759.602,1023.83 1806.973,1015.531C1818.625,1013.49 1822.113,1009.34 1856.315,987.878"
        fill="none"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="37"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE_H
 * =====================================================================
 * DESC:   SVG de la letra "h" cursiva dibujada a mano.
 *         Solo markup — la animación la gestiona el padre.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';

const svgRef = ref<SVGSVGElement | null>(null);

defineExpose({ svg: svgRef });
</script>

<style scoped>
svg {
  overflow: visible;
}
</style>
