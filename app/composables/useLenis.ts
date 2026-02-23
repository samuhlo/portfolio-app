/**
 * █ [COMPOSABLE] :: LENIS
 * =====================================================================
 * DESC:   Gestión global del smooth scrolling con Lenis.
 * STATUS: STABLE
 * =====================================================================
 */
import { useNuxtApp } from '#app';
import type Lenis from 'lenis';

/**
 * ◼️ USE LENIS
 * ---------------------------------------------------------
 * Retorna la instancia global de Lenis inicializada por el plugin de Nuxt.
 */
export const useLenis = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$lenis as Lenis | undefined;
};
