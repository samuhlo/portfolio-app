import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * ========================================================================
 * [PLUGIN] :: LENIS SMOOTH SCROLL
 * ========================================================================
 * DESC:   Inicializa Lenis globalmente y sincroniza su tick con GSAP.
 *         Inyecta instancia en nuxtApp para consumo en composables.
 * STATUS: STABLE
 * ========================================================================
 */

/**
 * ◼️ LENIS PLUGIN
 * ---------------------------------------------------------
 * 1. Crea instancia Lenis (autoRaf = false)
 * 2. Sincroniza ScrollTrigger a eventos de scroll de Lenis
 * 3. Engancha Lenis.raf() al ticker de GSAP
 * 4. Desactiva lag smoothing para máxima sincronía
 * 5. Inyecta en nuxtApp.$lenis para uso global
 */
export default defineNuxtPlugin((nuxtApp) => {
  // INSTANCIA LENIS -> autoRaf=false para usar el ticker GSAP
  const lenis = new Lenis({
    autoRaf: false,
  });

  // SCROLL TRIGGER SYNC -> Actualizar triggers cada scroll de Lenis
  lenis.on('scroll', ScrollTrigger.update);

  // GSAP TICKER INTEGRATION -> Enganchar RAF de Lenis al clock principal
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // LAG SMOOTHING OFF -> Sin interpolación extra de GSAP (máxima sincronía)
  gsap.ticker.lagSmoothing(0);

  // INYECTAR EN NUXT -> Disponible en composables via useNuxtApp().$lenis
  return {
    provide: {
      lenis,
    },
  };
});
