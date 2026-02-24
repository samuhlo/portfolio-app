<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE CROSS FUN BIO
 * =====================================================================
 * DESC:   SVG del tachón cross-fun para la sección bio.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';
const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 83 16" fill="none">
    <g transform="matrix(1,0,0,1,-1529.658622,-695.818027)">
      <path
        d="M1531.659,708.941C1550.986,704.464 1551.029,705.009 1570.682,701.936C1589.65,698.969 1594.694,698.491 1609.821,697.818"
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
