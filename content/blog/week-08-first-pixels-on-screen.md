---
title: "Week 08: First Pixels on Screen"
description: "La primera semana de desarrollo real del portfolio. Lenis, GSAP, TresJS y muchas horas peleando con z-index. Primeras impresiones del stack creativo."
date: "2026-02-21"
category: "weekly_log"
topics: ["nuxt", "tresjs", "gsap", "lenis", "webgl"]
time_to_read: 7
published: false
slug: "week-08-first-pixels-on-screen"
---

# Week 08: First Pixels on Screen

Primera semana de desarrollo real. Se acabó la planificación. Se acabó el setup. Toca manchar las manos de píxeles.

## Lo que hice

El objetivo era claro: tener la arquitectura "Canvas Curtain" funcionando. Es decir, un canvas de WebGL fijo en el fondo (Layer 0), contenido HTML scrolleable por encima (Layer 1), y UI fija como la nav flotando sobre todo (Layer 2).

Suena simple. No lo fue.

El primer día fue puro scaffolding. Nuxt 3 con TypeScript en strict mode, TresJS instalado, Lenis para smooth scroll, GSAP con ScrollTrigger, Pinia para el estado global. Todo en su sitio, todo compilando, cero funcionalidad real.

El segundo día empecé a entender por qué la gente dice que mezclar WebGL con DOM es un dolor. El canvas de Three.js quiere controlar el scroll a su manera. Lenis quiere controlar el scroll a su manera. Y ScrollTrigger de GSAP quiere que le digas exactamente cuánto se ha scrolleado para triggear animaciones. Poner a los tres de acuerdo fue el verdadero reto.

## Lo técnico

La solución que encontré fue crear un composable `useScrollSync` que actúa como "fuente de verdad" del scroll. Lenis captura el evento, normaliza el valor, y lo expone como un ref reactivo de Vue. Tanto TresJS como GSAP leen de ese ref en lugar de escuchar sus propios eventos de scroll.

```typescript
// composables/useScrollSync.ts
const scrollProgress = ref(0)
const scrollVelocity = ref(0)

lenis.on('scroll', ({ progress, velocity }) => {
  scrollProgress.value = progress
  scrollVelocity.value = velocity
})
```

Parece trivial, pero hasta llegar a esta solución probé tres enfoques diferentes. El primero (dejar que cada librería escuchara el scroll nativo) causaba jankiness horrible. El segundo (usar solo Lenis y pasar callbacks) era un infierno de callbacks anidados. El tercero, el actual, es limpio y reactivo.

El otro descubrimiento de la semana fue que `pointer-events: none` en el canvas es fundamental. Sin eso, el canvas captura todos los clicks y no puedes interactuar con nada del DOM que está "por encima". Parece obvio en retrospectiva, pero me costó una hora de debugging descubrir por qué mis botones no funcionaban.

## Lo que aprendí

Que la documentación de TresJS es sorprendentemente buena para ser una librería relativamente joven. Alvaro Saburido (el creador) tiene una forma de explicar conceptos 3D que hace que todo parezca accesible. Le debo un café.

También aprendí que Lenis y GSAP ScrollTrigger no son amigos naturales. Hay que presentarlos formalmente con `ScrollTrigger.scrollerProxy()`. Si estás en este mismo setup, busca eso primero. Te vas a ahorrar horas.

## Lo que consumí

Vi un talk de Ilithya en CSS Day sobre creative coding y generative art en la web. Me inspiró para pensar en el fondo 3D del portfolio no como decoración, sino como una pieza generativa que cambia sutilmente con el tiempo.

También estuve leyendo el código fuente de algunos portfolios de Awwwards para entender cómo gestionan la relación WebGL-DOM. La mayoría usan un approach similar al mío, lo cual me tranquiliza.

## Para la próxima semana

Empezar con los componentes atómicos de UI. Tengo el diseño en Figma, los tokens definidos, y la estructura funcionando. Es momento de maquetar botones, cards, la nav, y empezar a que esto parezca un portfolio de verdad y no una demo técnica.

## Reflexión

Hay algo muy satisfactorio en ver un cubo 3D rotando detrás de tu HTML. Es completamente innecesario para el 99% de los portfolios, pero esa pequeña chispa de "esto es diferente" es lo que hace que merezca la pena el esfuerzo extra. La pregunta que me hago constantemente: ¿estoy añadiendo complejidad por ego o por experiencia de usuario? Intento que la respuesta sea siempre la segunda.
