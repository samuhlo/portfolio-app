<script setup lang="ts">
/**
 * █ [UI] :: PROJECT CARD
 * =====================================================================
 * DESC:   Tarjeta reutilizable para proyectos del Playground.
 *         Imagen principal + avatar SVG con hover + subtítulo.
 *         El avatar se pasa como prop (componente dinámico).
 *         Label flotante gestionado por useCursorLabel().
 * STATUS: STABLE
 * =====================================================================
 */

import type { Component } from 'vue';

interface Props {
  name: string;
  image: string;
  avatar?: Component;
  hoverLabel?: string;
  color?: string;
  minWidth?: string;
  maxWidth?: string;
  avatarSize?: string;
  avatarStroke?: string;
  gridClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hoverLabel: 'View Project',
  color: '#000',
  minWidth: '380px',
  maxWidth: '1100px',
  avatarSize: '12%',
  avatarStroke: '12px',
  gridClass: '',
});

// [NOTE] Inyectados en CSS via v-bind
const cardMinWidth = computed(() => props.minWidth);
const cardMaxWidth = computed(() => props.maxWidth);
const cardAvatarSize = computed(() => props.avatarSize);
const cardAvatarStroke = computed(() => props.avatarStroke);
const cardColor = computed(() => props.color);

// --- CURSOR LABEL (composable) ---
const { containerRef, labelRef, isHovering, onMouseMove, onMouseEnter, onMouseLeave } =
  useCursorLabel({ lerp: 0.12, offsetX: 16, offsetY: 12 });

// --- MAGNETIC HOVER (composable) ---
const { magneticRef, onMagneticMove, onMagneticLeave } = useMagneticHover({
  strength: 0.12,
  returnEase: 'elastic.out(1, 0.6)',
});

// [NOTE] Combinar handlers de ambos composables en un solo evento
function handleMouseMove(event: MouseEvent) {
  onMouseMove(event);
  onMagneticMove(event);
}

function handleMouseEnter(event: MouseEvent) {
  onMouseEnter(event);
}

function handleMouseLeave() {
  onMouseLeave();
  onMagneticLeave();
}

const router = useRouter();
function openProject() {
  router.push({ query: { project: props.name.toLowerCase() } });
}
</script>

<template>
  <div ref="magneticRef" :class="['flex flex-col gap-4 project-card group', gridClass]">
    <!-- Contenedor de la Imagen con overlay SVG + cursor label -->
    <div
      ref="containerRef"
      class="relative overflow-visible cursor-pointer"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
      @click="openProject"
    >
      <NuxtImg :src="image" :alt="name" class="w-full h-auto block" />

      <!-- Avatar SVG: visible al hacer hover -->
      <div v-if="avatar" class="project-avatar">
        <component :is="avatar" />
      </div>

      <!-- Label flotante que sigue al cursor con retraso -->
      <div ref="labelRef" class="cursor-label" :class="{ 'is-visible': isHovering }">
        {{ hoverLabel }}
      </div>
    </div>

    <!-- Subtítulo Inferior -->
    <div
      class="flex justify-between items-start mt-2 font-mono text-[clamp(11px,1.2vw,16px)] uppercase font-bold text-foreground"
    >
      <span>{{ name }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Límites escalables del contenedor */
.project-card {
  min-width: v-bind(cardMinWidth);
  max-width: v-bind(cardMaxWidth);
  width: 100%;
}

/* Avatar SVG: posición y tamaño reactivos */
.project-avatar {
  position: absolute;
  top: -4.5%;
  right: 0.25%;
  width: v-bind(cardAvatarSize);
  height: auto;
  opacity: 0;
  transform: scale(0.85) translateY(4px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  pointer-events: none;
  color: v-bind(cardColor);
}

/* Visibilidad al hacer hover */
.group:hover .project-avatar {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Stroke de fondo para que el SVG "corte" sobre cualquier fondo */
.project-avatar :deep(svg path) {
  stroke: var(--color-background);
  stroke-width: v-bind(cardAvatarStroke);
  paint-order: stroke fill; /* [NOTE] El stroke se pinta DETRÁS del fill */
}

/* --- CURSOR-FOLLOWING LABEL --- */
.cursor-label {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
  padding: 6px 14px;
  font-family: theme('fontFamily.mono');
  font-size: clamp(10px, 1vw, 14px);
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  background-color: v-bind(cardColor);
  color: var(--color-background);
  opacity: 0;
  will-change: transform;
  transition: opacity 0.25s ease;
}

.cursor-label.is-visible {
  opacity: 1;
}

/* [NOTE] En móvil no hay hover, así que el avatar siempre está visible */
@media (hover: none) {
  .project-avatar {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .cursor-label {
    display: none;
  }
}
</style>
