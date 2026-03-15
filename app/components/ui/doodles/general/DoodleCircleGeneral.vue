<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE CIRCLE GENERAL
 * =====================================================================
 * DESC:   SVG de círculo decorativo de uso general.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';

withDefaults(
  defineProps<{
    strokeWidth?: number;
    strokeColor?: string;
  }>(),
  {
    strokeWidth: 4,
    strokeColor: '#ffca40',
  },
);

const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg
    ref="svgRef"
    viewBox="0 0 263 71"
    fill="none"
    :style="{
      opacity: 0,
      '--doodle-stroke-width': strokeWidth + 'px',
      '--doodle-stroke-color': strokeColor,
    }"
  >
    <g transform="matrix(1,0,0,1,-1550.752204,-745.916335)">
      <path
        d="M1617.159,768.154C1630.535,763.901 1764.491,726.123 1804.591,766.104C1823.515,784.972 1809.406,807.812 1671.212,812.79C1646.191,813.692 1565.073,823.063 1553.356,790.314C1544.993,766.939 1625.109,742.49 1693.387,763.075"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 4)"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
