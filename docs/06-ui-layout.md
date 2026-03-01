# UI & Layout

> Componentes de navegación, footer, efectos globales (noise), y overlays (loader, console).

---

## Índice

| #   | Componente            | Tipo    | Descripción                              |
| --- | --------------------- | ------- | ---------------------------------------- |
| 1   | `AppNav.vue`          | LAYOUT  | Navegación fixed con hide/show al scroll |
| 2   | `AppFooter.vue`       | LAYOUT  | Footer con links y copyright             |
| 3   | `NoiseBackground.vue` | UI_ATOM | Grano de celuloide (TV static)           |
| 4   | `PageLoader.vue`      | UI_ATOM | Overlay anti-FOUC                        |
| 5   | `ConsoleMessage.vue`  | UI_ATOM | Mensaje debug/console                    |
| 6   | `default.vue`         | LAYOUT  | Layout base con noise + nav + footer     |

---

## 1. AppNav — Hide/show al scroll

### Comportamiento

- **Scroll down**: nav se oculta (y: -100%)
- **Scroll up**: nav reaparece

### Mecánica

```typescript
const showAnim = gsap
  .from(navRef, {
    yPercent: -100,
    paused: true,
  })
  .progress(1);

ScrollTrigger.create({
  start: 'top top',
  end: 'max',
  onUpdate: (self) => {
    if (self.direction === -1) {
      showAnim.play(); // Scroll up → show
    } else {
      showAnim.reverse(); // Scroll down → hide
    }
  },
});
```

`direction === -1` = scroll hacia arriba.

---

## 2. AppFooter — Links + copyright

Simple footer con links a redes sociales y copyright.

---

## 3. NoiseBackground — TV Grain

### Props

```typescript
interface Props {
  opacity?: number; // Default: 0.15
  baseFrequency?: number; // Default: 0.65 (grano fino)
  blendMode?: string; // Default: 'screen'
  speed?: number; // Default: 0.4 (segundos por ciclo)
}
```

### Implementación

SVG turbulence + CSS animation:

```css
.noise-overlay {
  background-image: url('data:image/svg+xml;base64,...');
  animation: grain 0.4s steps(2) infinite;
}

@keyframes grain {
  0% {
    transform: translate3d(0, 9rem, 0);
  }
  100% {
    transform: translate3d(-7rem, 0, 0);
  }
}
```

### Por qué steps(2)

Crea saltos bruscos (analógico) en lugar de movimiento suave (digital).

---

## 4. PageLoader — Anti-FOUC

### El problema

`gsap.from()` en HeroTitle: el HTML se renderiza visible, luego GSAP setea `opacity: 0`, luego anima a `opacity: 1`.

Usuario ve: **letras → parpadeo → animación**.

### La solución

Overlay fullscreen con color de fondo:

```typescript
onMounted(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    setTimeout(() => {
      isLoading.value = false; // Trigger fade-out
    }, 100);
  });
});
```

### Ciclo de vida

```
1. visible = true  → overlay opaco tapa todo
2. GSAP ejecuta    → animación invisible detrás del overlay
3. 100ms después   → visible = false → CSS transition fade-out
4. transitionend   → shouldRender = false → desmontar del DOM
```

### Por qué 3 niveles

| Nivel                   | Garantiza                         |
| ----------------------- | --------------------------------- |
| `onMounted`             | Hijos ya montaron (Vue bottom-up) |
| `nextTick`              | DOM refleja cambios               |
| `requestAnimationFrame` | Browser pintó el frame            |
| `setTimeout(100)`       | Buffer visual                     |

---

## 5. ConsoleMessage — Debug overlay

Mensaje de consola estilizado para debugging en desarrollo.

---

## 6. default.vue — Layout base

```vue
<template>
  <PageLoader />
  <NoiseBackground />
  <AppNav />
  <slot />
  <AppFooter />
</template>
```

Orden z-index:

- NoiseBackground: `z-index: 9999`
- PageLoader: `z-index: 50`
- AppNav: default

---

## Siguiente lectura

- [01 - Arquitectura General](./01-arquitectura-general.md) — Visión global
- [04 - Secciones](./04-secciones.md) — Secciones de página
- [07 - Problemas Resueltos](./07-problemas-resueltos.md) — Lecciones aprendidas
