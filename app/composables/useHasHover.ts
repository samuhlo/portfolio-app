/**
 * █ [COMPOSABLE] :: HAS HOVER
 * =====================================================================
 * DESC:   Detecta si el dispositivo soporta hover (no tactil).
 *         Uso: const { hasHover } = useHasHover()
 * STATUS: STABLE
 * =====================================================================
 */
import { onScopeDispose, ref } from 'vue';

export const useHasHover = () => {
  if (!import.meta.client) return { hasHover: ref(false) };

  const query = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hasHover = ref(query.matches);

  const handler = (e: MediaQueryListEvent) => {
    hasHover.value = e.matches;
  };

  query.addEventListener('change', handler);
  onScopeDispose(() => query.removeEventListener('change', handler));

  return { hasHover };
};
