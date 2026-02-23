<template>
  <button>
    <slot />
  </button>
</template>

<script setup lang="ts">
/**
 * █ [UI_ATOM] :: APP_BUTTON
 * =====================================================================
 * DESC:   Botón base de la aplicación con soporte para variantes.
 * STATUS: STABLE
 * =====================================================================
 */
defineProps<{ variant?: string }>();
defineEmits<{ click: [] }>();
</script>
