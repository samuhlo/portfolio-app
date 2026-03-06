<script setup lang="ts">
/**
 * █ [LAYOUT] :: PLAYGROUND SECTION
 * =====================================================================
 * DESC:   Grilla de proyectos del portfolio.
 *         Usa el store de Pinia para obtener proyectos.
 *         ProjectModal se incluye para detalles de proyectos.
 * USAGE:  <PlaygroundSection /> → ProjectCard → ProjectModal
 * STATUS: STABLE
 * =====================================================================
 */

import { storeToRefs } from 'pinia';
import type { Project } from '../../../types/project';

const projectsStore = useProjectsStore();
const { projects, isLoading: loading, error } = storeToRefs(projectsStore);

const TinyshowDetail = defineAsyncComponent(
  () => import('~/components/ui/projects/TinyshowDetail.vue'),
);

onMounted(async () => {
  if (projects.value.length === 0) {
    await projectsStore.fetchProjects({ limit: 20 });
  }
});

function getProjectColor(project: Project): string {
  return project.projectColor || '#F25546';
}

function getProjectImage(project: Project): string {
  return project.mainImgUrl || '/images/projects/tinyshow_main.webp';
}

function getProjectTitle(project: Project): string {
  return project.title || project.id;
}

function getProjectSlug(project: Project): string {
  return project.id;
}

function getHoverLabel(project: Project): string {
  return project.hoverTextCard || 'View Project';
}
</script>

<template>
  <section
    class="min-h-screen flex flex-col justify-center px-6 md:px-12 w-full mx-auto py-32 xl:py-48"
  >
    <PlaygroundTitle />

    <!-- Loading State -->
    <div v-if="loading" class="py-20">
      <p class="font-mono text-sm text-foreground/60">Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-20">
      <p class="font-mono text-sm text-red-500">Error loading projects: {{ error }}</p>
    </div>

    <!-- Projects Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-y-32 gap-x-4 md:gap-x-8 w-full overflow-x-clip"
    >
      <div
        v-for="(project, index) in projects"
        :key="project.id"
        :class="index === 0 ? 'md:col-start-4 md:col-span-7' : ''"
      >
        <ProjectCard
          :name="getProjectTitle(project)"
          :image="getProjectImage(project)"
          :color="getProjectColor(project)"
          :avatar="index === 0 ? TinyshowDetail : undefined"
          :hover-label="getHoverLabel(project)"
          :slug="getProjectSlug(project)"
        />
      </div>
    </div>

    <!-- Project Modal Overlay -->
    <ProjectModal />
  </section>
</template>
