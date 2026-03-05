/**
 * █ [COMPOSABLE] :: PINNED SCROLL
 * =====================================================================
 * DESC:   Crea una animación pineada vinculada al scroll con fases
 *         secuenciales de timeline. Cada fase solo avanza, nunca retrocede.
 *
 * ESTRATEGIA ANTI-SALTO (v4)
 * ──────────────────────────
 * El problema de las versiones anteriores: onLeave se dispara cuando la
 * sección acaba de salir del viewport — demasiado cerca. El kill+reposicionado
 * ocurría con la sección todavía "caliente" y causaba un micro-golpe visible.
 *
 * Solución: diferir el kill hasta que el usuario haya scrollado al menos
 * un viewport entero MÁS ALLÁ del bloque pineado. En ese punto la sección
 * está garantizadamente fuera de pantalla y el reposicionado es invisible.
 *
 * Flujo:
 *   1. mainTrigger controla la animación pineada normalmente.
 *   2. Un "deferred kill trigger" se activa solo cuando
 *      scroll > triggerEnd + window.innerHeight.
 *   3. En ese punto: kill → window.scrollTo síncrono → refresh → lenis sync.
 *   4. Post-kill la sección es HTML estático, sin warps ni lógica extra.
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
    let hasCompleted = false;
    let killScheduled = false;

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

        if (progress >= 1 && !hasCompleted) {
          hasCompleted = true;
        }
      },

      onLeave: (self) => {
        // Animación completada, el usuario acaba de salir por abajo.
        // NO matamos aquí — la sección aún está demasiado cerca del viewport.
        // Programamos el kill diferido para cuando esté seguro fuera de pantalla.
        if (killScheduled) return;
        killScheduled = true;

        const pinSpacerHeight = self.end - self.start;

        // El kill se dispara cuando el scroll supera triggerEnd + 1 viewport.
        // En ese punto la sección está al menos 100vh por encima del viewport
        // → completamente invisible → el reposicionado no se nota.
        const safeKillPoint = self.end + window.innerHeight;

        const killTrigger = ScrollTrigger.create({
          trigger: document.body,
          start: () => `top+=${safeKillPoint}px top`,
          once: true,
          onEnter: () => {
            const scrollNow = window.scrollY;
            const targetScroll = scrollNow - pinSpacerHeight;

            // Kill del trigger principal — pin-spacer desaparece del DOM
            self.kill();

            // Reposicionar de forma síncrona en el mismo frame
            window.scrollTo(0, targetScroll);

            // Recalcular con DOM ya estable
            ScrollTrigger.refresh();

            // Sincronizar estado interno de Lenis sin animar
            lenis?.scrollTo(targetScroll, { immediate: true });

            killTrigger.kill();
          },
        });
      },
    });

    return mainTrigger;
  };

  return { createPinnedScroll };
};
