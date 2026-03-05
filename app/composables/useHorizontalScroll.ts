/**
 * █ [COMPOSABLE] :: USE HORIZONTAL SCROLL
 * =====================================================================
 * DESC:   Crea un contenedor con scroll horizontal controlado por el
 *         scroll vertical del usuario. Usa Lenis interno con virtualScroll
 *         para convertir deltaY en movimiento horizontal.
 * USAGE:  Úsalo para secciones que necesitan animaciones vinculadas al
 *         scroll sin crear pin-spacers verticales que causan saltos.
 * =====================================================================
 */
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';
import Lenis from 'lenis';
import gsap from 'gsap';

interface UseHorizontalScrollOptions {
  /** Elemento contenedor que tendrá el scroll horizontal */
  containerRef: Ref<HTMLElement | null>;
  /** Ancho del contenido en viewport widths (default: 2 = 200vw) */
  widthMultiplier?: number;
  /** Lerp para el smoothness (default: 0.1) */
  lerp?: number;
}

export function useHorizontalScroll(options: UseHorizontalScrollOptions) {
  const { containerRef, widthMultiplier = 2, lerp = 0.1 } = options;

  let lenis: Lenis | null = null;
  const isActive = ref(false);

  const gsapTickerFn = (time: number) => {
    lenis?.raf(time * 1000);
  };

  const init = () => {
    const container = containerRef.value;
    if (!container) return;

    const content = container.querySelector('[data-scroll-content]') as HTMLElement;
    if (!content) {
      console.warn('[useHorizontalScroll] No se encontró contenido con data-scroll-content');
      return;
    }

    const viewportWidth = window.innerWidth;
    const contentWidth = viewportWidth * widthMultiplier;

    content.style.width = `${contentWidth}px`;
    container.style.overflowX = 'auto';
    container.style.overflowY = 'hidden';

    lenis = new Lenis({
      wrapper: container,
      content: container,
      orientation: 'horizontal',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      lerp,
      autoRaf: false,
      wheelMultiplier: 1,
      virtualScroll: (e) => {
        return true;
      },
    });

    gsap.ticker.add(gsapTickerFn);
    isActive.value = true;
  };

  const destroy = () => {
    if (lenis) {
      gsap.ticker.remove(gsapTickerFn);
      lenis.destroy();
      lenis = null;
      isActive.value = false;
    }
  };

  const scrollTo = (target: number | string, options?: { immediate?: boolean }) => {
    lenis?.scrollTo(target, options);
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    destroy();
  });

  return {
    lenis: computed(() => lenis),
    isActive,
    init,
    destroy,
    scrollTo,
  };
}
