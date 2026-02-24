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
import { SplitText } from 'gsap/SplitText';

interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const { preparePaths, addDrawAnimation } = useDoodleDraw();
const lenis = useLenis();

const sectionRef = ref<HTMLElement | null>(null);

const quotesOpenRef = ref<DoodleExposed | null>(null);
const crossFunRef = ref<DoodleExposed | null>(null);
const funRef = ref<DoodleExposed | null>(null);
const waveRef = ref<DoodleExposed | null>(null);
const heartRef = ref<DoodleExposed | null>(null);
const circleRef = ref<DoodleExposed | null>(null);
const quotesCloseRef = ref<DoodleExposed | null>(null);

const LAYOUT = {
  quotesOpen: { top: '-2em', right: '0.2em', width: '2em', transform: 'rotate(-10deg)' },
  crossFun: { top: '60%', left: '-5%', width: '110%', transform: 'translateY(-50%)' },
  fun: { bottom: '55%', left: '10%', width: '2.5em' },
  wave: { top: '70%', left: '5%', width: '90%' },
  heart: { top: '5%', left: '102%', width: '1.5em', transform: 'rotate(30deg)' },
  circle: { top: '50%', left: '50%', width: '115%', transform: 'translate(-50%, -50%)' },
  quotesClose: { bottom: '-0.2em', left: '110%', width: '2em', transform: 'rotate(10deg)' },
};

const textContainerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  initGSAP(() => {
    const getPaths = (refItem: typeof quotesOpenRef) => preparePaths(refItem.value?.svg ?? null);

    // ── TIMELINE 1: Texto apareciendo línea por línea ──
    const paragraphs = textContainerRef.value?.querySelectorAll('p') as NodeListOf<HTMLElement>;
    const split = new SplitText(paragraphs, { type: 'lines' });

    const textTl = gsap.timeline({ paused: true });
    textTl.from(split.lines, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
    });

    // ── TIMELINE 2: Doodles dibujándose secuencialmente ──
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

    // ── SCROLL TRIGGER: Pin + control manual de progreso (patrón HeroSection) ──
    const TEXT_ENDS_AT = 0.3; // El texto usa el primer 30% del scroll
    let textCompleted = false;
    let doodlesCompleted = false;

    ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top 20%',
      end: '+=2000',
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // — Texto: primer 30% del scroll
        if (!textCompleted) {
          const textProgress = Math.min(progress / TEXT_ENDS_AT, 1);
          gsap.to(textTl, {
            progress: textProgress,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          if (textProgress >= 1) textCompleted = true;
        }

        // — Doodles: último 70% del scroll
        if (!doodlesCompleted) {
          const doodleRaw = (progress - TEXT_ENDS_AT) / (1 - TEXT_ENDS_AT);
          const doodleProgress = Math.max(0, Math.min(doodleRaw, 1));
          gsap.to(doodleTl, {
            progress: doodleProgress,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          if (doodleProgress >= 1) doodlesCompleted = true;
        }
      },
      onLeave: (self) => {
        // [NOTE] Al completar la animación, matamos el trigger para eliminar
        // el pin-spacer de 2000px y dejar la bio en su altura natural.
        // Usamos Lenis con immediate: true para compensar el scroll (window.scrollTo no funciona con Lenis).
        const pinSpacerHeight = self.end - self.start;
        const targetScroll = self.scroll() - pinSpacerHeight;
        self.kill();
        lenis?.scrollTo(targetScroll, { immediate: true });
      },
    });
  });
});
</script>

<template>
  <section
    ref="sectionRef"
    class="min-h-screen w-full flex justify-center items-center"
    style="padding: 8vh 12.5% 13vh 8.33%"
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
