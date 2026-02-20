<template>
  <nav
    class="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:px-12 w-full"
  >
    <div class="flex gap-8 text-xs md:text-sm uppercase tracking-widest font-medium">
      <NuxtLink to="/" class="hover:opacity-70 transition-opacity">Home</NuxtLink>
      <NuxtLink to="/blog" class="hover:opacity-70 transition-opacity">Blog</NuxtLink>
    </div>
    <div class="text-xs md:text-sm uppercase tracking-widest font-medium">
      <NuxtLink to="/contact" class="hover:opacity-70 transition-opacity">Contact</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>
