<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE UNDERLINE GENERAL 2
 * =====================================================================
 * DESC:   SVG de subrayado decorativo alternativo de uso general.
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
    viewBox="0 0 73 13"
    fill="none"
    :style="{
      '--doodle-stroke-width': strokeWidth + 'px',
      '--doodle-stroke-color': strokeColor,
    }"
  >
    <g transform="matrix(1,0,0,1,-1713.301663,-624.691295)">
      <path
        d="M1715.302,633.497C1775.729,627.164 1778.287,627.014 1783.783,626.691C1775.002,627.963 1768.324,629.761 1748.589,635.278"
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
