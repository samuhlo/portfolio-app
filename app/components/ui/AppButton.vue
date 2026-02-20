<template>
  <button>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ variant?: string }>()
defineEmits<{ click: [] }>()
</script>
