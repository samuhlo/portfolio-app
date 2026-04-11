/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG NAVIGATION CONTEXT
 * ========================================================================
 * DESC:   Estado efímero para distinguir navegación normal vs cambio de
 *         locale dentro del blog. Se consume una sola vez en la página
 *         destino para controlar loaders/animaciones.
 * STATUS: STABLE
 * ========================================================================
 */

import { useState } from '#imports';

export function useBlogNavigationContext() {
  const isLocaleSwitch = useState<boolean>('blog-is-locale-switch', () => false);

  function markLocaleSwitch() {
    // [NOTE] Se marca antes de router.push desde switchers.
    // La página destino lo consume para elegir variante de animación.
    isLocaleSwitch.value = true;
  }

  function consumeLocaleSwitch(): boolean {
    // [NOTE] Lectura one-shot.
    // Evita que el estado contamine navegaciones posteriores.
    const wasLocaleSwitch = isLocaleSwitch.value;
    isLocaleSwitch.value = false;
    return wasLocaleSwitch;
  }

  return {
    markLocaleSwitch,
    consumeLocaleSwitch,
  };
}
