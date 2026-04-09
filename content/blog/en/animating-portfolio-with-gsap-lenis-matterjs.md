---
title: How I Animated My Portfolio with GSAP, Lenis, and Matter.js
description: I documented what worked, what broke, and what I changed to make advanced animation libraries coexist in a Nuxt SSR setup.
date: "2026-03-14"
category: breakdown
topics: ["GSAP", "Lenis", "Matter.js", "Vue", "Nuxt", "animation", "performance"]
time_to_read: 11
published: true
lang: en
translationKey: animated-portfolio
slug: animating-portfolio-with-gsap-lenis-matterjs
---

## I wanted the portfolio to feel alive

I wanted more than a visually nice page. I wanted intentional movement: smooth scroll, weight in the hero, and a few moments where typography behaved like real objects.

The tricky part was not creating a single animation. The tricky part was running GSAP, Lenis, and Matter.js together in SSR without leaking listeners or creating timing glitches on navigation.

## The stack only worked once I unified timing

The biggest win was using one animation clock. Lenis and ScrollTrigger can drift if each one manages its own loop. Wiring Lenis to GSAP's ticker solved most of the desync and made scroll-triggered transitions feel consistent.

I also cleaned up every timeline and trigger on unmount. In a Nuxt SPA flow, that cleanup is non-negotiable.

## What I would repeat

- Keep animation orchestration in dedicated composables.
- Use SSR-safe guards and delay DOM-dependent setup until mount.
- Treat cleanup as part of the implementation, not as a later optimization.

This setup gave me the freedom to keep personality in the interface without sacrificing maintainability.
