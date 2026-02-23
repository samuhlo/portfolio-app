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

  return { preparePaths, addDrawAnimation };
};
