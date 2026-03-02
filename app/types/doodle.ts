/**
 * Tipo expuesto por los componentes doodle SVG via defineExpose({ svg: svgRef }).
 * Centralizado para evitar duplicación en los 7+ consumidores.
 */
export interface DoodleExposed {
  svg: SVGSVGElement | null;
}
