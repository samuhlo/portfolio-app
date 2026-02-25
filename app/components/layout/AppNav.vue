import { DoodleHover } from '../../../.nuxt/components';
<script setup lang="ts">
/**
 * █ [LAYOUT] :: APP NAV
 * =====================================================================
 * DESC:   Navegación principal superior (Sticky).
 * STATUS: STABLE
 * =====================================================================
 */
</script>

<template>
  <nav
    class="absolute top-15 left-0 right-0 z-50 flex justify-between items-center p-6 md:px-12 w-full"
  >
    <div class="flex gap-8 text-xs md:text-sm uppercase tracking-widest font-medium">
      <DoodleHover>
        <NuxtLink to="/" class="hover:font-bold transition-opacity">Home</NuxtLink>
      </DoodleHover>
      <DoodleHover>
        <NuxtLink to="/" class="hover:font-bold transition-opacity">Logs</NuxtLink>
      </DoodleHover>
    </div>
    <div class="text-xs md:text-sm uppercase tracking-widest font-medium">
      <DoodleHover>
        <NuxtLink to="/" class="hover:font-bold transition-opacity">Contact</NuxtLink>
      </DoodleHover>
    </div>
  </nav>
</template>
