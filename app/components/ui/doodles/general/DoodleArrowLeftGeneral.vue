<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE ARROW LEFT GENERAL
 * =====================================================================
 * DESC:   SVG de flecha interactiva (izquierda) para uso general.
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
    viewBox="0 0 106 23"
    fill="none"
    :style="{
      '--doodle-stroke-width': strokeWidth + 'px',
      '--doodle-stroke-color': strokeColor,
    }"
  >
    <g transform="matrix(1,0,0,1,-643.544856,-558.613017)">
      <g transform="matrix(-0.999048,0.043627,-0.043627,-0.999048,1544.0065,1096.0324)">
        <path
          d="M773.09,564.234C824.609,564.234 823.427,563.656 874.805,561.339"
          stroke="var(--doodle-stroke-color, #ffca40)"
          stroke-width="var(--doodle-stroke-width, 5)"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="visibility: hidden"
        />
      </g>
      <g transform="matrix(-0.999048,0.043627,-0.043627,-0.999048,1553.0065,1095.0324)">
        <path
          d="M839.446,553.014C860.845,555.598 860.576,556.694 883.018,561.036C860.047,566.874 852.122,569.914 843.88,571.78"
          stroke="var(--doodle-stroke-color, #ffca40)"
          stroke-width="var(--doodle-stroke-width, 5)"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="visibility: hidden"
        />
      </g>
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
