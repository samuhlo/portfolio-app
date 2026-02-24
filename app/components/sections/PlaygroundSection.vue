<script setup lang="ts">
/**
 * █ [LAYOUT] :: PLAYGROUND SECTION
 * =====================================================================
 * DESC:   Grilla de proyectos experimentales y estáticos.
 *         El título se gestiona en PlaygroundTitle.vue.
 * STATUS: STABLE
 * =====================================================================
 */
</script>

<template>
  <section
    class="min-h-screen flex flex-col justify-center px-6 md:px-12 w-full mx-auto py-32 xl:py-48"
  >
    <PlaygroundTitle />

    <!-- Contenedor Grid Asimétrico (Fluido, sin max-width) -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-y-32 gap-x-4 md:gap-x-8 w-full">
      <!-- Proyecto Tinyshow (Escalado masivo a la derecha, abarca 8 columnas) -->
      <div class="md:col-start-5 md:col-span-8 flex flex-col gap-4">
        <!-- Contenedor de la Imagen/Caja -->
        <div
          class="w-full aspect-4/3 md:aspect-video bg-accent flex items-center justify-center relative group overflow-hidden"
        >
          <div
            class="absolute inset-0 flex flex-col items-center justify-center text-center transition-transform duration-700 group-hover:scale-105"
          >
            <span
              class="text-[clamp(2.5rem,4.5vw,7rem)] font-bold uppercase leading-[1.05] tracking-tight text-[#0F0A0A]"
            >
              Astro<br />Javascript<br />Next.js<br />Node.js<br />React
            </span>
          </div>
          <!-- Etiqueta Flotante Interior -->
          <div
            class="absolute top-[5%] left-[5%] flex gap-4 text-[clamp(10px,1vw,16px)] font-black tracking-widest text-[#0F0A0A]"
          >
            <span>TINYSHOW</span>
          </div>
        </div>

        <!-- Subtítulo Inferior -->
        <div
          class="flex justify-between items-start mt-2 font-mono text-[clamp(11px,1.2vw,16px)] uppercase font-bold text-foreground"
        >
          <span>Tinyshow</span>
        </div>
      </div>
    </div>
  </section>
</template>
