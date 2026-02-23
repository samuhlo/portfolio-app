/**
 * █ [COMPOSABLE] :: GSAP
 * =====================================================================
 * DESC:   Wrapper y utilidades core para animaciones con GSAP.
 * STATUS: STABLE
 * =====================================================================
 */
import { onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ◼️ USE GSAP
 * ---------------------------------------------------------
 * Provee un contexto seguro para inicializar animaciones espaciales en Vue.
 * Limpia automáticamente todos los tweens y triggers al desmontar el componente
 * para evitar memory leaks.
 */
export const useGSAP = () => {
  let ctx: gsap.Context | null = null;

  const initGSAP = (callback: (context: gsap.Context) => void, scope?: any) => {
    ctx = gsap.context(callback, scope);
    return ctx;
  };

  onUnmounted(() => {
    ctx?.revert(); // Elimina todas las animaciones y scrollTriggers creados en el contexto
  });

  return {
    gsap,
    ScrollTrigger,
    initGSAP,
  };
};
