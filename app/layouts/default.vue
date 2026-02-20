<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <main>
      <AppNav />
      <slot />
      <AppFooter />
    </main>
  </div>
</template>

<script setup lang="ts"></script>
