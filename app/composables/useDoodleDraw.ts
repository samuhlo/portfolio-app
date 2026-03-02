/**
 * █ [COMPOSABLE] :: DOODLE DRAW
 * =====================================================================
 * DESC:   Utilidades reutilizables para preparar y animar SVGs con el
 *         efecto de "dibujo a mano" (stroke-dash). Diseñado para funcionar
 *         con cualquier timeline GSAP y cualquier SVG con paths.
 * STATUS: STABLE
 * =====================================================================
 */
import gsap from 'gsap';

interface DrawAnimationOptions {
  /** El elemento SVG padre (para toggle de opacity) */
  svg: SVGSVGElement;
  /** Los path elements preparados con preparePaths */
  paths: SVGPathElement[];
  /** Duración del dibujo de cada path */
  duration: number;
  /** Stagger entre paths (default: 0) */
  stagger?: number;
  /** Posición en el timeline GSAP (default: '+=0') */
  position?: gsap.Position;
  /** Easing del dibujo (default: 'power1.inOut') */
  ease?: string;
}

/**
 * ◼️ USE DOODLE DRAW
 * ---------------------------------------------------------
 * Provee funciones para preparar paths SVG para la animación
 * de dibujo (stroke-dash) y añadirlas a un timeline GSAP.
 *
 * - preparePaths: inicializa strokeDasharray/offset y oculta los paths
 * - addDrawAnimation: añade la secuencia de dibujo a un timeline existente
 */
export const useDoodleDraw = () => {
  /**
   * Prepara los paths de un SVG para la animación de dibujo.
   * Calcula strokeDasharray/offset y oculta los paths con visibility:hidden
   * para evitar los puntitos iniciales de stroke-linecap: round.
   */
  const preparePaths = (svgEl: SVGSVGElement | null): SVGPathElement[] => {
    if (!svgEl) return [];

    const paths = Array.from(svgEl.querySelectorAll('path'));

    paths.forEach((path) => {
      // [NOTE] +20 de margen para que los caps redondeados queden totalmente ocultos
      const length = path.getTotalLength() + 20;
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        visibility: 'hidden',
      });
    });

    return paths;
  };

  /**
   * Añade la secuencia de dibujo de un SVG a un timeline GSAP existente.
   * Primero hace visible el SVG (opacity) y luego anima el strokeDashoffset
   * de cada path, haciéndolos visibles al instante de empezar.
   */
  const addDrawAnimation = (tl: gsap.core.Timeline, options: DrawAnimationOptions): void => {
    const { svg, paths, duration, stagger = 0, position = '+=0', ease = 'power1.inOut' } = options;

    if (!paths.length || !svg) return;

    tl.to(svg, { opacity: 1, duration: 0.01 }, position).to(
      paths,
      {
        visibility: 'visible',
        strokeDashoffset: 0,
        duration,
        ease,
        stagger,
      },
      '<',
    );
  };

  /**
   * Resetea los paths de un SVG a su estado inicial (ocultos, sin dibujar).
   * Mata cualquier tween activo en el SVG y sus paths antes de resetear.
   */
  const resetPaths = (svg: SVGSVGElement | null, paths: SVGPathElement[]): void => {
    if (!svg || !paths.length) return;
    gsap.killTweensOf(svg);
    paths.forEach((p) => gsap.killTweensOf(p));
    gsap.set(svg, { opacity: 0 });
    paths.forEach((path) => {
      const length = path.getTotalLength() + 20;
      gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
    });
  };

  /**
   * Borra un doodle con fadeout y resetea los paths al completar.
   * Útil para hover-out o cuando se necesita re-animar después.
   */
  const erasePaths = (
    svg: SVGSVGElement | null,
    paths: SVGPathElement[],
    options: { duration?: number; ease?: string } = {},
  ): void => {
    if (!svg || !paths.length) return;
    const { duration = 0.2, ease = 'power1.in' } = options;

    gsap.killTweensOf(svg);
    paths.forEach((p) => gsap.killTweensOf(p));

    gsap.to(svg, {
      opacity: 0,
      duration,
      ease,
      onComplete: () => {
        paths.forEach((path) => {
          const length = path.getTotalLength() + 20;
          gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
        });
      },
    });
  };

  return { preparePaths, addDrawAnimation, resetPaths, erasePaths };
};
