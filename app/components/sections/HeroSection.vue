<template>
  <section
    class="h-screen w-full relative flex flex-col justify-center px-6 md:px-12 mx-auto overflow-hidden"
  >
    <h1
      ref="heroTitle"
      class="text-[clamp(2rem,12vw,13rem)] leading-[0.85] font-black uppercase text-right tracking-tighter w-full opacity-0 translate-y-8 whitespace-nowrap"
    >
      Samuel Lopez
    </h1>
    <h2
      ref="heroSubtitle"
      class="absolute bottom-32 left-0 right-0 md:bottom-48 md:left-12 text-[clamp(2rem,3vw,3.5rem)] font-bold text-center md:text-left tracking-tight opacity-0 translate-y-8"
    >
      Front-end Developer
    </h2>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

const heroTitle = ref<HTMLElement | null>(null);
const heroSubtitle = ref<HTMLElement | null>(null);

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to(heroTitle.value, {
    y: 0,
    opacity: 1,
    duration: 1.2,
  }).to(
    heroSubtitle.value,
    {
      y: 0,
      opacity: 1,
      duration: 1,
    },
    '-=0.8',
  );
});
</script>
