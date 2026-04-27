<script setup lang="ts">
/**
 * ========================================================================
 * [LAYOUT] :: BLOG POST
 * ========================================================================
 * DESC:   Layout para la página de detalle de un post.
 *         Sidebar izquierda con metadata + cuerpo derecha con contenido.
 * STATUS: STABLE
 * ========================================================================
 */
</script>

<template>
  <article class="blog-post-layout grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
    <aside class="hidden md:block md:col-span-3">
      <slot name="info" />
    </aside>

    <div class="md:col-span-9 md:pl-8">
      <slot name="body" />
    </div>
  </article>
</template>
