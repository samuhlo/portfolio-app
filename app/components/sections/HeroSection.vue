<template>
  <section
    class="h-screen w-full relative flex flex-col justify-center items-center md:items-end px-6 md:px-12 mx-auto overflow-visible"
  >
    <!--
      [NOTE] HeroTitle maneja su propia animación via ScrollTrigger.
      El font-size aquí hereda el tamaño fluido para que el SVG se escale correctamente.
    -->
    <HeroTitle
      class="text-[clamp(2rem,12vw,15rem)] font-black uppercase tracking-tighter whitespace-nowrap"
    />

    <h2
      ref="heroSubtitle"
      class="absolute bottom-32 left-0 right-0 md:bottom-48 md:left-12 text-[clamp(1.25rem,3vw,3.5rem)] font-bold text-center md:text-left tracking-tight opacity-0 translate-y-8"
    >
      Front-end Developer
    </h2>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

const heroSubtitle = ref<HTMLElement | null>(null);

onMounted(() => {
  gsap.to(heroSubtitle.value, {
    y: 0,
    opacity: 1,
    duration: 1,
    delay: 0.4,
    ease: 'power3.out',
  });
});
</script>
