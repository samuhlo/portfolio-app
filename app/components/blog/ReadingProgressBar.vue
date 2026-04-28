<script setup lang="ts">
/**
 * █ [COMPONENT] :: READING PROGRESS BAR
 * =====================================================================
 * DESC:   Barra de progreso de lectura en la parte superior del viewport.
 *         Solo visible en movil (md:hidden).
 *         Se llena segun el scroll vertical del documento.
 * PROPS:  category: BlogCategory — para el color
 * =====================================================================
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { CATEGORY_COLORS, type BlogCategory } from '~/types/blog'

const props = defineProps<{
  category: BlogCategory
}>()

const readProgress = ref(0)

function updateReadProgress() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readProgress.value = docHeight > 0
    ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
    : 0
}

onMounted(() => {
  window.addEventListener('scroll', updateReadProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadProgress)
})
</script>

<template>
  <div
    class="reading-progress-bar md:hidden"
    :style="{
      width: `${readProgress}%`,
      backgroundColor: CATEGORY_COLORS[category],
    }"
  />
</template>
