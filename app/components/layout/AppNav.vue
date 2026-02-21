<template>
  <nav
    class="absolute top-15 left-0 right-0 z-50 flex justify-between items-center p-6 md:px-12 w-full"
  >
    <div class="flex gap-8 text-xs md:text-sm uppercase tracking-widest font-medium">
      <NuxtLink to="/" class="hover:text-accent transition-opacity">Home</NuxtLink>
      <NuxtLink to="/" class="hover:text-accent transition-opacity">Logs</NuxtLink>
    </div>
    <div class="text-xs md:text-sm uppercase tracking-widest font-medium">
      <NuxtLink to="/" class="hover:text-accent transition-opacity">Contact</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>
