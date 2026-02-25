/**
 * █ [COMPOSABLE] :: USE PARALLAX
 * =====================================================================
 * DESC:   Efecto parallax reutilizable basado en scroll.
 *         El elemento se desplaza en Y a una velocidad distinta
 *         que el scroll, creando sensación de profundidad.
 *         Usa GSAP ScrollTrigger para rendimiento y limpieza.
 * STATUS: STABLE
 * =====================================================================
 */

interface UseParallaxOptions {
  /**
   * Velocidad del parallax.
   * Positivo → el elemento se mueve MÁS LENTO que el scroll (se queda atrás).
   * Negativo → el elemento se mueve MÁS RÁPIDO (se adelanta).
   * Default: 50 (px de desplazamiento total)
   */
  speed?: number;
  /** Inicio del trigger. Default: 'top bottom' (aparece por abajo) */
  start?: string;
  /** Fin del trigger. Default: 'bottom top' (desaparece por arriba) */
  end?: string;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 50, start = 'top bottom', end = 'bottom top' } = options;

  const { gsap, ScrollTrigger, initGSAP } = useGSAP();
  const parallaxRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    if (!parallaxRef.value) return;

    initGSAP(() => {
      gsap.fromTo(
        parallaxRef.value,
        { y: speed },
        {
          y: -speed,
          ease: 'none',
          scrollTrigger: {
            trigger: parallaxRef.value,
            start,
            end,
            scrub: true, // [NOTE] Vincula la animación 1:1 al scroll
          },
        },
      );
    });
  });

  return { parallaxRef };
}
