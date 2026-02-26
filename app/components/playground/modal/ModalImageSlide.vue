<script setup lang="ts">
/**
 * █ [UI_ATOM] :: MODAL IMAGE SLIDE
 * =====================================================================
 * DESC:   Slide de imagen para el modal. Usa NuxtImg para optimización
 *         automática (lazy, format, sizes). Fallback a placeholder X.
 * =====================================================================
 */

interface Props {
  src?: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: 'Project screenshot',
});

const hasImage = computed(() => !!props.src);
</script>

<template>
  <div
    class="aspect-4/3 shrink-0 border border-background/20 relative overflow-hidden bg-background/5"
  >
    <!-- NuxtImg optimizada -->
    <NuxtImg
      v-if="hasImage"
      :src="src"
      :alt="alt"
      loading="lazy"
      format="webp"
      quality="100"
      sizes="sm:90vw md:50vw lg:40vw"
      placeholder
      draggable="false"
      class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
    />

    <!-- Placeholder X (fallback) -->
    <svg
      v-else
      class="absolute inset-0 w-full h-full stroke-background/20"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="0" x2="100%" y2="100%" stroke-width="1.5" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke-width="1.5" />
    </svg>
  </div>
</template>
