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

const { gsap, ScrollTrigger, initGSAP } = useGSAP();
const lenis = useLenis();

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

    let titleCompleted = false;
    let subtitleCompleted = false;

    ScrollTrigger.create({
      trigger: pinWrapperRef.value,
      start: 'top top',
      end: '+=2500', // 2500px de scroll total para ambas animaciones
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // — Título: ocupa el primer 60% del scroll (0 → TITLE_ENDS_AT)
        if (!titleCompleted) {
          const titleProgress = Math.min(progress / TITLE_ENDS_AT, 1);
          gsap.to(titleTl, {
            progress: titleProgress,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          if (titleProgress >= 1) titleCompleted = true;
        }

        // — Subtítulo: ocupa el último 40% del scroll (TITLE_ENDS_AT → 1)
        if (!subtitleCompleted) {
          const subtitleRaw = (progress - TITLE_ENDS_AT) / (1 - TITLE_ENDS_AT);
          const subtitleProgress = Math.max(0, Math.min(subtitleRaw, 1));
          gsap.to(subtitleTl, {
            progress: subtitleProgress,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          if (subtitleProgress >= 1) subtitleCompleted = true;
        }
      },
      onLeave: (self) => {
        // [NOTE] Al completar ambas animaciones, matamos el trigger para eliminar
        // el pin-spacer de 2500px. Compensamos con Lenis (immediate) para evitar salto.
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
