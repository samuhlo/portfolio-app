<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: MODAL PROJECT INFO
 * =====================================================================
 * DESC:   Bloque de información del proyecto: [INFO], [MAIN TECHS], [LINKS].
 *         Reutilizado en layouts mobile y desktop con variantes de tamaño.
 * =====================================================================
 */

interface Props {
  /** Controla el tamaño de tipografía */
  size?: 'sm' | 'lg';
  /** Dirección del flex para techs/links */
  layout?: 'row' | 'column';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  layout: 'row',
});

const textSize = computed(() => (props.size === 'sm' ? 'text-sm' : 'text-base'));
const bodySize = computed(() => (props.size === 'sm' ? 'text-sm' : 'text-sm'));
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- INFO -->
    <div class="font-mono space-y-4">
      <h3 :class="['font-bold uppercase tracking-wider mb-2', textSize]">[INFO]</h3>
      <p :class="['opacity-80 leading-relaxed max-w-sm', bodySize]">
        TinyShow es un motor de visualización de proyectos que se alimenta directamente de tus
        repositorios de GitHub. Escanea los README de tus repos, extrae la información relevante
        usando IA (DeepSeek), y genera fichas de proyecto con traducciones automáticas a inglés y
        español. Sin entrada manual de datos. Actualiza un README, el proyecto se actualiza solo.
      </p>
    </div>

    <!-- TECHS & LINKS -->
    <div
      :class="[
        'flex gap-8 font-mono uppercase',
        layout === 'column' ? 'flex-col sm:flex-row' : 'justify-between flex-wrap',
      ]"
    >
      <div>
        <h3 :class="['font-bold tracking-wider mb-2', textSize]">[MAIN TECHS]</h3>
        <ul :class="['space-y-1 opacity-80', bodySize]">
          <li>NUXTJS</li>
          <li>PINIA</li>
          <li>TAILWIND</li>
          <li>GSAP</li>
        </ul>
      </div>
      <div :class="layout === 'row' ? 'text-right' : ''">
        <h3 :class="['font-bold tracking-wider mb-2', textSize]">[LINKS]</h3>
        <ul :class="['space-y-2 opacity-80', bodySize]">
          <li>
            <DoodleHover><a href="#">LIVE DEMO</a></DoodleHover>
          </li>
          <li>
            <DoodleHover><a href="#">GITHUB</a></DoodleHover>
          </li>
          <li>
            <DoodleHover><a href="#">POST</a></DoodleHover>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
