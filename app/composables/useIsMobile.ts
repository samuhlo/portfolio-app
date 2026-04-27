/**
 * █ [COMPOSABLE] :: IS MOBILE
 * =====================================================================
 * DESC:   Detecta si el viewport es móvil (< 768px, alineado con Tailwind md:).
 *         Uso: const { isMobile } = useIsMobile()
 * STATUS: STABLE
 * =====================================================================
 */
import { onScopeDispose, ref } from 'vue';

export const useIsMobile = () => {
  if (!import.meta.client) return { isMobile: ref(false) };

  const query = window.matchMedia('(max-width: 767.98px)');
  const isMobile = ref(query.matches);

  const handler = (e: MediaQueryListEvent) => {
    isMobile.value = e.matches;
  };

  query.addEventListener('change', handler);
  onScopeDispose(() => query.removeEventListener('change', handler));

  return { isMobile };
};
