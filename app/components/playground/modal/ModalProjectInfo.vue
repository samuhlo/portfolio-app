<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: MODAL PROJECT INFO
 * =====================================================================
 * DESC:   Bloque de información del proyecto: [INFO], [MAIN TECHS], [LINKS].
 *         Usa el store de Pinia para obtener datos del proyecto seleccionado.
 *         Reutilizado en layouts mobile y desktop con variantes de tamaño.
 * USAGE:  <ModalProjectInfo size="lg" layout="row" />
 * STATUS: STABLE
 * =====================================================================
 */

import { storeToRefs } from 'pinia';

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
const bodySize = computed(() => (props.size === 'sm' ? 'text-sm' : 'text-base'));

const projectsStore = useProjectsStore();
const { selectedProject } = storeToRefs(projectsStore);

const description = computed(() => {
  if (!selectedProject.value?.description) return '';
  return selectedProject.value.description.en || selectedProject.value.description.es || '';
});

const techStack = computed(() => (selectedProject.value?.techStack || []).slice(0, 6));

const liveUrl = computed(() => selectedProject.value?.liveUrl);
const repoUrl = computed(() => selectedProject.value?.repoUrl);
const postUrl = computed(() => selectedProject.value?.postUrl);
const blogUrl = computed(() => selectedProject.value?.blogUrl);

const hasLinks = computed(() => liveUrl.value || repoUrl.value || postUrl.value || blogUrl.value);
</script>

<template>
  <div class="flex flex-col h-full gap-20">
    <!-- INFO -->
    <div class="font-mono space-y-4">
      <h3 :class="['font-bold uppercase tracking-wider mb-2', textSize]">[INFO]</h3>
      <p v-if="description" :class="['opacity-85 leading-relaxed max-w-xl', bodySize]">
        {{ description }}
      </p>
      <p v-else :class="['opacity-50 italic', bodySize]">No description available</p>
    </div>

    <!-- TECHS & LINKS -->
    <div
      :class="[
        'flex font-mono uppercase',
        layout === 'column' ? 'flex-col sm:flex-row gap-10' : 'justify-between flex-wrap gap-8',
      ]"
    >
      <!-- Tech Stack -->
      <div v-if="techStack.length > 0">
        <h3 :class="['font-bold tracking-wider mb-2', textSize]">[MAIN TECHS]</h3>
        <ul :class="['space-y-1 opacity-80', bodySize]">
          <li v-for="tech in techStack" :key="tech">{{ tech }}</li>
        </ul>
      </div>

      <!-- Links -->
      <div v-if="hasLinks" :class="layout === 'row' ? 'text-right' : ''">
        <h3 :class="['font-bold tracking-wider mb-2', textSize]">[LINKS]</h3>
        <ul :class="['space-y-2 opacity-80', bodySize]">
          <li v-if="liveUrl">
            <RandomDoodleHover>
              <NuxtLink :to="liveUrl" target="_blank">LIVE DEMO</NuxtLink>
            </RandomDoodleHover>
          </li>
          <li v-if="repoUrl">
            <RandomDoodleHover>
              <NuxtLink :to="repoUrl" target="_blank">GITHUB</NuxtLink>
            </RandomDoodleHover>
          </li>
          <li v-if="postUrl">
            <RandomDoodleHover>
              <NuxtLink :to="postUrl" target="_blank">POST</NuxtLink>
            </RandomDoodleHover>
          </li>
          <li v-if="blogUrl">
            <RandomDoodleHover>
              <NuxtLink :to="blogUrl" target="_blank">BLOG</NuxtLink>
            </RandomDoodleHover>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
