# Animaciones Scroll

> GSAP + ScrollTrigger + Pinned Scroll. El núcleo del sistema de animaciones vinculadas al scroll.

---

## 1. useGSAP — El contrato de limpieza

### El problema

Vue monta y desmonta componentes. Si creas animaciones GSAP en `onMounted` sin limpar en `onUnmounted`, tienes **memory leaks**: ScrollTriggers fantasma, tweens zombie.

### La solución: gsap.context()

```typescript
export const useGSAP = () => {
  let ctx: gsap.Context | null = null;

  const initGSAP = (callback: (context: gsap.Context) => void) => {
    ctx = gsap.context(callback);
    return ctx;
  };

  onUnmounted(() => {
    ctx?.revert(); // Destruye TODO: tweens, timelines, ScrollTriggers
  });

  return { gsap, ScrollTrigger, initGSAP };
};
```

`gsap.context()` registra todo lo creado dentro. Un solo `ctx.revert()` lo limpia todo.

### Uso en componentes

```typescript
const { gsap, initGSAP } = useGSAP();

onMounted(() => {
  initGSAP(() => {
    gsap.to('.element', { opacity: 1 });
    ScrollTrigger.create({
      /* ... */
    });
  });
});
// No necesitas onUnmounted — useGSAP ya lo hace
```

### import.meta.client

```typescript
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger);
}
```

Nuxt renderiza en servidor. GSAP necesita DOM. `import.meta.client` asegura que solo se ejecute en el cliente.

---

## 2. ScrollTrigger — El director de escena

### Configuración básica

```typescript
ScrollTrigger.create({
  trigger: '.section',
  start: 'top top', // Cuando el trigger toca top del viewport
  end: '+=1000', // Scroll duration (px)
  pin: true, // Fija el elemento
  scrub: true, // Vincula progreso al scroll
});
```

### El problema del scrub bidireccional

Con `scrub: true`, el timeline avanza Y retrocede. El usuario scroll up y la animación se deshace.

### La solución: Flags unidireccionales

```typescript
const completed = phases.map(() => false);

onUpdate: (self) => {
  const phaseIndex = 0;
  if (completed[phaseIndex]) return; // Ya terminó → skip

  const phaseProgress =
    (self.progress - phases[phaseIndex].start) /
    (phases[phaseIndex].end - phases[phaseIndex].start);

  if (phaseProgress >= 1) completed[phaseIndex] = true; // Marcar completa
};
```

---

## 3. usePinnedScroll — Secciones fijas con fases

### La API

```typescript
const { createPinnedScroll } = usePinnedScroll();

createPinnedScroll({
  trigger: element,
  start: 'top top',
  end: '+=2500',
  phases: [
    { timeline: titleTl, start: 0, end: 0.6 }, // 0%–60%
    { timeline: subtitleTl, start: 0.6, end: 1 }, // 60%–100%
  ],
});
```

### El flujo

```
Scroll 0% ─────────────── Scroll 60% ─────────────── Scroll 100%
      │  Fase 1 (title)  │    Fase 2 (subtitle)   │
      │    (0→1)         │       (0→1)            │
```

### El pin-spacer

GSAP crea un `<div>` invisible (pin-spacer) que ocupa el espacio mientras el elemento está fijo. Sin él, todo el contenido saltaría hacia arriba.

```
ANTES:                    DURANTE (pin):
┌─────────────┐          ┌─────────────┐
│   Header    │          │   Header    │
├─────────────┤          ├─────────────┤
│   SECCIÓN   │   ──►    │ PIN-SPACER  │ ← 2500px
│             │          │             │
├─────────────┤          ├─────────────┤
│   Footer    │          │   Footer    │
└─────────────┘          └─────────────┘
                         ╔═════════════╗
                         ║   SECCIÓN   ║ ← fixed
                         ║  (pineada)  ║
                         ╚═════════════╝
```

---

## 4. El problema del salto al terminar el pin

### El problema

Al matar el trigger, el pin-spacer (2500px) desaparece. La página se acorta 2500px instantáneamente → salto brusco.

### La solución

```typescript
onLeave: (self) => {
  const pinSpacerHeight = self.end - self.start;
  const targetScroll = self.scroll() - pinSpacerHeight;
  self.kill();
  lenis?.scrollTo(targetScroll, { immediate: true });
  requestAnimationFrame(() => ScrollTrigger.refresh());
};
```

**No uses `window.scrollTo`** — Lenis intercepta y ignora. Usa `lenis.scrollTo()`.

---

## 5. Delayed Kill — El fix para móvil

### El problema en iOS Safari

Con scroll rápido (fling), si matas el trigger inmediatamente, hay conflicto entre el momentum del OS y la eliminación del spacer → salto de miles de pixels.

### La solución

```typescript
onLeave: (self) => {
  const pinSpacerHeight = self.end - self.start;
  const MAX_ATTEMPTS = 300; // ~5s a 60fps

  const killAndCompensate = () => {
    const targetScroll = self.scroll() - pinSpacerHeight;
    self.kill();
    lenis?.scrollTo(targetScroll, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  const attemptKill = () => {
    attempts++;
    const velocity = lenis?.velocity || 0;

    if (Math.abs(velocity) < 0.1) {
      killAndCompensate(); // Safe: inercia terminada
    } else if (attempts > MAX_ATTEMPTS) {
      killAndCompensate(); // Forzar: evitar pin-spacer huérfano
    } else {
      requestAnimationFrame(attemptKill); // Reintentar
    }
  };

  requestAnimationFrame(attemptKill);
};
```

---

## 6. Mobile vs Desktop

### La decisión

`pin: true` + `scrub: true` es un paradigma de escritorio. En móvil, el usuario espera scroll natural 1:1. Bloquear para reproducir animaciones genera fricción.

### La solución: Pivot móvil

| Desktop                 | Mobile                    |
| ----------------------- | ------------------------- |
| `pin: true`             | `pin: false`              |
| `scrub: true`           | `scrub: false`            |
| Scroll atado a timeline | Auto-play en intersection |

```typescript
const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`).matches;
```

La detección de móvil usa `BREAKPOINTS.mobile` desde `config/site.ts` (centralizado) en lugar de un `768` hardcoded.

```typescript
createPinnedScroll({
  trigger: element,
  start: 'top top',
  end: '+=2500',
  phases: [
    { timeline: titleTl, start: 0, end: 0.6 },
    { timeline: subtitleTl, start: 0.6, end: 1 },
  ],
});
```

---

## Siguiente lectura

- [01 - Arquitectura General](./01-arquitectura-general.md) — Visión global
- [03 - Composables](./03-composables.md) — useDoodleDraw, useCursorLabel, usePhysicsLetters
- [07 - Problemas Resueltos](./07-problemas-resueltos.md) — Las 16 lecciones
- [08 - Refactor Audit](./08-refactor-audit.md) — Changelog del refactor
