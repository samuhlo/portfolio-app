import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * █ [PLUGIN] :: LENIS SCROLL
 * =====================================================================
 * DESC:   Inicializa smooth scrolling y sincroniza su tick con GSAP.
 * STATUS: STABLE
 * =====================================================================
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Inicializamos Lenis con configuraciones recomendadas
  const lenis = new Lenis({
    autoRaf: false, // Vamos a usar el ticker de GSAP para sincronía perfecta
    syncTouch: true, // [RESTORE] Reactivar los "amortiguadores" en móvil a petición del usuario
    touchMultiplier: 2, // Añadimos algo de factor de multiplicador
  });

  // GSAP: Sincronizar ScrollTrigger con Lenis cada vez que hagamos scroll
  lenis.on('scroll', ScrollTrigger.update);

  // [HACK] Necesitamos saber si el usuario tiene el dedo en la pantalla para nuestro Delayed Kill
  window.addEventListener(
    'touchstart',
    () => {
      (window as any).__isTouching = true;
    },
    { passive: true },
  );
  window.addEventListener(
    'touchend',
    () => {
      (window as any).__isTouching = false;
    },
    { passive: true },
  );
  window.addEventListener(
    'touchcancel',
    () => {
      (window as any).__isTouching = false;
    },
    { passive: true },
  );

  // Enganchar el RequestAnimationFrame de Lenis al ticker interno de GSAP
  // para que todas las animaciones y scroll vayan al mismo frame rate.
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Evitar que GSAP aplique smoothing extra que distorsione a Lenis si hay tirones
  gsap.ticker.lagSmoothing(0);

  // Inyectamos lenis en Nuxt por si lo necesitamos en otros componentes
  // (ejemplo: nuxtApp.$lenis.scrollTo('#target'))
  return {
    provide: {
      lenis,
    },
  };
});
