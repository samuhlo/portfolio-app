/**
 * [COMPOSABLE] :: NOISE PAUSE
 * =====================================================================
 * DESC:   Pausa el ruido de fondo (NoiseBackground) durante estados críticos.
 *         Estados críticos: drawer abierto, modal de proyecto, loader activo.
 * STATUS: STABLE
 * =====================================================================
 */
import { useState } from '#imports';

export function useNoisePause() {
  const isPaused = useState<boolean>('noise-paused', () => false);

  const pause = (): void => {
    isPaused.value = true;
  };

  const resume = (): void => {
    isPaused.value = false;
  };

  return {
    isPaused,
    pause,
    resume,
  };
}
