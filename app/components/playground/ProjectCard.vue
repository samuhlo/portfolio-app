<template>
  <div>
    <!-- Project Card -->
  </div>
</template>

<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: PROJECT CARD
 * =====================================================================
 * DESC:   Tarjeta de visualización individual de un proyecto en el grid.
 * STATUS: STABLE
 * =====================================================================
 */
import type { Project } from '~/types/project';
defineProps<{ project: Project }>();
</script>
