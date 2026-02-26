<script setup lang="ts">
/**
 * █ [LAYOUT] :: BIO SECTION
 * =====================================================================
 * DESC:   Sección estática de biografía y manifiesto de diseño.
 *         Incluye animaciones de SVGs (doodles) usando GSAP.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { useDoodleDraw } from '~/composables/useDoodleDraw';
import { usePinnedScroll } from '~/composables/usePinnedScroll';
import { useWindowSize } from '@vueuse/core';
import { SplitText } from 'gsap/SplitText';

interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();
const { createPinnedScroll } = usePinnedScroll();

const sectionRef = ref<HTMLElement | null>(null);

const quotesOpenRef = ref<DoodleExposed | null>(null);
const crossFunRef = ref<DoodleExposed | null>(null);
const funRef = ref<DoodleExposed | null>(null);
const waveRef = ref<DoodleExposed | null>(null);
const heartRef = ref<DoodleExposed | null>(null);
const circleRef = ref<DoodleExposed | null>(null);
const quotesCloseRef = ref<DoodleExposed | null>(null);

// [NOTE] Posiciones originales de desktop — los doodles sobresalen del contenedor intencionalmente
const LAYOUT_DESKTOP = {
  quotesOpen: { top: '-2em', right: '0.2em', width: '2em', transform: 'rotate(-10deg)' },
  crossFun: { top: '60%', left: '-5%', width: '110%', transform: 'translateY(-50%)' },
  fun: { bottom: '55%', left: '10%', width: '2.5em' },
  wave: { top: '70%', left: '5%', width: '90%' },
  heart: { top: '5%', left: '102%', width: '1.5em', transform: 'rotate(30deg)' },
  circle: { top: '50%', left: '50%', width: '115%', transform: 'translate(-50%, -50%)' },
  quotesClose: { bottom: '-0.2em', left: '110%', width: '2em', transform: 'rotate(10deg)' },
};

// [NOTE] En móvil overflow-x-clip recorta lo que sobresale → ajustar posiciones
const LAYOUT_MOBILE = {
  ...LAYOUT_DESKTOP,
  crossFun: { top: '60%', left: '-2%', width: '104%', transform: 'translateY(-50%)' },
  heart: { top: '-15%', left: '80%', width: '1.5em', transform: 'rotate(30deg)' },
  circle: { top: '50%', left: '50%', width: '105%', transform: 'translate(-50%, -50%)' },
  quotesClose: { bottom: '-0.2em', left: '90%', width: '2em', transform: 'rotate(10deg)' },
};

const MOBILE_BREAKPOINT = 768;
const { width } = useWindowSize();
const LAYOUT = computed(() => (width.value < MOBILE_BREAKPOINT ? LAYOUT_MOBILE : LAYOUT_DESKTOP));

const TEXT_ENDS_AT = 0.3;
const HEARTBEAT_DELAY_MS = 600;
const textContainerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  initGSAP(() => {
    const getPaths = (refItem: typeof quotesOpenRef) => preparePaths(refItem.value?.svg ?? null);

    // ── TEXTO: Se anima al entrar la sección en el viewport (antes del pin) ──
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

    // ── DOODLES: Timeline pausado para el pinned scroll ──
    const doodleTl = gsap.timeline({ paused: true });

    if (quotesOpenRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: quotesOpenRef.value.svg,
        paths: getPaths(quotesOpenRef),
        duration: 0.5,
      });
    }
    if (crossFunRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: crossFunRef.value.svg,
        paths: getPaths(crossFunRef),
        duration: 0.4,
        position: '+=0.1',
      });
    }
    if (funRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: funRef.value.svg,
        paths: getPaths(funRef),
        duration: 0.5,
        stagger: 0.1,
        position: '-=0.1',
      });
    }
    if (waveRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: waveRef.value.svg,
        paths: getPaths(waveRef),
        duration: 0.6,
        position: '+=0.1',
      });
    }
    if (heartRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: heartRef.value.svg,
        paths: getPaths(heartRef),
        duration: 0.5,
        stagger: 0.1,
        position: '+=0.1',
      });
    }
    if (circleRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: circleRef.value.svg,
        paths: getPaths(circleRef),
        duration: 0.6,
        position: '+=0.1',
      });
    }
    if (quotesCloseRef.value?.svg) {
      addDrawAnimation(doodleTl, {
        svg: quotesCloseRef.value.svg,
        paths: getPaths(quotesCloseRef),
        duration: 0.5,
        position: '+=0.1',
      });
    }

    // ── PINNED SCROLL: Solo doodles ──
    if (!sectionRef.value) return;

    createPinnedScroll({
      trigger: sectionRef.value,
      start: 'top top',
      end: '+=2000',
      phases: [{ timeline: doodleTl, start: 0, end: 1 }],
    });

    // ── HEARTBEAT: Latido en loop tras completar todos los doodles ──
    const heartSvg = heartRef.value?.svg;
    if (heartSvg) {
      let doodlesComplete = false;
      const heartbeatTl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });

      // [NOTE] Doble pulso (bum-bum) como un corazón real
      gsap.set(heartSvg, { transformOrigin: 'center center' });
      heartbeatTl
        .to(heartSvg, { scale: 1.25, duration: 0.12, ease: 'power2.out' })
        .to(heartSvg, { scale: 1, duration: 0.1, ease: 'power2.in' })
        .to(heartSvg, { scale: 1.15, duration: 0.1, ease: 'power2.out' }, '+=0.08')
        .to(heartSvg, { scale: 1, duration: 0.2, ease: 'power2.in' });

      // Primera vez: arranca cuando TODOS los doodles terminan de dibujarse
      doodleTl.eventCallback('onComplete', () => {
        doodlesComplete = true;
        setTimeout(() => heartbeatTl.play(0), HEARTBEAT_DELAY_MS);
      });

      // Posteriores: re-arranca al volver a entrar en viewport
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
    class="min-h-screen w-full flex justify-center items-center overflow-x-clip"
    style="padding: 10vh 12.5% 10vh 8.33%"
  >
    <div
      ref="textContainerRef"
      class="w-full text-center flex flex-col gap-8 text-[clamp(1.2rem,2.5vw,2.5rem)] font-medium leading-relaxed tracking-tight"
    >
      <p>
        <span class="relative inline-block">
          <DoodleQuotesOpenBio
            ref="quotesOpenRef"
            class="absolute pointer-events-none opacity-0"
            :style="LAYOUT.quotesOpen"
          />
        </span>
        Hi, I’m Samuel. I work as a <b>Product Architect</b>, which is just a
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
      </p>
      <p>
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
            class="absolute pointer-events-none opacity-0"
            :style="LAYOUT.quotesClose"
          />
        </span>
      </p>
    </div>
  </section>
</template>
