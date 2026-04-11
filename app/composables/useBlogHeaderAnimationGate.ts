/**
 * ========================================================================
 * [COMPOSABLE] :: USE BLOG HEADER ANIMATION GATE
 * ========================================================================
 * DESC:   Estado global efímero para saber si la animación principal del
 *         header de /blog sigue en curso. Permite retrasar navegación de
 *         cambio de idioma hasta que termine la secuencia.
 * STATUS: STABLE
 * ========================================================================
 */

import { useState } from '#imports';

export function useBlogHeaderAnimationGate() {
  const isAnimating = useState<boolean>('blog-header-is-animating', () => false);

  function setAnimating(value: boolean) {
    // [NOTE] Fuente única de verdad para gating de navegación en /blog.
    isAnimating.value = value;
  }

  return {
    isAnimating,
    setAnimating,
  };
}
