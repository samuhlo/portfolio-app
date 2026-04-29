/**
 * [COMPOSABLE] :: MOBILE MENU NAVIGATION GATE
 * =====================================================================
 * DESC:   Coordina cierre del menú móvil con carga de nueva página.
 *         Las animaciones de entrada esperan hasta que el drawer cierre.
 * STATUS: STABLE
 * =====================================================================
 */

import { useState } from '#imports';

export function useMobileMenuNavigationGate() {
  const isPending = useState<boolean>('mobile-menu-navigation-gate-pending', () => false);

  const openGate = (): void => {
    // [FLOW] La página nueva monta ya, pero su entrada no pisa el cierre del drawer.
    isPending.value = true;
  };

  const closeGate = (): void => {
    isPending.value = false;
  };

  return {
    isPending,
    openGate,
    closeGate,
  };
}
