<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE ARROW RIGHT GENERAL
 * =====================================================================
 * DESC:   SVG de flecha interactiva (derecha) para uso general.
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
    strokeWidth: 5,
    strokeColor: '#ffca40',
  },
);

const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg
    ref="svgRef"
    viewBox="0 0 114 22"
    fill="none"
    :style="{
      '--doodle-stroke-width': strokeWidth + 'px',
      '--doodle-stroke-color': strokeColor,
    }"
  >
    <g transform="matrix(1,0,0,1,-771.090248,-555.054241)">
      <path
        d="M773.09,564.234C824.609,564.234 824.382,564.699 875.76,562.381"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 5)"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M840.27,557.054C861.67,559.638 861.444,559.735 883.018,561.036C850.471,571.209 866.569,565.014 831.985,574.643"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 5)"
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
