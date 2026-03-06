/**
 * ========================================================================
 * [TYPES] :: DOODLE EXPOSED INTERFACE
 * ========================================================================
 * DESC:   Interfaz compartida para componentes SVG doodle.
 *         Exponen el SVGElement via defineExpose para animación externa.
 * STATUS: STABLE
 * ========================================================================
 */

export interface DoodleExposed {
  svg: SVGSVGElement | null;
}
