<script setup lang="ts">
/**
 * █ [UI_ORGANISM] :: MODAL DESKTOP LAYOUT
 * =====================================================================
 * DESC:   Layout horizontal para desktop. Slider con texto como primer
 *         slide seguido de placeholders de imagen.
 *         Expone refs del scroll container para Lenis externo.
 * =====================================================================
 */

interface Props {
  projectName: string;
  images: number[];
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const scrollContainerRef = ref<HTMLElement | null>(null);
const scrollContentRef = ref<HTMLElement | null>(null);

defineExpose({
  scrollContainerRef,
  scrollContentRef,
});
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Close Button -->
    <ModalCloseButton size="lg" @close="emit('close')" />

    <!-- Horizontal Scroll Area -->
    <div
      ref="scrollContainerRef"
      class="flex-1 w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar relative pointer-events-auto px-12"
    >
      <div ref="scrollContentRef" class="flex h-full items-center gap-24 box-border w-max">
        <!-- 1. Text slide -->
        <div class="h-full flex flex-col justify-between w-[45vw] shrink-0">
          <div class="space-y-8">
            <h1
              class="text-[7vw] font-black uppercase leading-none tracking-tight wrap-break-word pr-4"
            >
              {{ projectName }}
              <span class="text-base font-mono font-normal opacity-60 align-top ml-2">2025</span>
            </h1>

            <!-- INFO solo (sin techs/links, esos van abajo) -->
            <div class="font-mono space-y-4">
              <h3 class="font-bold uppercase tracking-wider mb-2 text-base">[INFO]</h3>
              <p class="opacity-80 leading-relaxed text-sm max-w-sm">
                Hi, I'm Samuel. I work as a Product Architect, which is a fancy way of saying I love
                designing complex things and coding them from scratch. I believe a website should be
                solid like a rock but move like water.
              </p>
            </div>
          </div>

          <!-- TECHS & LINKS -->
          <div class="flex gap-8 font-mono uppercase justify-between mt-auto pt-8 flex-wrap">
            <div>
              <h3 class="font-bold tracking-wider mb-2 text-base">[MAIN TECHS]</h3>
              <ul class="space-y-1 opacity-80 text-sm">
                <li>NUXTJS</li>
                <li>PINIA</li>
                <li>TAILWIND</li>
                <li>GSAP</li>
              </ul>
            </div>
            <div class="text-right">
              <h3 class="font-bold tracking-wider mb-2 text-base">[LINKS]</h3>
              <ul class="space-y-2 opacity-80 text-sm text-right">
                <li>
                  <DoodleHover><a href="#">LIVE DEMO</a></DoodleHover>
                </li>
                <li>
                  <DoodleHover><a href="#">GITHUB</a></DoodleHover>
                </li>
                <li>
                  <DoodleHover><a href="#">POST</a></DoodleHover>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 2. Image slides -->
        <ModalImageSlide v-for="img in images" :key="img" class="w-auto h-[80%]" />
      </div>
    </div>
  </div>
</template>
