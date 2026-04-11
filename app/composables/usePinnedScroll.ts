/**
 * █ [COMPOSABLE] :: PINNED SCROLL
 * =====================================================================
 * DESC:   Crea una animación pineada vinculada al scroll con fases
 *         secuenciales de timeline. Cada fase solo avanza, nunca retrocede.
 *
 * ESTRATEGIA (v5)
 * ───────────────
 * Mantiene el "one-way progress" durante el pin y simplifica la salida:
 * al terminar (onLeave), se fija el estado final de cada fase, se desactiva
 * el ScrollTrigger y se reajusta el scroll al "start" para recuperar el
 * espacio de pin. Resultado: al volver hacia arriba no hay replay ni tramo
 * largo de scroll en blanco.
 * =====================================================================
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '~/composables/useLenis';
import { BREAKPOINTS } from '~/config/site';

interface ScrollPhase {
  timeline: gsap.core.Timeline;
  start: number;
  end: number;
}

interface PinnedScrollOptions {
  trigger: HTMLElement;
  start?: string;
  end?: string;
  phases: ScrollPhase[];
  isHero?: boolean;
}

export const usePinnedScroll = () => {
  const lenis = useLenis();

  const createPinnedScroll = (options: PinnedScrollOptions): ScrollTrigger | undefined => {
    const { trigger, start = 'top top', end = '+=2000', phases, isHero = false } = options;

    const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`).matches;

    // ── MOBILE ──────────────────────────────────────────────────────────────
    if (isMobile) {
      const masterTl = gsap.timeline({ paused: true });
      phases.forEach((phase) => masterTl.add(phase.timeline.play(), '>'));
      masterTl.timeScale(1.8);

      if (isHero) {
        setTimeout(() => masterTl.play(), 1200);
      } else {
        return ScrollTrigger.create({
          trigger,
          start: 'top 60%',
          onEnter: () => masterTl.play(),
          once: true,
        });
      }
      return;
    }

    // ── DESKTOP ──────────────────────────────────────────────────────────────
    const completed = phases.map(() => false);
    let settled = false;

    const mainTrigger = ScrollTrigger.create({
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
          gsap.set(phase.timeline, { progress: phaseProgress });
          if (phaseProgress >= 1) completed[i] = true;
        });
      },

      onLeave: (self) => {
        if (settled) return;
        settled = true;

        const settledScroll = self.start;

        // Fijar estado final ANTES del snap para evitar onUpdate intermedio
        phases.forEach((phase, i) => {
          if (completed[i]) return;
          gsap.set(phase.timeline, { progress: 1 });
          completed[i] = true;
        });

        // Recolocar el scroller en el start y desactivar el pin
        self.scroll(settledScroll);
        self.disable();

        // Recalcular offsets tras eliminar el pin-spacer
        ScrollTrigger.refresh();

        // Ajustar posición final de scroll (window + Lenis)
        window.scrollTo(0, settledScroll);
        lenis?.scrollTo(settledScroll, { immediate: true });
      },
    });

    return mainTrigger;
  };

  return { createPinnedScroll };
};
