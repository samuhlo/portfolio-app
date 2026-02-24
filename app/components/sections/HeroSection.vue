<script setup lang="ts">
/**
 * █ [LAYOUT] :: HERO SECTION
 * =====================================================================
 * DESC:   Orquestador de las animaciones del Hero. Gestiona el pin
 *         del scroll y alimenta los timelines de HeroTitle y HeroSubtitle
 *         desde un único ScrollTrigger para un control preciso y limpio.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref, onMounted } from 'vue';
import { useGSAP } from '~/composables/useGSAP';
import { usePinnedScroll } from '~/composables/usePinnedScroll';

const { gsap, initGSAP } = useGSAP();
const { createPinnedScroll } = usePinnedScroll();

// Referencias al wrapper y a los hijos
const pinWrapperRef = ref<HTMLElement | null>(null);
const heroTitleRef = ref<{ getTimeline: () => gsap.core.Timeline | null } | null>(null);
const heroSubtitleRef = ref<{ getTimeline: () => gsap.core.Timeline | null } | null>(null);

// Porcentaje del progreso total del scroll (2500px) donde empieza el subtítulo
// 0.6 significa "al 60% del scroll total", es decir, en el pixel 1500 de 2500
const TITLE_ENDS_AT = 0.6;

onMounted(() => {
  initGSAP(() => {
    const titleTl = heroTitleRef.value?.getTimeline();
    const subtitleTl = heroSubtitleRef.value?.getTimeline();

    if (!titleTl || !subtitleTl || !pinWrapperRef.value) return;

    createPinnedScroll({
      trigger: pinWrapperRef.value,
      start: 'top top',
      end: '+=2500',
      phases: [
        { timeline: titleTl, start: 0, end: TITLE_ENDS_AT },
        { timeline: subtitleTl, start: TITLE_ENDS_AT, end: 1 },
      ],
    });
  });
});
</script>

<template>
  <!--
    [NOTE] hero-pin-wrapper es lo que se "pinea" (fija) con GSAP ScrollTrigger.
    Es necesario que el elemento pineado sea un wrapper externo a la sección
    para que el pin-spacer de GSAP funcione correctamente y no rompa el layout.
  -->
  <div ref="pinWrapperRef" class="hero-pin-wrapper">
    <section
      class="hero-section h-screen w-full relative flex flex-col justify-center items-center md:items-end px-6 md:px-12 mx-auto overflow-visible"
    >
      <HeroTitle
        ref="heroTitleRef"
        class="text-[clamp(2rem,12vw,15rem)] font-black uppercase tracking-tighter whitespace-nowrap"
      />

      <HeroSubtitle
        ref="heroSubtitleRef"
        class="mt-20 md:mt-0 md:absolute md:bottom-64 md:left-12 lg:left-24"
      />
    </section>
  </div>
</template>
