/**
 * █ [STORE] :: PROJECTS STORE
 * =====================================================================
 * DESC:   Estado global para proyectos del portfolio.
 *         Gestiona fetching, cacheo y proyecto seleccionado.
 *         Compatible con SSR (Nuxt).
 * USAGE:  const store = useProjectsStore()
 * STATUS: STABLE
 * =====================================================================
 */

import { defineStore } from 'pinia';
import type { Project } from '../../types/project';

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    projects: [],
    selectedProject: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    hasProjects: (state) => state.projects.length > 0,
    projectCount: (state) => state.projects.length,
    getProjectById:
      (state) =>
      (id: string): Project | undefined => {
        return state.projects.find((p: Project) => p.id === id);
      },
  },

  actions: {
    async fetchProjects(options: { primaryTech?: string; limit?: number } = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        const queryParams = new URLSearchParams();
        if (options.primaryTech) queryParams.set('primary_tech', options.primaryTech);
        if (options.limit) queryParams.set('limit', options.limit.toString());

        const query = queryParams.toString();
        const url = `/api/projects${query ? `?${query}` : ''}`;

        const response = await $fetch<{ data: Project[] }>(url);
        this.projects = response.data;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch projects';
        console.error('[ProjectsStore] Error fetching projects:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProjectBySlug(slug: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await $fetch<{ data: Project }>(`/api/projects/${slug}`);
        this.selectedProject = response.data;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch project';
        console.error('[ProjectsStore] Error fetching project:', err);
        this.selectedProject = null;
      } finally {
        this.isLoading = false;
      }
    },

    setSelectedProject(project: Project | null) {
      this.selectedProject = project;
    },

    clearSelectedProject() {
      this.selectedProject = null;
    },

    clearError() {
      this.error = null;
    },
  },
});
