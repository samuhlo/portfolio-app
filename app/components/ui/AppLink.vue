<template>
  <NuxtLink :to="to">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string }>()
</script>
