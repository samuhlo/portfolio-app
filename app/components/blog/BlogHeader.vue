<script setup lang="ts">
/**
 * █ [COMPONENT] :: BLOG HEADER
 * =====================================================================
 * DESC:   Título principal de la sección logs.
 *         Encapsula el header grande con breadcrumb.
 *         La "B" y "logs" están separados para la animación cartoon
 *         donde "logs" empuja a la "B" fuera de pantalla.
 *         Toda la lógica de animación (reveal, cartoon, doodle) vive
 *         aquí para máxima colocation.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from '#imports';
import { useGSAP } from '~/composables/useGSAP';
import { useBlogHeaderPhysics } from '~/composables/useBlogHeaderPhysics';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import { useBlogHeaderAnimationGate } from '~/composables/useBlogHeaderAnimationGate';
import type { DoodleExposed } from '~/types/doodle';

const props = withDefaults(
  defineProps<{
    localeSwitch?: boolean;
  }>(),
  {
    localeSwitch: false,
  },
);

const { gsap, initGSAP } = useGSAP();
const { launch: launchBPhysics } = useBlogHeaderPhysics();
const { preparePaths, addDrawAnimation } = useDoodleDraw();
const { setAnimating } = useBlogHeaderAnimationGate();
const { locale } = useI18n();

const headerRef = ref<HTMLElement | null>(null);
const doodleRef = ref<DoodleExposed | null>(null);

// =============================================================================
// █ CONSTANTS: ANIMACIÓN CARTOON
// =============================================================================
/** Delay (s) tras el reveal del título antes de iniciar la animación cartoon */
const CARTOON_DELAY = 0.6;
/** Distancia que "logs" se separa hacia la derecha (wind-up) */
const WIND_UP_DISTANCE = 60;
/** Duración del wind-up */
const WIND_UP_DURATION = 0.5;
/** Duración del charge (logs se lanza hacia la B) */
const CHARGE_DURATION = 0.18;
/** Duración del settle elástico de "logs" tras el impacto */
const SETTLE_DURATION = 0.8;
/** Duración del slide de "logs" a la posición de la "B" */
const SLIDE_TO_ORIGIN_DURATION = 0.35;

// =============================================================================
// █ CONSTANTS: DOODLE DRAW
// =============================================================================
const DOODLE_TIMING = {
  duration: 0.16,
  stagger: 0.11,
  ease: 'power3.out',
  proportional: true,
};

// TOP SAMLL
const DOODLE_STYLE = {
  top: '-0.2em',
  left: '0',
  width: '1.3em',
  transform: 'rotate(3deg)',
};

// BOTTOM BIG
// const DOODLE_STYLE = {
//   bottom: '-0.23em',
//   left: '0',
//   width: '2.1em',
// };

// =============================================================================
// █ NAVIGATION: detectar si venimos de un post para skip de animación
// =============================================================================
const route = useRoute();

onMounted(() => {
  initGSAP(() => {
    if (!headerRef.value) return;

    const letterB = headerRef.value.querySelector<HTMLElement>('.blog-letter-b');
    const wordLogs = headerRef.value.querySelector<HTMLElement>('.blog-word-logs');
    const canvas = headerRef.value.querySelector<HTMLCanvasElement>('.blog-header-canvas');
    const titleContainer = headerRef.value.querySelector<HTMLElement>('.blog-header-title');
    const doodleSvg = doodleRef.value?.svg ?? null;

    if (!letterB || !wordLogs || !canvas || !titleContainer) return;

    // Preparar paths del doodle para animación de dibujo
    const doodlePaths = preparePaths(doodleSvg);

    // [NOTE] Capturar ancho de la "B" antes de animar para calcular el slide final
    const bWidth = letterB.getBoundingClientRect().width;
    const fontSize = parseFloat(getComputedStyle(wordLogs).fontSize);
    const bWidthInEm = bWidth / fontSize;

    // =================================================================
    // GUARD: Si venimos de un blog post, aplicar estado final directo
    // con un fade-in sutil para que no quede estático.
    // =================================================================
    if (route.meta.skipHeaderAnimation || props.localeSwitch) {
      setAnimating(false);
      gsap.set(letterB, { opacity: 0 });
      wordLogs.style.marginLeft = `-${bWidthInEm}em`;
      titleContainer.style.overflow = 'visible';

      // Doodle visible con paths dibujados
      if (doodleSvg) {
        gsap.set(doodleSvg, { opacity: 1 });
        doodlePaths.forEach((p) => gsap.set(p, { strokeDashoffset: 0, visibility: 'visible' }));
      }

      if (props.localeSwitch) {
        // [NOTE] Cambio de idioma en /blog:
        // mantener título en estado final y animar solo el subtítulo.
        gsap.fromTo(
          '.blog-header-desc',
          { opacity: 0.16, y: 12 },
          { opacity: 0.5, y: 0, duration: 0.72, ease: 'power2.out' },
        );
      } else {
        // Fade-in sutil del header completo al volver desde post.
        gsap.from(headerRef.value, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
        });
      }
      return;
    }

    // =================================================================
    // TIMELINE PRINCIPAL — Entrance del header completo
    // =================================================================
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    setAnimating(true);

    // FASE 1 — TITLE "BLOGS": reveal desde abajo (yPercent clip effect)
    tl.from(
      '.blog-header-title h1',
      {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        onComplete: () => {
          // [NOTE] Liberar overflow tras reveal para que el doodle no se clip
          titleContainer.style.overflow = 'visible';
        },
      },
      '-=0.2',
    );

    // FASE 3 — LÍNEA DECORATIVA: se extiende de izquierda a derecha
    tl.from(
      '.blog-header-line',
      {
        scaleX: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '-=0.4',
    );

    // FASE 4 — DESCRIPCIÓN: fade + slide desde abajo
    tl.from(
      '.blog-header-desc',
      {
        y: 20,
        opacity: 0,
        duration: 0.7,
      },
      '-=0.5',
    );

    // =================================================================
    // CARTOON TIMELINE (independiente) — "logs" empuja "B" fuera
    // [NOTE] Separado del timeline principal para no bloquear el resto
    // de las fases de entrada de la página.
    // =================================================================
    const cartoonTl = gsap.timeline({ delay: CARTOON_DELAY });

    // Paso 1: Wind-up — "logs" se separa hacia la derecha con squash
    cartoonTl.to(wordLogs, {
      x: WIND_UP_DISTANCE,
      scaleX: 0.92,
      scaleY: 1.06,
      duration: WIND_UP_DURATION,
      ease: 'power2.in',
    });

    // Paso 2: Charge — "logs" se lanza a la izquierda con stretch
    cartoonTl.to(wordLogs, {
      x: -8,
      scaleX: 1.06,
      scaleY: 0.95,
      duration: CHARGE_DURATION,
      ease: 'power4.in',
      onComplete: () => {
        // IMPACTO -> Ocultar la "B" del DOM y lanzar con Matter.js
        gsap.set(letterB, { opacity: 0 });

        const rect = titleContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const bRect = letterB.getBoundingClientRect();
        const containerRect = titleContainer.getBoundingClientRect();

        const computedStyle = getComputedStyle(letterB);
        const impactFontSize = parseFloat(computedStyle.fontSize);
        const fontFamily = computedStyle.fontFamily;
        const fontWeight = computedStyle.fontWeight;

        launchBPhysics(canvas, {
          text: 'B',
          font: `${fontWeight} ${impactFontSize}px ${fontFamily}`,
          startX: bRect.left - containerRect.left + bRect.width / 2,
          startY: bRect.top - containerRect.top + bRect.height / 2,
          charWidth: bRect.width,
          charHeight: bRect.height,
        });
      },
    });

    // Paso 3: Settle — "logs" se asienta con overshoot elástico
    cartoonTl.to(wordLogs, {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      duration: SETTLE_DURATION,
      ease: 'elastic.out(1, 0.35)',
    });

    // Paso 4: Slide — "logs" se desliza rápido a la posición original de "BLogs"
    // [NOTE] onComplete: swap px transform -> em margin para que escale con resize
    cartoonTl.to(wordLogs, {
      x: -bWidth,
      duration: SLIDE_TO_ORIGIN_DURATION,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(wordLogs, { clearProps: 'x' });
        wordLogs.style.marginLeft = `-${bWidthInEm}em`;
      },
    });

    // Paso 5: Doodle draw — subtítulo se dibuja tras el cartoon
    if (doodleSvg && doodlePaths.length) {
      addDrawAnimation(cartoonTl, {
        svg: doodleSvg,
        paths: doodlePaths,
        ...DOODLE_TIMING,
      });
    }

    cartoonTl.eventCallback('onComplete', () => {
      setAnimating(false);
    });
  }, headerRef.value);
});

onUnmounted(() => {
  setAnimating(false);
});

watch(locale, (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale || !headerRef.value) return;

  gsap.fromTo(
    '.blog-header-desc',
    { opacity: 0.18, y: 10 },
    { opacity: 0.5, y: 0, duration: 0.68, ease: 'power2.out' },
  );
});
</script>

<template>
  <header ref="headerRef" class="blog-header max-w-3xl mb-4 md:mb-12">
    <!-- [NOTE]: overflow-hidden es crítico para el clip-path reveal de GSAP -->
    <!-- Se libera a visible tras el reveal vía onComplete -->
    <div class="blog-header-title overflow-hidden relative">
      <h1
        class="text-[clamp(4.25rem,24vw,11rem)] font-black uppercase tracking-tighter leading-[0.85] relative"
      >
        <!-- [NOTE]: Split para animación cartoon. "logs" empuja "B" fuera de pantalla -->
        <span class="blog-letter-b inline-block">B</span
        ><span class="blog-word-logs inline-block">Logs</span>

        <!-- Doodle subtítulo: se dibuja tras la animación cartoon -->
        <!-- [NOTE] em units -> escala con el clamp() del h1 (mismo patrón que PlaygroundTitle) -->
        <DoodleSubtitleBlog
          ref="doodleRef"
          class="blog-subtitle-doodle absolute h-auto pointer-events-none opacity-0"
          :style="DOODLE_STYLE"
        />
      </h1>

      <!-- Canvas para renderizar la "B" con Matter.js tras el impacto -->
      <canvas
        class="blog-header-canvas absolute inset-0 w-full h-full pointer-events-none"
        style="color: var(--color-foreground, #0c0011)"
      />
    </div>

    <!-- Línea decorativa que se anima con scaleX (transform-origin: left) -->
    <div class="blog-header-line mt-3 md:mt-6 h-px bg-foreground/10 origin-left" />

    <p
      class="blog-header-desc mt-4 md:mt-8 text-xs md:text-base font-mono tracking-wide opacity-50 max-w-lg leading-relaxed"
    >
      {{ $t('blog.header_desc') }}
    </p>
  </header>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
