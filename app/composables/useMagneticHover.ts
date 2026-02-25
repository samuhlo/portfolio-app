/**
 * █ [COMPOSABLE] :: USE MAGNETIC HOVER
 * =====================================================================
 * DESC:   Efecto magnético: el elemento sigue sutilmente al cursor
 *         mientras se hace hover, y vuelve a su posición original
 *         con un ease elástico al salir.
 *         Usa GSAP para animaciones suaves y performantes.
 * STATUS: STABLE
 * =====================================================================
 */

interface UseMagneticHoverOptions {
  /** Intensidad del desplazamiento (0.0 → 1.0). Default: 0.15 */
  strength?: number;
  /** Duración del follow en segundos. Default: 0.4 */
  followDuration?: number;
  /** Duración del snap-back en segundos. Default: 0.6 */
  returnDuration?: number;
  /** Ease del snap-back. Default: 'elastic.out(1, 0.4)' */
  returnEase?: string;
}

export function useMagneticHover(options: UseMagneticHoverOptions = {}) {
  const {
    strength = 0.15,
    followDuration = 0.4,
    returnDuration = 0.6,
    returnEase = 'elastic.out(1, 0.4)',
  } = options;

  const { gsap } = useGSAP();
  const magneticRef = ref<HTMLElement | null>(null);

  function onMagneticMove(event: MouseEvent) {
    if (!magneticRef.value) return;
    const rect = magneticRef.value.getBoundingClientRect();

    // [NOTE] Calcula offset del cursor respecto al centro del elemento
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (event.clientX - centerX) * strength;
    const deltaY = (event.clientY - centerY) * strength;

    gsap.to(magneticRef.value, {
      x: deltaX,
      y: deltaY,
      duration: followDuration,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  function onMagneticLeave() {
    if (!magneticRef.value) return;

    // [NOTE] Snap-back elástico al centro original
    gsap.to(magneticRef.value, {
      x: 0,
      y: 0,
      duration: returnDuration,
      ease: returnEase,
      overwrite: 'auto',
    });
  }

  return {
    magneticRef,
    onMagneticMove,
    onMagneticLeave,
  };
}
