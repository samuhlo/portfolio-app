<script setup lang="ts">
/**
 * █ [UI_ATOM] :: DOODLE NOT FOUND
 * =====================================================================
 * DESC:   SVG doodle generado automáticamente desde assets.
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
    strokeWidth: 8,
    strokeColor: '#ffca40',
  },
);

const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg
    ref="svgRef"
    viewBox="0 0 643 109"
    fill="none"
    :style="{
      '--doodle-stroke-width': strokeWidth + 'px',
      '--doodle-stroke-color': strokeColor,
    }"
  >
    <g transform="matrix(1,0,0,1,-683.032278,-470.02387)">
        <g id="Capa4">
            <path d="M687.032,528.154C690.984,523.519 729.393,478.459 750.404,485.947C754.25,487.317 767.285,497.786 721.476,527.993"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M718.014,508.68C727.479,542.404 727.047,542.119 739.72,574.787"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M762.274,561.792C758.864,525.272 759.942,525.496 766.225,490.663C781.67,509.051 782.216,513.899 794.972,547.704"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M752.537,537.006C762.983,532.829 773.429,528.652 783.875,524.475"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M828.664,495.402C776.515,525.106 814.418,559.542 829.882,557.363C848.559,554.732 859.692,510.891 818.66,527.681"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M850.68,497.631C856.57,526.137 855.285,518.676 862.443,547.496"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M850.368,497.943C867.311,495.997 863.012,497.179 880.301,496.535"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M856.565,525.384C864.678,524.515 868.792,524.647 876.906,523.779"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M862.302,548.514C870.116,547.617 877.931,546.72 885.745,545.823"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M944.626,552.055C933.584,525.496 933.656,525.921 924.341,498.509C945.352,524.556 944.473,524.821 968.074,549.116C963.808,520.902 962.698,521.429 955.783,493.635"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M997.738,495.402C957.564,522.222 975.62,552.892 994.87,549.978C1008.667,547.889 1025.301,514.903 986.506,497.981"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1026.064,497.172C1032.406,524.241 1031.979,524.058 1043.191,549.616"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1008.36,506.024C1033.968,502.707 1033.594,502.637 1059.384,498.883"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1126.977,563.562C1116.006,529.348 1117.084,526.829 1109.302,493.307"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1100.421,494.517C1127.85,488.846 1127.445,488.52 1155.486,485.289"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1108.388,521.073C1116.988,518.77 1125.589,516.468 1134.189,514.166"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1164.155,493.631C1138.298,536.567 1163.624,550.821 1174.48,544.475C1189.561,535.659 1195.864,498.5 1166.935,492.729"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <path d="M1193.367,498.943C1195.552,509.981 1199.015,553.958 1218.375,543.789C1235.604,534.739 1226.684,494.118 1225.75,489.866"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            <g transform="matrix(1,0,0,1,-1,-1)">
                <path d="M1252.675,544.973C1245.187,522.306 1245.32,522.599 1241.433,499.172C1256.811,515.292 1256.082,515.372 1268.918,533.286C1271.41,510.836 1271.861,511.108 1271.548,476.608"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            </g>
            <g transform="matrix(0.994578,0.103995,-0.103995,0.994578,52.466132,-134.017199)">
                <path d="M1287.739,480.55C1296.813,503.8 1299.668,509.594 1309.895,532.244"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            </g>
            <g transform="matrix(0.994578,0.103995,-0.103995,0.994578,43.144327,-141.02462)">
                <path d="M1291.624,489.205C1329.002,463.628 1339.102,507.635 1339.042,512.401C1338.681,541.32 1312.219,537.712 1309.529,536.771"
        stroke="var(--doodle-stroke-color, #ffca40)"
        stroke-width="var(--doodle-stroke-width, 8)"
        stroke-linecap="round"
        stroke-linejoin="round"/>
            </g>
        </g>
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
