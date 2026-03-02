# Playground

> Sistema de tarjetas de proyecto + Modal de detalles. Interactividad avanzada con cursor label, efecto magnético, y scroll horizontal.

---

## Índice

| #   | Componente                  | Tipo        | Descripción                           |
| --- | --------------------------- | ----------- | ------------------------------------- |
| 1   | `ProjectCard.vue`           | UI_MOLECULE | Tarjeta de proyecto con hover effects |
| 2   | `ProjectModal.vue`          | UI_MOLECULE | Modal orchestrator con GSAP + Lenis   |
| 3   | `ModalDesktopLayout.vue`    | LAYOUT      | Slider horizontal (desktop)           |
| 4   | `ModalMobileLayout.vue`     | LAYOUT      | Layout vertical (mobile)              |
| 5   | `ModalCloseButton.vue`      | UI_ATOM     | Botón X con doodle draw               |
| 6   | `ModalImageSlide.vue`       | UI_ATOM     | Imagen con NuxtImg                    |
| 7   | `ModalProjectInfo.vue`      | UI_MOLECULE | Bloque info + techs + links           |
| 8   | `ModalScrollIndicators.vue` | UI_MOLECULE | Flechas según scroll position         |

---

## 1. ProjectCard — Tarjeta interactiva

### Props

```typescript
interface Props {
  name: string;
  image: string;
  avatar?: Component; // SVG component
  hoverLabel?: string; // Default: 'View Project'
  color?: string; // Default: '#000'
  minWidth?: string; // Default: '380px'
  maxWidth?: string; // Default: '1100px'
  avatarSize?: string; // Default: '12%'
  avatarStroke?: string; // Default: '12px'
  gridClass?: string; // CSS grid positioning
}
```

### Uso

```vue
<ProjectCard
  name="Tinyshow"
  image="/images/projects/tinyshow_main.webp"
  color="#F25546"
  grid-class="md:col-start-4 md:col-span-7"
  :avatar="TinyshowDetail"
  hover-label="Automated Showcase"
/>
```

### Efectos

| Efecto               | Composable         | Tecnología        |
| -------------------- | ------------------ | ----------------- |
| Label flotante       | `useCursorLabel`   | rAF + lerp        |
| Movimiento magnético | `useMagneticHover` | GSAP elastic      |
| Avatar reveal        | —                  | CSS `group-hover` |

### Avatar stroke trick

```css
.avatar :deep(svg path) {
  stroke: var(--color-background); /* Color del fondo */
  stroke-width: 12px;
  paint-order: stroke fill; /* Stroke detrás del fill */
}
```

Crea un borde de "recorte" visual sobre la imagen.

---

## 2. ProjectModal — Orquestador

### Source of truth: URL

```
?project=tinyshow → isOpen = true
```

Permite deep linking y botón atrás del navegador.

### Animaciones GSAP

```
ENTER:                           LEAVE:
bg: opacity 0→1 (0.5s)          content: y0→60, opacity 0 (0.7s)
content: y200,scale→0→1 (0.8s)  bg: opacity 1→0 (0.5s)
         expo.out                       power2.inOut
```

### El fix crítico: contentRef wrapper

```html
<div ref="contentRef">
  <ModalDesktopLayout v-if="!isMobile" />
  <ModalMobileLayout v-else />
</div>
```

Con `v-if/v-else` directo en el ref, GSAP fallaba al cambiar layout. Wrapper único → GSAP siempre tiene nodo real.

### Lenis local

```typescript
localLenis = new Lenis({
  wrapper: container,
  content: content,
  orientation: 'horizontal',
  gestureOrientation: 'both',
  smoothWheel: true,
  lerp: 0.08,
  autoRaf: false, // Sincronizado con GSAP ticker
});
```

### Re-init en resize

```typescript
watch(isMobile, async () => {
  if (isOpen.value) await initLenis();
});
```

---

## 3. ModalDesktopLayout — Slider horizontal

### Estructura

```
┌────────────────────────────────────────────────────┐
│ [X]                                            │
│                                                │
│  ┌────────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ TITLE  │ │IMG1│ │IMG2│ │IMG3│ │    │  ... │
│  │ + INFO │ └────┘ └────┘ └────┘ └────┘       │
│  │ + TECHS│                                     │
│  │ + LINKS│                          ◄──────►   │
│  └────────┘                                     │
└────────────────────────────────────────────────────┘
```

Primer slide = texto. Slides posteriores = imágenes.

---

## 4. ModalMobileLayout — Layout vertical

### Estructura

```
┌──────────────────┐
│              [X] │
│                  │
│  TINYSOW         │
│  2025             │
│                  │
│  ┌──┐ ┌──┐ ┌──┐ │
│  │  │ │  │ │  │ │
│  └──────────┘ │  │ ← slider
│              ←→   │
│                  │
│  [INFO]          │
│  [TECHS]         │
│  [LINKS]         │
└──────────────────┘
```

Close button con **autoPlay**: doodle se dibuja automáticamente 400ms tras mount (no hay hover en touch).

---

## 5. ModalCloseButton — X con doodle

### Desktop: hover

```
Enter → drawDoodle()
Leave → eraseDoodle()
```

### Mobile: autoPlay

```typescript
onMounted(() => {
  if (!hasHover) {
    setTimeout(drawDoodle, 400);
  }
});
```

### Stuck animation fix + resetPaths

```typescript
function draw() {
  gsap.killTweensOf(svg); // Matar todo pendiente
  resetDoodlePaths(svg, preparedPaths); // Resetear paths a estado inicial
  // ... redibujar
}
```

Antes: flag `isAnimating` se corrompía con hover rápido.
Solución: `gsap.killTweensOf()` es determinista.

Usa `useDoodleDraw.resetPaths()` en vez de lógica inline. Ver [03 - Composables](./03-composables.md).

---

## 6. ModalImageSlide — NuxtImg optimizada

```vue
<NuxtImg
  :src="src"
  :alt="alt"
  loading="lazy"
  format="webp"
  quality="80"
  sizes="sm:90vw md:50vw lg:40vw"
  placeholder
  draggable="false"
/>
```

`draggable="false"` + `pointer-events-none` + `select-none`: evita que el browser interprete drag como arrastrar imagen.

---

## 7. ModalProjectInfo — Datos centralizados

```typescript
interface Props {
  projectName: string;
  size?: 'sm' | 'lg';
  layout?: 'row' | 'column';
}
```

| Prop   | Desktop | Mobile |
| ------ | ------- | ------ |
| size   | lg      | sm     |
| layout | row     | column |

Consumido por ambos layouts → sin duplicación de datos.

---

## 8. ModalScrollIndicators — Flechas reactivas

### Lógica

```typescript
const canScrollLeft = scrollLeft > 10;
const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;
```

### Dibujo/erase + cleanup

```typescript
watch(canScrollLeft, (can) => {
  can ? drawArrowLeft() : eraseArrowLeft();
});
```

Usa `useDoodleDraw.resetPaths()` y `erasePaths()` para el ciclo draw/erase de las flechas. En `onUnmounted`, hace cleanup de los tweens GSAP pendientes con `resetPaths()` para evitar memory leaks.

Ver [03 - Composables](./03-composables.md).

---

## Siguiente lectura

- [04 - Secciones](./04-secciones.md) — PlaygroundSection
- [06 - UI & Layout](./06-ui-layout.md) — Nav, Footer, Noise, Loader
