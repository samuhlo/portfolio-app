<script setup lang="ts">
/**
 * █ [LAYOUT] :: PLAYGROUND SECTION
 * =====================================================================
 * DESC:   Grilla de proyectos experimentales y estáticos.
 *         El título se gestiona en PlaygroundTitle.vue.
 *         Cada proyecto usa <ProjectCard> con avatar como prop.
 * STATUS: STABLE
 * =====================================================================
 */

// [NOTE] Lazy import para inyectar el avatar como Component tipado
const TinyshowDetail = defineAsyncComponent(
  () => import('~/components/ui/projects/TinyshowDetail.vue'),
);

const { parallaxRef: card1Parallax } = useParallax({ speed: 10 });
</script>

<template>
  <section
    class="min-h-screen flex flex-col justify-center px-6 md:px-12 w-full mx-auto py-32 xl:py-48"
  >
    <PlaygroundTitle />

    <!-- Contenedor Grid Asimétrico (Fluido, sin max-width) -->
    <div
      class="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-y-32 gap-x-4 md:gap-x-8 w-full overflow-x-clip"
    >
      <!-- Proyecto Tinyshow -->
      <div ref="card1Parallax" class="md:col-start-5 md:col-span-8">
        <ProjectCard
          name="Tinyshow"
          image="/images/projects/tinyshow_main.webp"
          color="#F25546"
          :avatar="TinyshowDetail"
          hover-label="Automated Showcase"
        />
      </div>
    </div>

    <!-- Project Modal Overlay -->
    <ProjectModal />
  </section>
</template>
