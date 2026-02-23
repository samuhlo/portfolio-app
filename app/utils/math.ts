/**
 * █ [COMPOSABLE] :: MATH
 * =====================================================================
 * DESC:   Funciones matemáticas y cálculos de utilidad.
 * STATUS: STABLE
 * =====================================================================
 */

/**
 * ◼️ CLAMP
 * ---------------------------------------------------------
 * Restringe un valor entre un mínimo y un máximo.
 * -> Previene cálculos fuera de rango en animaciones/físicas.
 */
export const clamp = (val: number, min: number, max: number) => {
  return Math.min(Math.max(val, min), max);
};
