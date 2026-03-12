---
title: "ScrollTrigger Patterns que uso en cada proyecto"
description: "Una colección de patrones de GSAP ScrollTrigger que he ido refinando proyecto a proyecto. Desde reveals básicos hasta sincronización con WebGL."
date: "2026-02-25"
category: "find"
topics: ["gsap", "scrolltrigger", "animacion", "javascript", "performance"]
time_to_read: 9
published: false
slug: "scrolltrigger-patterns-que-uso-en-cada-proyecto"
---

# ScrollTrigger Patterns que uso en cada proyecto

Llevo usando GSAP ScrollTrigger desde que salió, y con el tiempo he ido destilando un conjunto de patrones que reutilizo en prácticamente todo lo que construyo. No son nada revolucionario, pero están probados en producción y resuelven el 90% de lo que necesito.

## El setup base

Antes de cualquier animación, siempre configuro ScrollTrigger de la misma forma. Si usas Lenis (o cualquier smooth scroll), necesitas registrar el scroller proxy:

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Si usas Lenis
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)
```

Ese `lagSmoothing(0)` es clave. Sin él, GSAP intenta compensar frames perdidos y las animaciones dan saltos cuando el usuario scrollea rápido. Mejor dejar que el frame se pierda limpiamente.

## Pattern 1: Reveal on scroll

El más básico y el que más uso. Elementos que aparecen cuando entran en el viewport.

```typescript
const revealElements = document.querySelectorAll('[data-reveal]')

revealElements.forEach((el) => {
  gsap.from(el, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  })
})
```

El truco está en el `start: 'top 85%'`. No esperes a que el elemento esté completamente visible. Triggearlo cuando el top del elemento alcanza el 85% del viewport se siente mucho más natural. El usuario ya está mirando en esa dirección.

También uso `toggleActions: 'play none none none'` para que la animación solo se ejecute una vez. No me gusta que las cosas se re-animen al scrollear hacia arriba. Una vez es suficiente.

## Pattern 2: Staggered reveal

Cuando tienes un grupo de elementos (cards, items de una lista), el stagger le da ritmo.

```typescript
const cards = document.querySelectorAll('.project-card')

gsap.from(cards, {
  y: 60,
  opacity: 0,
  duration: 0.6,
  stagger: 0.12,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: cards[0].parentElement,
    start: 'top 75%',
  },
})
```

El valor del stagger es importante. Demasiado bajo (0.05) y parece que aparecen todos a la vez. Demasiado alto (0.3) y la animación se arrastra. Para 4-6 elementos, 0.1-0.15 suele ser el sweet spot.

## Pattern 3: Parallax sutil

El parallax tiene mala fama, y con razón: la mayoría de implementaciones son excesivas. Pero un parallax sutil (10-30px) en imágenes o fondos añade profundidad sin marear.

```typescript
const parallaxImages = document.querySelectorAll('[data-parallax]')

parallaxImages.forEach((img) => {
  const speed = img.dataset.parallax || '20'

  gsap.to(img, {
    y: -parseInt(speed),
    ease: 'none',
    scrollTrigger: {
      trigger: img,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  })
})
```

El `scrub: 1` crea un efecto smooth donde la animación sigue al scroll con un ligero delay de 1 segundo. Sin scrub, sería instantáneo y brusco. Con `scrub: true` (sin número), sería completamente sincronizado, lo cual funciona pero se siente menos orgánico.

## Pattern 4: Text split reveal

Mi favorito. Texto que aparece palabra por palabra o línea por línea. Necesitas SplitText de GSAP (plugin de Club GreenSock) o una alternativa.

```typescript
const headings = document.querySelectorAll('[data-split]')

headings.forEach((heading) => {
  // Asumiendo SplitText disponible
  const split = new SplitText(heading, { type: 'lines, words' })

  gsap.from(split.words, {
    y: '100%',
    opacity: 0,
    duration: 0.5,
    stagger: 0.03,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: heading,
      start: 'top 80%',
    },
  })
})
```

El `y: '100%'` en lugar de un valor en píxeles hace que cada palabra suba desde debajo de su propia línea. Combinado con un `overflow: hidden` en el contenedor de cada línea, crea ese efecto de "revelar desde abajo" que ves en muchos sites premium.

## Pattern 5: Pinning con progreso

Para secciones que se "pegan" mientras el usuario scrollea y el contenido cambia dentro de ellas.

```typescript
const section = document.querySelector('.pinned-section')
const steps = section.querySelectorAll('.step')

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: `+=${steps.length * 100}%`,
    pin: true,
    scrub: 1,
  },
})

steps.forEach((step, i) => {
  if (i > 0) {
    tl.fromTo(step,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 },
      i
    )
  }
  if (i < steps.length - 1) {
    tl.to(step,
      { opacity: 0, y: -30, duration: 1 },
      i + 0.7
    )
  }
})
```

El end de `+=${steps.length * 100}%` le dice a ScrollTrigger cuánto espacio de scroll dedicar a esta sección pinneada. Más largo = scroll más lento por cada paso.

## Errores comunes que he cometido

No hacer `ScrollTrigger.refresh()` después de cargar contenido dinámico. Si tus elementos cambian de tamaño o posición después del render inicial, ScrollTrigger no se entera. Llámalo explícitamente.

Animar `height` o `width` en lugar de `scaleY` o `scaleX`. Las primeras triggerean layout recalculations. Las segundas son GPU-friendly y no causan jank.

Olvidar limpiar. En frameworks con componentes reactivos como Vue o React, necesitas matar los ScrollTriggers en el unmount. En Vue:

```typescript
onUnmounted(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})
```

## Performance

Una regla que sigo siempre: nunca más de 15-20 ScrollTriggers activos simultáneamente en una página. Si necesitas más, algo en tu diseño necesita simplificarse. Cada ScrollTrigger es un listener que evalúa en cada frame de scroll.

Para debug, `ScrollTrigger.defaults({ markers: true })` es tu mejor amigo durante desarrollo. Muestra visualmente dónde empieza y termina cada trigger. Solo recuerda quitarlo antes de producción.
