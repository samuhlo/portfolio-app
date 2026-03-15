<script setup lang="ts">
/**
 * █ [LAYOUT] :: BIO SECTION
 * =====================================================================
 * DESC:   Sección estática de biografía y manifiesto de diseño.
 *         Incluye animaciones de SVGs (doodles) usando GSAP.
 *         Texto se anima con SplitText, doodles con pinned scroll.
 * USAGE:  Incluir entre Hero y Contact/Playground.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import { usePinnedScroll } from '~/composables/usePinnedScroll';
import { SplitText } from 'gsap/SplitText';
import { BREAKPOINTS } from '~/config/site';
import type { DoodleExposed } from '~/types/doodle';

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();
const { createPinnedScroll } = usePinnedScroll();

const sectionRef = ref<HTMLElement | null>(null);
const textContainerRef = ref<HTMLElement | null>(null);
const quotesOpenRef = ref<DoodleExposed | null>(null);
const crossFunRef = ref<DoodleExposed | null>(null);
const funRef = ref<DoodleExposed | null>(null);
const waveRef = ref<DoodleExposed | null>(null);
const heartRef = ref<DoodleExposed | null>(null);
const circleRef = ref<DoodleExposed | null>(null);
const quotesCloseRef = ref<DoodleExposed | null>(null);

const LAYOUT = {
  crossFun: { top: '60%', left: '-5%', width: '110%', transform: 'translateY(-50%)' },
  fun: { bottom: '55%', left: '10%', width: '2.5em' },
  wave: { top: '70%', left: '5%', width: '90%' },
  heart: { top: '5%', left: '102%', width: '1.5em', transform: 'rotate(30deg)' },
  circle: { top: '50%', left: '50%', width: '115%', transform: 'translate(-50%, -50%)' },
};

// Orden canónico de todos los doodles — se usa tanto en móvil como en desktop
type DoodleConfig = {
  ref: typeof quotesOpenRef;
  duration: number;
  stagger?: number;
  position?: string;
};

const HEARTBEAT_DELAY_MS = 600;

onMounted(async () => {
  // Esperar a que las fuentes se carguen para evitar errores con SplitText en producción
  await document.fonts.ready;

  initGSAP(() => {
    const getPaths = (r: typeof quotesOpenRef) => preparePaths(r.value?.svg ?? null);
    const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`).matches;

    // ── TEXTO ────────────────────────────────────────────────────────────────
    const paragraphs = textContainerRef.value?.querySelectorAll('p') as NodeListOf<HTMLElement>;
    const split = new SplitText(paragraphs, { type: 'lines' });

    gsap.from(split.lines, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: textContainerRef.value,
        start: 'top 85%',
        once: true,
      },
    });

    // ── CONFIGS DE DOODLES ───────────────────────────────────────────────────
    //
    // En móvil: todos en un único timeline secuencial (sin división).
    // En desktop: grupo A con el texto, grupo B con el pin.

    const allConfigs: DoodleConfig[] = [
      { ref: quotesOpenRef, duration: 0.5 },
      { ref: crossFunRef, duration: 0.4, position: '+=0.1' },
      { ref: funRef, duration: 0.5, stagger: 0.1, position: '-=0.1' },
      { ref: waveRef, duration: 0.6, position: '+=0.1' },
      { ref: heartRef, duration: 0.5, stagger: 0.1, position: '+=0.1' },
      { ref: circleRef, duration: 0.6, position: '+=0.1' },
      { ref: quotesCloseRef, duration: 0.5, position: '+=0.1' },
    ];

    const buildTl = (configs: DoodleConfig[]) => {
      const tl = gsap.timeline({ paused: true });
      for (const cfg of configs) {
        if (!cfg.ref.value?.svg) continue;
        addDrawAnimation(tl, {
          svg: cfg.ref.value.svg,
          paths: getPaths(cfg.ref),
          duration: cfg.duration,
          ...(cfg.stagger != null && { stagger: cfg.stagger }),
          ...(cfg.position != null && { position: cfg.position }),
        });
      }
      return tl;
    };

    // ── MÓVIL: un solo timeline, un solo trigger ─────────────────────────────
    if (isMobile) {
      const mobileTl = buildTl(allConfigs);
      mobileTl.timeScale(1.8);

      ScrollTrigger.create({
        trigger: textContainerRef.value,
        start: 'top 60%',
        once: true,
        onEnter: () => mobileTl.play(),
      });

      // Heartbeat móvil
      setupHeartbeat(mobileTl);
      return;
    }

    // ── DESKTOP: grupo A (early) + grupo B (pin) ─────────────────────────────
    //
    // Grupo A — se dibuja con el texto al entrar en pantalla.
    // Grupo B — controlado por el pinned scroll una vez centrado.
    // Resultado: el usuario nunca ve texto sin doodles.

    const earlyTl = buildTl(allConfigs.slice(0, 3)); // quotesOpen, crossFun, fun
    const pinTl = buildTl(allConfigs.slice(3)); // wave, heart, circle, quotesClose

    ScrollTrigger.create({
      trigger: textContainerRef.value,
      start: 'top 85%',
      once: true,
      onEnter: () => earlyTl.play(),
    });

    if (!sectionRef.value) return;

    createPinnedScroll({
      trigger: sectionRef.value,
      start: 'top top',
      end: '+=2000',
      phases: [{ timeline: pinTl, start: 0, end: 1 }],
    });

    setupHeartbeat(pinTl);

    // ── HEARTBEAT ────────────────────────────────────────────────────────────
    function setupHeartbeat(doodleTl: gsap.core.Timeline) {
      const heartSvg = heartRef.value?.svg;
      if (!heartSvg) return;

      let doodlesComplete = false;
      const heartbeatTl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });

      gsap.set(heartSvg, { transformOrigin: 'center center' });
      heartbeatTl
        .to(heartSvg, { scale: 1.25, duration: 0.12, ease: 'power2.out' })
        .to(heartSvg, { scale: 1, duration: 0.1, ease: 'power2.in' })
        .to(heartSvg, { scale: 1.15, duration: 0.1, ease: 'power2.out' }, '+=0.08')
        .to(heartSvg, { scale: 1, duration: 0.2, ease: 'power2.in' });

      doodleTl.eventCallback('onComplete', () => {
        doodlesComplete = true;
        setTimeout(() => heartbeatTl.play(0), HEARTBEAT_DELAY_MS);
      });

      ScrollTrigger.create({
        trigger: sectionRef.value,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
          if (doodlesComplete) setTimeout(() => heartbeatTl.play(0), HEARTBEAT_DELAY_MS);
        },
        onEnterBack: () => {
          if (doodlesComplete) setTimeout(() => heartbeatTl.play(0), HEARTBEAT_DELAY_MS);
        },
        onLeave: () => heartbeatTl.pause(),
        onLeaveBack: () => heartbeatTl.pause(),
      });
    }
  });
});
</script>

<template>
  <section
    ref="sectionRef"
    class="min-h-screen w-full flex justify-center items-center overflow-x-clip bio-section"
    style="padding: 10vh 12.5% 10vh 8.33%"
  >
    <div
      ref="textContainerRef"
      class="bio-text-container w-full text-center flex flex-col gap-8 text-[clamp(1.2rem,2.5vw,2.5rem)] font-medium leading-relaxed tracking-tight"
    >
      <p class="relative">
        <span class="sr-only"
          >Hi, I'm Samuel. I work as a Product Architect, which is just a formal way of saying I
          love designing digital ecosystems and coding them from scratch. I build architectures that
          are rock-solid, but that feel alive.</span
        >
        <span aria-hidden="true">
          <span class="relative inline-block">
            <DoodleQuotesOpenBio
              ref="quotesOpenRef"
              class="absolute pointer-events-none opacity-0 layout-quotes-open bio-abs-doodle"
            />
          </span>
          Hi, I'm Samuel. I work as a <b>Product Architect</b>, which is just a
          <span class="relative inline-block">
            formal
            <DoodleCrossFunBio
              ref="crossFunRef"
              class="absolute pointer-events-none opacity-0"
              :style="LAYOUT.crossFun"
            />
            <DoodleFunBio
              ref="funRef"
              class="absolute pointer-events-none opacity-0"
              :style="LAYOUT.fun"
            />
          </span>
          way of saying I love
          <span class="relative inline-block">
            designing digital ecosystems
            <DoodleWaveBio
              ref="waveRef"
              class="absolute pointer-events-none opacity-0"
              :style="LAYOUT.wave"
            />
          </span>
          and coding them from scratch. I build architectures that are rock-solid, but that
          <span class="relative inline-block">
            feel alive.
            <DoodleHeartBio
              ref="heartRef"
              class="absolute pointer-events-none opacity-0"
              :style="LAYOUT.heart"
            />
          </span>
        </span>
      </p>
      <p class="relative">
        <span class="sr-only"
          >If you're looking for someone who understands design, writes clean code, and has a
          business mindset... you've come to the right place. Come say hi!</span
        >
        <span aria-hidden="true">
          If you're looking for someone who understands <b>design</b>, writes <b>clean code</b>, and
          has a <b>business mindset</b>... you've come to the right place.
          <span class="relative inline-block">
            Come say hi!
            <DoodleCircleWord
              ref="circleRef"
              class="absolute pointer-events-none opacity-0"
              :style="LAYOUT.circle"
            />
            <DoodleQuotesCloseBio
              ref="quotesCloseRef"
              class="absolute pointer-events-none opacity-0 layout-quotes-close bio-abs-doodle"
            />
          </span>
        </span>
      </p>
    </div>
  </section>
</template>

<style scoped>
/*
 * █ VARIABLES DE POSICIONAMIENTO - COMILLAS
 * =====================================================================
 * Ajusta aquí la posición de las comillas para desktop y móvil.
 */

.layout-quotes-open {
  /* DESKTOP */
  --q-open-top-desktop: -2em;
  --q-open-right-desktop: 0.2em;
  --q-open-width-desktop: 2em;
  --q-open-transform-desktop: rotate(-10deg);

  /* MOBILE */
  --q-open-top-mobile: -2em; /* <-- AJUSTAR MÓVIL AQUÍ */
  --q-open-right-mobile: -0.3em; /* <-- AJUSTAR MÓVIL AQUÍ */
  --q-open-width-mobile: 2em; /* <-- AJUSTAR MÓVIL AQUÍ */
  --q-open-transform-mobile: rotate(-10deg);

  top: var(--q-open-top-desktop);
  right: var(--q-open-right-desktop);
  width: var(--q-open-width-desktop);
  transform: var(--q-open-transform-desktop);
}

.layout-quotes-close {
  /* DESKTOP */
  --q-close-bottom-desktop: 1em;
  --q-close-left-desktop: 110%;
  --q-close-width-desktop: 2em;
  --q-close-transform-desktop: rotate(10deg);

  /* MOBILE */
  --q-close-bottom-mobile: 1em; /* <-- AJUSTAR MÓVIL AQUÍ */
  --q-close-left-mobile: 105%; /* <-- AJUSTAR MÓVIL AQUÍ */
  --q-close-width-mobile: 2em; /* <-- AJUSTAR MÓVIL AQUÍ */
  --q-close-transform-mobile: rotate(10deg);

  bottom: var(--q-close-bottom-desktop);
  left: var(--q-close-left-desktop);
  width: var(--q-close-width-desktop);
  transform: var(--q-close-transform-desktop);
}

@media (max-width: 768px) {
  .bio-section {
    min-height: auto;
    padding-bottom: 9vh !important;
  }

  .layout-quotes-open {
    top: var(--q-open-top-mobile);
    right: var(--q-open-right-mobile);
    width: var(--q-open-width-mobile);
    transform: var(--q-open-transform-mobile);
  }
  .layout-quotes-close {
    bottom: var(--q-close-bottom-mobile);
    left: var(--q-close-left-mobile);
    width: var(--q-close-width-mobile);
    transform: var(--q-close-transform-mobile);
  }
}

@media (max-width: 389px) {
  .bio-text-container {
    font-size: 1.05rem;
  }

  .bio-abs-doodle {
    z-index: -1;
  }
}
</style>
