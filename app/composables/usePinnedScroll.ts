/**
 * █ [COMPOSABLE] :: PINNED SCROLL
 * =====================================================================
 * DESC:   Crea una animación pineada vinculada al scroll con fases
 *         secuenciales de timeline. Cada fase solo avanza, nunca retrocede.
 *         Al salir del viewport, mata el trigger y compensa el scroll
 *         con Lenis — el tilt es invisible porque la sección ya no está
 *         en pantalla.
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
  /** Flag para identificar si es la primera sección (Hero) para lógicas móviles */
  isHero?: boolean;
}

/**
 * ◼️ USE PINNED SCROLL
 * ---------------------------------------------------------
 * Crea un ScrollTrigger con pin que controla N timelines pausados
 * mediante fases de progreso. Cada fase solo avanza, nunca retrocede.
 * Al salir del viewport (onLeave), mata el trigger y compensa scroll
 * con Lenis — el tilt es invisible porque la sección ya no está en pantalla.
 *
 * Patrón extraído de HeroSection y BioSection.
 */
export const usePinnedScroll = () => {
  const lenis = useLenis();

  const createPinnedScroll = (options: PinnedScrollOptions): ScrollTrigger | undefined => {
    const {
      trigger,
      start = 'top top',
      end = '+=2000',
      phases,
      tweenDuration = 0.5,
      tweenEase = 'power3.out',
      isHero = false,
    } = options;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // [PIVOT] En móvil, descartamos el pinning y el scroll largo.
    // Queremos que las animaciones se reproduzcan solas, rápido y en secuencia
    // al hacer el primer scroll.
    if (isMobile) {
      const masterTl = gsap.timeline({ paused: true });

      // Encadenar las fases secuencialmente
      phases.forEach((phase) => {
        masterTl.add(phase.timeline.play(), '>');
      });

      // Acelerar la animación global en móvil para que no se quede atrás del scroll
      masterTl.timeScale(1.8);

      // Si es el Hero (isHero === true), queremos que espere a que el usuario interactúe
      // (haga scroll o deslice el dedo). Si no, simplemente usamos intersección.
      if (isHero) {
        let hasInteracted = false;
        const playAnimation = () => {
          if (hasInteracted) return;
          hasInteracted = true;
          masterTl.play();
          window.removeEventListener('scroll', playAnimation);
          window.removeEventListener('touchstart', playAnimation);
          window.removeEventListener('wheel', playAnimation);
        };

        // Escuchar el primer intento de scroll o interacción en móvil
        window.addEventListener('scroll', playAnimation, { passive: true });
        window.addEventListener('touchstart', playAnimation, { passive: true });
        window.addEventListener('wheel', playAnimation, { passive: true });
      } else {
        // BioSection u otras secciones que están más abajo -> Intersection
        return ScrollTrigger.create({
          trigger,
          start: 'top 60%', // Disparar cuando entra un poco en pantalla
          onEnter: () => masterTl.play(),
          once: true, // Reproducir solo una vez
        });
      }
      return;
    }

    // ── DESKTOP: Comportamiento original pineado ──
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
        // [NOTE] En tablets/portátiles táctiles, eliminar el pin-spacer...
        const pinSpacerHeight = self.end - self.start;

        const attemptKill = () => {
          if (!self.isActive && self.progress === 1) {
            const velocity = lenis?.velocity || 0;
            if (Math.abs(velocity) < 0.1 && !(window as any).__isTouching) {
              const targetScroll = self.scroll() - pinSpacerHeight;
              self.kill();
              lenis?.scrollTo(targetScroll, { immediate: true });
              requestAnimationFrame(() => ScrollTrigger.refresh());
            } else {
              requestAnimationFrame(attemptKill);
            }
          }
        };

        requestAnimationFrame(attemptKill);
      },
    });
  };

  return { createPinnedScroll };
};
