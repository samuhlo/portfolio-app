<template>
  <section
    class="min-h-[80vh] bg-foreground text-background pt-24 flex flex-col justify-end w-full overflow-hidden"
  >
    <!-- Links -->
    <div
      class="grid grid-cols-3 px-6 md:px-12 mb-12 w-full text-[1rem] md:text-[1.75rem] font-bold tracking-widest items-center"
    >
      <div class="text-left">
        <a href="mailto:hola@samuhlo.dev" class="hover:text-accent transition-colors"
          >hola@samuhlo.dev</a
        >
      </div>
      <div class="text-center">
        <a href="#" class="hover:text-accent transition-colors">github</a>
      </div>
      <div class="text-right">
        <a href="#" class="hover:text-accent transition-colors">linkedin</a>
      </div>
    </div>

    <!-- Giant text -->
    <div class="w-full flex justify-center items-end leading-none translate-y-[15%]">
      <h2
        class="text-[22vw] font-black uppercase leading-[0.75] tracking-tighter m-0 p-0 text-center w-full"
      >
        Contact
      </h2>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
