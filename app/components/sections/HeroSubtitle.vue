<template>
  <div
    class="relative inline-flex flex-col items-center select-none text-[clamp(1.25rem,3vw,3.5rem)]"
    ref="containerRef"
  >
    <!-- Texto base -->
    <h2 ref="textRef" class="font-bold text-center md:text-left tracking-tight relative">
      Front-end Developer

      <!-- Crossline -->
      <svg
        ref="svgCross"
        class="absolute -translate-y-1/2 pointer-events-none opacity-0"
        :style="ANIMATION_CONFIG.crossline"
        viewBox="0 0 273 32"
        fill="none"
      >
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
    </h2>

    <!-- FRONT -->
    <svg
      ref="svgFront"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="ANIMATION_CONFIG.front"
      viewBox="0 0 126 46"
    >
      <g
        transform="matrix(1,0,0,1,-1479.086706,-285.290885)"
        fill="none"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1482.087,327.052C1497.663,319.808 1497.467,319.591 1513.074,312.478" />
        <path d="M1497.228,320.211C1499.239,334.139 1500.089,338.091 1505.123,352.699" />
        <path d="M1498.192,337.01C1505.098,333.294 1505.071,333.384 1509.877,331.237" />
        <path
          d="M1521.237,346.639C1520.949,345.266 1516.467,318.076 1522.239,313.147C1527.489,308.664 1532.536,312.682 1531.56,321.116C1530.7,328.542 1526.356,329.555 1520.899,330.796C1525.015,334.983 1530.094,338.798 1535.42,348.402"
        />
        <path
          d="M1537.886,342.72C1543.648,348.932 1551.614,341.445 1551.076,327.743C1550.793,320.515 1544.098,311.366 1537.22,321.677C1535.032,324.959 1533.929,330.048 1534.192,334.178C1534.658,341.483 1538.966,343.624 1539.741,344.221"
        />
        <path
          d="M1557.538,341.188C1557.322,340.027 1554.539,323.895 1556.652,318.859C1556.906,318.256 1557.396,317.583 1557.413,317.583C1557.62,317.582 1560.81,319.59 1563.544,327.089C1565.811,333.304 1567.772,341.654 1568.522,344.709C1571.377,339.781 1572.442,336.214 1577.689,312.561"
        />
        <path
          d="M1593.774,343.304C1594.14,335.778 1594.406,335.726 1594.57,328.064C1594.677,323.062 1594.698,320.072 1595.112,314.457"
        />
        <path d="M1583.448,317.778C1598.745,314.726 1602.139,314.675 1607.538,314.533" />
      </g>
    </svg>

    <!-- BACK -->
    <svg
      ref="svgBack"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="ANIMATION_CONFIG.back"
      viewBox="0 0 119 51"
    >
      <g
        transform="matrix(1,0,0,1,-1469.583401,-218.178383)"
        fill="none"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M1471.583,245.689C1472.183,245.018 1477.324,238.082 1487.893,233.863C1496.972,230.239 1496.918,236.559 1495.293,239.235C1491.983,244.685 1483.707,245.953 1482.562,246.129C1493.685,243.607 1512.958,238.587 1512.193,249.361C1511.728,255.906 1497.336,267.692 1478.956,266.367"
        />
        <path d="M1479.655,242.683C1484.513,249.955 1487.954,255.933 1488.559,263.346" />
        <path
          d="M1509.966,265.266C1511.745,247.671 1511.625,244.438 1514.756,234.373C1515.289,232.662 1514.884,231.567 1516.592,232.17C1523.792,234.713 1527.757,250.529 1531.929,257.641"
        />
        <path d="M1508.592,251.528C1515.022,247.215 1519.07,245.148 1530.888,242.708" />
        <path
          d="M1547.319,232.036C1547.058,232.115 1537.266,233.764 1533.148,243.121C1527.995,254.828 1542.143,260.079 1551.078,256.103"
        />
        <path d="M1553.072,227.571C1556.853,242.001 1558.537,248.183 1559.978,255.21" />
        <path d="M1556.335,242.082C1562.653,235.589 1562.928,235.913 1574.267,227.178" />
        <path d="M1557.451,239.249C1568.687,247.616 1572.737,250.738 1580.851,259.354" />
      </g>
    </svg>

    <!-- DESIGN -->
    <svg
      ref="svgDesign"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="ANIMATION_CONFIG.design"
      viewBox="0 0 148 66"
    >
      <g
        transform="matrix(1,0,0,1,-1500.38182,-345.826564)"
        fill="none"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M1521.382,398.828C1523.773,395.457 1527.508,387.948 1540.259,384.112C1556.729,379.158 1565.886,413.722 1534.346,414.434"
        />
        <path d="M1534.176,385.746C1540.165,405.029 1540.222,404.99 1543.274,412.443" />
        <path d="M1557.464,383.159C1558.099,388.123 1559.277,397.336 1561.718,412.15" />
        <path d="M1557.033,384.165C1561.621,382.738 1561.539,382.686 1571.146,380.017" />
        <path d="M1560.914,397.247C1562.408,397.056 1563.901,396.865 1565.394,396.674" />
        <path d="M1561.346,412.341C1566.643,408.648 1566.754,408.62 1573.308,405.935" />
        <path
          d="M1591.822,379.852C1574.661,376.855 1577.12,383.993 1577.668,385.068C1581.587,392.752 1605.733,393.704 1595.412,403.371C1586.95,411.297 1569.822,404.695 1578.471,397.979"
        />
        <path d="M1606.485,401.991C1605.108,389.2 1604.501,379.426 1604.379,377.461" />
        <path d="M1597.14,363.321C1603.526,358.059 1603.417,357.997 1609.982,352.887" />
        <path d="M1594.409,352.827C1595.462,353.565 1603.374,359.113 1607.589,362.04" />
        <path
          d="M1637.524,378.979C1632.736,375.581 1622.476,375.479 1617.643,379.466C1606.822,388.391 1614.298,398.038 1620.472,400.086C1631.487,403.74 1636.283,397.049 1636.947,393.915C1637.328,392.116 1637.071,389.707 1636.487,389.258C1634.182,387.486 1629.921,388.205 1619.276,388.775"
        />
        <path
          d="M1650.04,396.352C1646.104,386.71 1646.334,386.661 1644.615,380.948C1652.554,385.126 1653.213,384.981 1668.973,399.507C1669.05,391.927 1668.356,389.399 1663.039,371.234"
        />
      </g>
    </svg>

    <!-- UX/UI -->
    <svg
      ref="svgUxui"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="ANIMATION_CONFIG.uxui"
      viewBox="0 0 88 58"
    >
      <g
        transform="matrix(1,0,0,1,-1629.754827,-272.05375)"
        fill="none"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M1649.452,305.527C1647.816,311.169 1644.406,321.318 1646.324,337.802C1647.351,346.635 1651.019,345.645 1653.216,343.047C1654.041,342.071 1657.668,339.964 1657.712,315.315"
        />
        <path
          d="M1663.601,309.218C1666.144,317.681 1665.713,317.767 1668.195,326.236C1670.2,333.079 1670.381,333.003 1672.788,341.671"
        />
        <path d="M1661.492,335.672C1668.616,325.316 1670.47,322.319 1680.421,314.302" />
        <path
          d="M1697.964,306.582C1697.892,306.727 1694.13,312.921 1690.691,326.11C1687.038,340.116 1686.267,346.903 1686.058,348.739"
        />
        <path
          d="M1705.61,311.503C1704.803,313.504 1699.304,327.141 1703.321,338.371C1704.945,342.912 1709.574,343.689 1713.156,340.088C1718.42,334.795 1718.506,323.692 1718.768,317.162"
        />
        <path d="M1729.163,341.384C1728.44,327.551 1728.613,327.555 1727.271,317.624" />
        <path d="M1725.033,306.933C1723.213,299.704 1723.164,299.571 1721.821,295.054" />
      </g>
    </svg>

    <!-- Ai -->
    <svg
      ref="svgAi"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="ANIMATION_CONFIG.ai"
      viewBox="0 0 40 57"
    >
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

    <!-- BRAND -->
    <svg
      ref="svgBrand"
      class="absolute h-auto pointer-events-none opacity-0"
      :style="ANIMATION_CONFIG.brand"
      viewBox="0 0 121 46"
    >
      <g
        transform="matrix(1,0,0,1,-1673.133894,-347.735338)"
        fill="none"
        stroke="var(--color-accent, #ffca40)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1697.463,376.936C1699.351,394.17 1699.945,394.059 1702.318,411.246" />
        <path
          d="M1697.437,378.231C1705.495,367.027 1714.428,372.789 1714.658,379.005C1714.775,382.166 1712.858,384.744 1711.401,385.918C1707.914,388.727 1701.861,388.576 1701.234,388.617C1701.384,388.6 1716.259,385.826 1720.394,394.315C1723.081,399.83 1719.838,406.004 1714.155,407.81C1707.651,409.876 1699.658,406.22 1695.134,401.789"
        />
        <path
          d="M1726.816,406.618C1724.52,392.016 1722.287,369.356 1735.614,370.801C1739.03,371.172 1740.906,374.515 1740.059,378.061C1738.218,385.766 1729.566,386.759 1729.206,386.842C1733.894,394.265 1736.221,394.093 1740.443,409.505"
        />
        <path
          d="M1744.946,406.552C1746.229,394.203 1749.637,390.508 1752.335,372.131C1757.895,382.315 1759.911,397.847 1763.075,412.086"
        />
        <path d="M1743.226,397.685C1750.151,397.417 1752.394,397.231 1762.679,396.198" />
        <path
          d="M1770.157,409.132C1768.931,404.553 1764.562,384.423 1763.862,380.801C1772.494,386.294 1774.529,391.346 1782.221,402.823C1783.729,394.821 1782.759,380.073 1782.293,375.835"
        />
        <path d="M1788.817,377.437C1792.621,392.108 1793.297,392.609 1795.591,404.547" />
        <path
          d="M1787.692,379.224C1787.774,379.186 1794.261,374.948 1802.741,379.57C1812.653,384.972 1815.667,395.617 1807.07,402.13C1798.906,408.314 1791.312,401.452 1789.974,400.497"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * █ [FEATURE] :: HERO SUBTITLE
 * =====================================================================
 * DESC:   Subtítulo del Hero que se tacha y escribe nuevas palabras
 *         animadas por GSAP al hacer scroll.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';

const { gsap, ScrollTrigger, initGSAP } = useGSAP();

const containerRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);

const svgCross = ref<SVGSVGElement | null>(null);
const svgFront = ref<SVGSVGElement | null>(null);
const svgBack = ref<SVGSVGElement | null>(null);
const svgDesign = ref<SVGSVGElement | null>(null);
const svgUxui = ref<SVGSVGElement | null>(null);
const svgAi = ref<SVGSVGElement | null>(null);
const svgBrand = ref<SVGSVGElement | null>(null);

// CONFIGURACIÓN DE ANIMACIÓN Y POSICIONES ====================
// Aquí puedes modificar los valores para ajustar el diseño.
// NOTA: Para respetar el escalado responsivo, usamos porcentajes (%) para la posición
// y unidades 'em' para el tamaño, las cuales toman de referencia el texto base.
const ANIMATION_CONFIG = {
  // Ajuste del tachón
  crossline: { top: '50%', left: '-5%', width: '110%' },

  // Posiciones y tamaños de cada palabra SVG
  // El tamaño (width) se indica en 'em', lo que equivale a la fuente del contenedor (el texto responsivo)
  front: { bottom: '150%', right: '75%', width: '3.5em' },
  back: { bottom: '120%', right: '30%', width: '3em' },
  design: { bottom: '110%', left: '70%', width: '4em' },
  uxui: { top: '60%', left: '95%', width: '2.5em' },
  ai: { top: '2%', right: '30%', width: '1.2em' },
  brand: { top: '120%', left: '40%', width: '3.5em' },

  // Referencias para la velocidad de la animación
  // Al estar atado al scroll, estos valores representan proporciones de tiempo en la línea temporal
  timing: {
    delayArranque: 0.5,
    duracionTachon: 1,
    duracionPalabra: 0.6,
    solapamiento: '-=0.6',
    staggerTrazos: 0.2,
  },
};
// =============================================================

// Función para inicializar estilos de dibujar un SVG (strokeDasharray y opacity)
const prepareSvgDraw = (svgEl: SVGSVGElement | null) => {
  if (!svgEl) return [];
  const paths = svgEl.querySelectorAll('path');
  const pathElements = Array.from(paths);

  // NO hacemos visible el SVG aún, esto evita los puntitos amarillos indeseados.
  // Será visible en la línea de tiempo justo al empezar a trazarse.

  pathElements.forEach((path) => {
    // Elevamos el margen a +10 para que los caps (puntas redondeadas) queden totalmente ocultos
    const length = path.getTotalLength() + 20;
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      visibility: 'hidden',
    });
  });

  return pathElements;
};

// [NOTE] El ScrollTrigger lo gestiona el padre (HeroSection)
// Este componente solo construye y expone su timeline.
const buildTimeline = (): gsap.core.Timeline => {
  const tl = gsap.timeline({ paused: true });

  // Preparar paths (el contenedor ya será visible gracias a la entrada en onMounted)
  const crossPaths = prepareSvgDraw(svgCross.value);
  const frontPaths = prepareSvgDraw(svgFront.value);
  const backPaths = prepareSvgDraw(svgBack.value);
  const designPaths = prepareSvgDraw(svgDesign.value);
  const uxuiPaths = prepareSvgDraw(svgUxui.value);
  const aiPaths = prepareSvgDraw(svgAi.value);
  const brandPaths = prepareSvgDraw(svgBrand.value);

  const drawStartTime = ANIMATION_CONFIG.timing.delayArranque;

  // Primero el tachón
  if (crossPaths.length && svgCross.value) {
    tl.to(svgCross.value, { opacity: 1, duration: 0.01 }, drawStartTime).to(
      crossPaths,
      {
        visibility: 'visible',
        strokeDashoffset: 0,
        duration: ANIMATION_CONFIG.timing.duracionTachon,
        ease: 'power2.out',
      },
      '<',
    );
  }

  // Luego el texto dibujado 1 a 1 de forma secuencial
  const svgGroups = [
    { el: svgFront.value, paths: frontPaths },
    { el: svgBack.value, paths: backPaths },
    { el: svgDesign.value, paths: designPaths },
    { el: svgUxui.value, paths: uxuiPaths },
    { el: svgAi.value, paths: aiPaths },
    { el: svgBrand.value, paths: brandPaths },
  ];

  svgGroups.forEach((group) => {
    if (group.paths.length && group.el) {
      tl.to(group.el, { opacity: 1, duration: 0.01 }, ANIMATION_CONFIG.timing.solapamiento).to(
        group.paths,
        {
          visibility: 'visible',
          strokeDashoffset: 0,
          duration: ANIMATION_CONFIG.timing.duracionPalabra,
          ease: 'power1.inOut',
          stagger: ANIMATION_CONFIG.timing.staggerTrazos,
        },
        '<',
      );
    }
  });

  return tl;
};

let subtitleTimeline: gsap.core.Timeline | null = null;

onMounted(() => {
  initGSAP(() => {
    subtitleTimeline = buildTimeline();

    // Animación de entrada: el subtítulo aparece justo después del título
    // delay de 0.4s para que primero nazca el título y luego el subtítulo
    gsap.fromTo(
      containerRef.value,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' },
    );
  });
});

// HeroSection accede a este timeline para controlarlo con su ScrollTrigger unificado
defineExpose({
  getTimeline: () => subtitleTimeline,
});
</script>

<style scoped>
svg {
  overflow: visible;
}
</style>
