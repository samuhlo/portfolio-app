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
  images: string[];
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

            <!-- Project Info (INFO + TECHS + LINKS) -->
            <ModalProjectInfo size="lg" layout="row" />
          </div>
        </div>

        <!-- 2. Image slides -->
        <ModalImageSlide v-for="(img, i) in images" :key="i" :src="img" class="w-auto h-[80%]" />
      </div>
    </div>

    <!-- Scroll Direction Indicators -->
    <div class="absolute bottom-8 right-12">
      <ModalScrollIndicators :scroll-container="scrollContainerRef" />
    </div>
  </div>
</template>
