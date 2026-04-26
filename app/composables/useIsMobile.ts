/**
 * █ [COMPOSABLE] :: IS MOBILE
 * =====================================================================
 * DESC:   Detecta si el viewport es móvil (< 768px).
 *         Uso: const { isMobile } = useIsMobile()
 * STATUS: STABLE
 * =====================================================================
 */
export const useIsMobile = (): { isMobile: boolean } => {
  if (!import.meta.client) return { isMobile: false };
  return { isMobile: window.matchMedia('(max-width: 768px)').matches };
};
