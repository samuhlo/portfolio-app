---
title: Como animei o portfolio con GSAP, Lenis e Matter.js
description: Aqui resumo o que funcionou, o que rompeu e que decisions tomei para xuntar animacions avanzadas nun proxecto Nuxt SSR.
date: "2026-03-14"
category: breakdown
topics: ["GSAP", "Lenis", "Matter.js", "Vue", "Nuxt", "animacion", "rendemento"]
time_to_read: 11
published: true
lang: gl
translationKey: animated-portfolio
slug: animando-portfolio-con-gsap-lenis-matterjs
---

## Queria que o portfolio tivese movemento real

Non buscaba unha web bonita sen mais. Queria movemento con intencion: scroll suave, un hero con peso visual e detalles tipograficos que non parecesen decoracion gratuita.

O reto non era facer unha animacion illada. O reto era combinar GSAP, Lenis e Matter.js en SSR sen desincronizacion, sen flicker e sen listeners vivos despois de navegar.

## Todo mellorou cando compartiron reloxo

O cambio clave foi usar un unico reloxo de animacion. Se Lenis e ScrollTrigger van por separado, aparece deriva. Cando Lenis pasa polo ticker de GSAP, o comportamento faise consistente.

Tamén foi importante limpar timelines e triggers ao desmontar compoñentes. Nun fluxo SPA isto non e opcional.

## O que repetiria

- Composables especificos para orquestrar animacions.
- Setup dependente de DOM so en cliente e no momento correcto.
- Limpeza como parte do deseño tecnico, non como parche final.

Con ese enfoque puiden manter personalidade visual sen perder estabilidade.
