---
title: Como fixen o meu blog con Nuxt Content
description: Empecei cun plan complexo de CMS e rematei cun fluxo moito mais simple e solido grazas a Nuxt Content.
date: "2026-03-19"
category: breakdown
topics: ["nuxt", "nuxt content", "vue", "markdown", "compoñentes"]
time_to_read: 8
published: true
lang: gl
translationKey: blog-with-nuxt-content
slug: como-fixen-blog-con-nuxt-content
---

## Iba complicalo demasiado

O plan inicial incluia CMS externo, webhooks e unha canalizacion de procesado. Era unha arquitectura coñecida, pero excesiva para un blog persoal.

Con Nuxt Content cambiei de rumbo: ficheiros markdown, frontmatter tipado, render directo e compoñentes integrados.

## O que marcou a diferenza

O schema en `content.config.ts` deume validacion forte en build. Se falta metadata ou hai un valor invalido, detectase antes de publicar.

Poder usar compoñentes Vue dentro do markdown foi a outra peza clave. Asi podo engadir bloques visuais e partes interactivas sen romper o fluxo de escritura.

## Por que mantiven este enfoque

- Menos pezas que manter que nunha solucion CMS + webhooks.
- Contido e codigo evolucionan xuntos.
- Mellor control tecnico a longo prazo.

Para este proxecto non foi so unha opcion mais simple. Foi a opcion correcta.
