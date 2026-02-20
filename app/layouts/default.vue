<template>
  <div class="flex flex-col min-h-screen font-sans">
    <AppNav />
    <main class="grow w-full">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts"></script>
