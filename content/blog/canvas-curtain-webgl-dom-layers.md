---
title: "Canvas Curtain: Cómo mezclar WebGL y DOM sin que explote"
description: "Desglose técnico del sistema de capas que uso para combinar una escena 3D con TresJS y contenido HTML en mi portfolio. Rendering layers, scroll sync y performance."
date: "2026-03-06"
category: "breakdown"
topics: ["tresjs", "threejs", "webgl", "css", "arquitectura", "performance"]
time_to_read: 9
published: false
slug: "canvas-curtain-webgl-dom-layers"
---

# Canvas Curtain: Cómo mezclar WebGL y DOM sin que explote

Mezclar WebGL con contenido HTML es una de esas cosas que parece sencilla hasta que lo intentas. Quieres un fondo 3D con contenido scrolleable por encima, y de repente estás peleando con z-index, pointer events, sincronización de scroll, y preguntándote por qué tu GPU está al 100%.

Así es como lo resolví en mi portfolio.

## El concepto

Lo llamo "Canvas Curtain" porque el canvas actúa como una cortina de fondo que siempre está ahí. La idea es simple: tres capas apiladas con z-index.

**Layer 0 (Fondo):** El canvas WebGL. `position: fixed`, ocupa toda la pantalla, siempre detrás. Aquí vive la escena 3D con TresJS.

**Layer 1 (Contenido):** El DOM normal. `position: relative`, scrolleable. Texto, imágenes, cards, todo lo que el usuario lee e interactúa. Tiene zonas transparentes donde se "ve" el canvas de fondo.

**Layer 2 (Overlay):** UI fija como la navegación, el loader, y controles. `position: fixed`, siempre por encima de todo.

## La implementación

En Nuxt, esto se traduce al layout principal:

```vue
<template>
  <div class="app-shell">
    <!-- Layer 0: WebGL -->
    <div class="canvas-layer">
      <TresCanvas>
        <TheExperience />
      </TresCanvas>
    </div>

    <!-- Layer 1: DOM Content -->
    <main class="content-layer">
      <slot />
    </main>

    <!-- Layer 2: Fixed UI -->
    <TheNavigation />
    <TheLoader />
  </div>
</template>
```

El CSS crítico:

```css
.canvas-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.content-layer {
  position: relative;
  z-index: 1;
}
```

El `pointer-events: none` en el canvas es fundamental. Sin esto, el canvas captura todos los eventos de ratón y no puedes hacer click en nada del contenido. Si necesitas interactividad en el canvas (hover en objetos 3D, por ejemplo), la gestionas programáticamente desde el JavaScript, no desde los eventos del DOM.

## El problema del scroll

Aquí es donde se complica. El canvas es `position: fixed`, así que no scrollea. Pero quieres que la escena 3D reaccione al scroll del usuario. Necesitas sincronizar dos mundos.

Mi solución es un composable que centraliza el estado del scroll:

```typescript
// composables/useScrollSync.ts
export function useScrollSync() {
  const progress = ref(0)    // 0 a 1, progreso total
  const velocity = ref(0)    // velocidad actual del scroll
  const direction = ref(1)   // 1 = down, -1 = up
  const section = ref(0)     // sección actual (0, 1, 2...)

  return { progress, velocity, direction, section }
}
```

Lenis actualiza estos valores en cada frame de scroll. Los componentes de TresJS los leen como refs reactivos de Vue y actualizan la escena en consecuencia. El contenido DOM también puede usarlos para animaciones con GSAP.

La clave es que hay **una sola fuente de verdad** para el scroll. No hay dos sistemas compitiendo por interpretar la posición.

## Zonas transparentes

Para que el 3D se vea "a través" del contenido, uso backgrounds transparentes en las secciones que quiero que revelen la escena. Pero no es tan simple como `background: transparent`.

El problema es que el texto necesita contraste. Si el fondo 3D es oscuro y tu texto también, no se lee. Mi solución es una combinación de backdrop-filter y gradientes sutiles:

```css
.hero-section {
  background: transparent;
}

.content-section {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(var(--bg-rgb), 0.85) 15%,
    rgba(var(--bg-rgb), 0.95) 100%
  );
  backdrop-filter: blur(2px);
}
```

El gradiente crea una transición suave entre "ver el 3D" y "zona de lectura sólida". El blur sutil ayuda a que el texto sea legible incluso en la zona de transición.

## Performance: el elefante en la habitación

Correr una escena 3D permanentemente en el fondo es caro. Estos son los trucos que uso para mantener 60fps:

**Pausar cuando no es visible.** Si el usuario está scrolleado hasta abajo y el canvas no tiene nada que mostrar en esa zona, detengo el render loop:

```typescript
const { progress } = useScrollSync()

useRenderLoop().onLoop(() => {
  // Solo renderizar si estamos en una zona con contenido 3D
  if (progress.value > 0.8) return
  // ... render
})
```

**LOD (Level of Detail) basado en scroll.** Cuando el usuario está leyendo contenido (scroll medio), reduzco la complejidad de la escena. Menos partículas, geometrías más simples, sin post-procesado.

**Pixel ratio adaptativo.** En móvil, uso `Math.min(window.devicePixelRatio, 1.5)` en lugar del DPR real. En un iPhone 15 eso significa renderizar a 1.5x en lugar de 3x. La diferencia visual es mínima, la diferencia en rendimiento es enorme.

**requestAnimationFrame condicional.** Si la pestaña no está visible (`document.hidden`), detengo completamente el render. Esto evita que la GPU trabaje cuando el usuario está en otra pestaña.

## El gotcha de las page transitions

En Nuxt, cuando navegas entre páginas, el componente se desmonta y se monta uno nuevo. Pero el canvas está en el layout, así que persiste. Esto es genial (no re-renderizas toda la escena 3D en cada navegación), pero crea un problema: ¿cómo transicionas la escena 3D cuando cambias de página?

Mi solución es usar un estado global en Pinia que indica la "fase" de transición:

```typescript
// stores/transition.ts
export const useTransitionStore = defineStore('transition', () => {
  const phase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const targetRoute = ref('')

  return { phase, targetRoute }
})
```

La escena 3D escucha este estado y ajusta la cámara, la iluminación, o lo que sea necesario durante la transición. El contenido DOM hace su propia animación de salida/entrada con GSAP. Ambos están sincronizados a través de Pinia.

## ¿Merece la pena?

Sinceramente, este sistema añade una complejidad considerable al proyecto. Si tu portfolio no necesita 3D, no hagas esto. Un portfolio con buena tipografía, animaciones sutiles de GSAP, y contenido sólido va a impresionar más que un WebGL mal implementado.

Pero si tu objetivo es demostrar que puedes trabajar en la intersección entre ingeniería y creatividad, y que puedes manejar la complejidad técnica que eso implica, entonces sí. Merece cada hora invertida.
