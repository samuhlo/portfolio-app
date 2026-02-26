<script setup lang="ts">
/**
 * █ [UI_ORGANISM] :: MODAL MOBILE LAYOUT
 * =====================================================================
 * DESC:   Layout vertical para móvil. Título → slider de imágenes
 *         horizontal independiente → bloque de texto.
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
  <div
    class="w-full min-h-dvh flex flex-col px-6 pt-12 pb-24 overflow-y-auto overflow-x-hidden relative"
  >
    <!-- Close Button -->
    <ModalCloseButton size="sm" @close="emit('close')" />

    <!-- 1. Title -->
    <div class="mt-8 mb-8 pr-12">
      <h1
        class="text-[14vw] sm:text-[10vw] font-black uppercase leading-[0.85] tracking-tight wrap-break-word"
      >
        {{ projectName }}
        <span class="text-xs font-mono font-normal opacity-60 align-top ml-1">2025</span>
      </h1>
    </div>

    <!-- 2. Independent Horizontal Scroll Area for Images -->
    <div
      ref="scrollContainerRef"
      class="w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar relative pointer-events-auto -mx-6 px-6"
    >
      <div ref="scrollContentRef" class="flex items-center gap-4 box-border w-max pb-6">
        <ModalImageSlide v-for="(img, i) in images" :key="i" :src="img" class="h-[40vh] min-h-75" />
      </div>
    </div>

    <!-- 3. Text content -->
    <div class="mt-8">
      <ModalProjectInfo size="sm" layout="column" />
    </div>
  </div>
</template>
