/**
 * █ [COMPOSABLE] :: PINNED SCROLL
 * =====================================================================
 * DESC:   Crea una animación pineada vinculada al scroll con fases
 *         secuenciales de timeline. Al completarse, mata el pin-spacer y
 *         compensa el scroll con Lenis para evitar saltos.
 * STATUS: STABLE
 * =====================================================================
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '~/composables/useLenis';

/** Fase individual dentro de la animación pineada */
interface ScrollPhase {
  /** Timeline GSAP pausado que controla esta fase */
  timeline: gsap.core.Timeline;
  /** Punto de inicio (0–1) dentro del progreso total del scroll */
  start: number;
  /** Punto de fin (0–1) dentro del progreso total del scroll */
  end: number;
}

interface PinnedScrollOptions {
  /** Elemento que actúa de trigger y se pinea */
  trigger: HTMLElement;
  /** Punto de inicio del ScrollTrigger (default: 'top top') */
  start?: string;
  /** Distancia total de scroll en px que dura la animación (default: '+=2000') */
  end?: string;
  /** Fases secuenciales de la animación, cada una con su rango de progreso */
  phases: ScrollPhase[];
  /** Duración del tween que suaviza el progreso del timeline (default: 0.5) */
  tweenDuration?: number;
  /** Easing del tween de suavizado (default: 'power3.out') */
  tweenEase?: string;
}

/**
 * ◼️ USE PINNED SCROLL
 * ---------------------------------------------------------
 * Crea un ScrollTrigger con pin que controla N timelines pausados
 * mediante fases de progreso. Cada fase solo avanza, nunca retrocede.
 * Al salir del pin, mata el trigger y compensa el scroll con Lenis.
 *
 * Patrón extraído de HeroSection y BioSection.
 */
export const usePinnedScroll = () => {
  const lenis = useLenis();

  const createPinnedScroll = (options: PinnedScrollOptions): ScrollTrigger => {
    const {
      trigger,
      start = 'top top',
      end = '+=2000',
      phases,
      tweenDuration = 0.5,
      tweenEase = 'power3.out',
    } = options;

    // Flag por fase para que el progreso solo avance, nunca retroceda
    const completed = phases.map(() => false);

    return ScrollTrigger.create({
      trigger,
      start,
      end,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;

        phases.forEach((phase, i) => {
          if (completed[i]) return;

          const raw = (progress - phase.start) / (phase.end - phase.start);
          const phaseProgress = Math.max(0, Math.min(raw, 1));

          gsap.to(phase.timeline, {
            progress: phaseProgress,
            duration: tweenDuration,
            ease: tweenEase,
            overwrite: 'auto',
          });

          if (phaseProgress >= 1) completed[i] = true;
        });
      },
      onLeave: (self) => {
        // [NOTE] Matamos el trigger para eliminar el pin-spacer y compensamos con Lenis.
        // Sin stop()/start(): ceder el control al scroll nativo causa el tilt.
        // Un único rAF es suficiente para que el DOM se estabilice antes del refresh.
        const pinSpacerHeight = self.end - self.start;
        const targetScroll = self.scroll() - pinSpacerHeight;
        self.kill();
        lenis?.scrollTo(targetScroll, { immediate: true });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
    });
  };

  return { createPinnedScroll };
};
