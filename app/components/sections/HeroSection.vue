<template>
  <section class="h-screen w-full flex flex-col pb-12 pt-32 px-6 md:px-12 mx-auto">
    <div class="grow flex flex-col justify-center w-full">
      <h1
        ref="heroTitle"
        class="text-7xl md:text-[8rem] lg:text-[13em] leading-[0.85] font-black uppercase text-right tracking-tighter w-full opacity-0 translate-y-8"
      >
        Samuel Lopez
      </h1>
      <h2
        ref="heroSubtitle"
        class="text-base md:text-4xl mt-80 font-bold text-left tracking-tight opacity-0 translate-y-8"
      >
        Front-end Developer
      </h2>
    </div>
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
