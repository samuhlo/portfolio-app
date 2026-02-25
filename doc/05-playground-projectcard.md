# Playground: ProjectCard y efectos interactivos

> Sistema de tarjetas de proyecto con hover magnético y cursor label.

---

## Índice

| #   | Pieza              | Tipo       | Descripción                                         |
| :-- | :----------------- | :--------- | :-------------------------------------------------- |
| 1   | `ProjectCard.vue`  | Componente | Tarjeta reutilizable con imagen, avatar y efectos   |
| 2   | `useCursorLabel`   | Composable | Label flotante que sigue al cursor con rAF + lerp   |
| 3   | `useMagneticHover` | Composable | Efecto magnético: el card persigue al cursor (GSAP) |

---

## 1. ProjectCard — La tarjeta modular

### Qué hace

Es el bloque visual base de la sección Playground. Cada proyecto se representa con una `ProjectCard` que contiene:

- **Imagen principal** — via `<NuxtImg>`, servida desde `public/`
- **Avatar SVG** — componente Vue inyectado como prop dinámica
- **Cursor label** — texto flotante que sigue al ratón con retraso
- **Efecto magnético** — el card completo se desplaza sutilmente hacia el cursor

### La analogía

Es como un **póster enmarcado en una exposición**. El póster (imagen) tiene una mascota pegada en la esquina (avatar) que solo se revela cuando te acercas (hover). Al acercarte, el marco se inclina sutilmente hacia ti (magnético) y aparece una etiqueta flotante al lado de tu mano señalando el nombre (cursor label).

### Props

```typescript
interface Props {
  name: string; // Título del proyecto (subtítulo inferior)
  image: string; // Ruta a la imagen (desde public/)
  avatar?: Component; // Componente SVG del avatar
  hoverLabel?: string; // Texto del cursor label (default: 'View Project')
  color?: string; // Color principal del proyecto (default: '#000')
  minWidth?: string; // Ancho mínimo del card (default: '380px')
  maxWidth?: string; // Ancho máximo del card (default: '1100px')
  avatarSize?: string; // Tamaño del avatar como % del contenedor (default: '12%')
  avatarStroke?: string; // Grosor del stroke de recorte del avatar (default: '12px')
  gridClass?: string; // Clases de posicionamiento en el grid
}
```

### Uso en PlaygroundSection

```vue
<script setup>
const TinyshowDetail = defineAsyncComponent(
  () => import('~/components/ui/projects/TinyshowDetail.vue'),
);
</script>

<template>
  <ProjectCard
    name="Tinyshow"
    image="/images/projects/tinyshow_main.webp"
    color="#F25546"
    grid-class="md:col-start-5 md:col-span-8"
    :avatar="TinyshowDetail"
    hover-label="Automated Showcase"
  />
</template>
```

**¿Por qué `defineAsyncComponent` y no `resolveComponent`?** `resolveComponent` devuelve un `string | Component`, lo cual genera conflictos de tipado con la prop `avatar: Component`. `defineAsyncComponent` devuelve un `Component` tipado y además hace code-splitting del SVG.

### El avatar: cómo funciona el hover

El avatar es un SVG posicionado en la esquina superior-derecha del card. Escala y se revela con una transición CSS al hacer hover sobre el grupo (`group:hover`):

```
SIN hover:                          CON hover:
┌────────────────────────┐          ┌────────────────────────┐
│                        │          │                    🐙  │ ← avatar visible
│       [IMAGEN]         │          │       [IMAGEN]         │
│                        │          │                        │
└────────────────────────┘          └────────────────────────┘
  Tinyshow                            Tinyshow
```

**El truco del stroke de recorte**: El SVG del avatar tiene un `stroke` del mismo color que el fondo de la app, pintado **detrás** del fill con `paint-order: stroke fill`. Esto crea un borde que "corta" visualmente sobre la imagen, haciendo que el avatar parezca estar pegado encima en vez de superpuesto:

```css
.project-avatar :deep(svg path) {
  stroke: var(--color-background); /* Color del fondo → efecto recorte */
  stroke-width: v-bind(cardAvatarStroke);
  paint-order: stroke fill; /* Stroke DETRÁS del fill */
}
```

---

## 2. useCursorLabel — Texto flotante con lerp

### El problema que resuelve

Quieres un label de texto que siga al cursor mientras haces hover sobre un elemento, con un retraso suave que dé sensación de "persecución elegante".

### La analogía

Es como un **globo de helio atado a tu muñeca**. No sigue tu mano exactamente — tiene inercia, llega un poco después, se desliza suavemente. Pero nunca se aleja demasiado.

### Por qué NO CSS transitions

La primera implementación usaba CSS `transition` en `left` / `top`:

```css
/* ❌ MAL: causa layout thrashing */
.cursor-label {
  transition:
    left 0.15s ease-out,
    top 0.15s ease-out;
}
```

Esto funciona, pero mal. `left` y `top` son propiedades que fuerzan **recálculo de layout** en cada frame. El browser tiene que recalcular posiciones de todos los elementos hijos. Resultado: stuttery, no fluido.

### La solución: rAF + lerp + transform

```
CSS transition en left/top:          rAF + lerp + transform:
┌──────────────────────┐             ┌──────────────────────┐
│  Layout recalc ×60/s │             │  Solo compositing    │
│  CPU bound           │             │  GPU accelerated     │
│  ~30fps stuttery     │             │  60fps butter smooth │
└──────────────────────┘             └──────────────────────┘
```

**Lerp** (Linear Interpolation) es la fórmula más simple para seguimiento suave:

```
current += (target - current) × factor
```

En cada frame, `current` avanza un porcentaje (`factor`) hacia `target`. Si `factor = 0.12`, cada frame recorre el 12% de la distancia restante. Esto crea una deceleración natural — se mueve rápido cuando está lejos, lento cuando está cerca.

### La mecánica interna

```typescript
const LERP_FACTOR = 0.12;
let targetX = 0,
  targetY = 0; // Donde está el cursor
let currentX = 0,
  currentY = 0; // Donde está el label (interpolado)

function animate() {
  currentX += (targetX - currentX) * LERP_FACTOR;
  currentY += (targetY - currentY) * LERP_FACTOR;

  // transform: no dispara layout → 60fps
  labelRef.style.transform = `translate(${currentX}px, ${currentY}px)`;

  requestAnimationFrame(animate);
}
```

### El snap inicial

Sin snap, al entrar con el ratón por primera vez, el label volaría desde `(0, 0)` (esquina del contenedor) hasta el cursor. `onMouseEnter` evita esto forzando `current = target` en el primer frame:

```typescript
function onMouseEnter(event: MouseEvent) {
  // Snap: el label aparece directamente en el cursor
  currentX = event.clientX - rect.left + offsetX;
  currentY = event.clientY - rect.top + offsetY;
  targetX = currentX;
  targetY = currentY;

  isHovering.value = true;
  rafId = requestAnimationFrame(animate);
}
```

### Opciones

| Opción    | Default | Efecto                                               |
| :-------- | :------ | :--------------------------------------------------- |
| `lerp`    | `0.12`  | Velocidad del follow (0.05 = lento, 0.3 = inmediato) |
| `offsetX` | `16`    | Desplazamiento horizontal desde el cursor (px)       |
| `offsetY` | `12`    | Desplazamiento vertical desde el cursor (px)         |

### Cleanup

El rAF loop se cancela en `onMouseLeave` (para no consumir CPU cuando no hay hover) y también en `onBeforeUnmount` (para evitar memory leaks si el componente se desmonta durante un hover).

---

## 3. useMagneticHover — El card que persigue

### El problema que resuelve

Quieres que el card entero se desplace sutilmente hacia el cursor al hacer hover, como si fuera atraído magnéticamente, y que vuelva a su posición original con un bounce al salir.

### La analogía

Es como una **brújula cerca de un imán**. Mientras acercas la mano (cursor), la aguja (card) se inclina hacia ti. Cuando retiras la mano, la aguja vuelve al norte con un rebote.

### Por qué GSAP y no rAF manual

A diferencia del cursor label (que necesita interpolación frame-a-frame), el efecto magnético es un tween clásico:

- **Follow**: animar `x, y` hacia un target con easing → `gsap.to` perfecto
- **Return**: animar `x, y` de vuelta a `0` con bounce elástico → `gsap.to` con `elastic.out`

Reimplementar elastic easing con rAF manual sería reinventar la rueda.

### La mecánica interna

```typescript
function onMagneticMove(event: MouseEvent) {
  const rect = magneticRef.value.getBoundingClientRect();

  // Delta del cursor respecto al centro del card
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (event.clientX - centerX) * strength;
  const deltaY = (event.clientY - centerY) * strength;

  gsap.to(magneticRef.value, {
    x: deltaX,
    y: deltaY,
    duration: 0.4,
    ease: 'power2.out',
    overwrite: 'auto', // Cancela tweens anteriores
  });
}
```

**`overwrite: 'auto'`** es crítico. Sin él, cada `mousemove` crearía un nuevo tween que competiría con los anteriores, causando temblores. `overwrite: 'auto'` cancela automáticamente los tweens en conflicto.

### El snap-back elástico

```typescript
function onMagneticLeave() {
  gsap.to(magneticRef.value, {
    x: 0,
    y: 0,
    duration: 0.6,
    ease: 'elastic.out(1, 0.6)', // Rebote satisfactorio
    overwrite: 'auto',
  });
}
```

`elastic.out(amplitud, periodo)`:

- **Amplitud** = cuánto rebota (1 = rebote moderado)
- **Periodo** = cuánto dura cada rebote (0.6 = rebote amplio y lento, 0.3 = rápido y nervioso)

### Opciones

| Opción           | Default               | Efecto                                   |
| :--------------- | :-------------------- | :--------------------------------------- |
| `strength`       | `0.15`                | Intensidad del desplazamiento (0.05–0.3) |
| `followDuration` | `0.4`                 | Segundos del tween de follow             |
| `returnDuration` | `0.6`                 | Segundos del snap-back                   |
| `returnEase`     | `elastic.out(1, 0.4)` | Ease del rebote al volver                |

---

## Arquitectura: cómo encajan las piezas

```
PlaygroundSection
  └─ ProjectCard ──────────────────────────────────────────┐
       │                                                   │
       ├─ useCursorLabel()  → Label flotante (rAF + lerp)  │
       │    ├─ containerRef  → div.imagen                  │
       │    └─ labelRef      → div.cursor-label            │
       │                                                   │
       ├─ useMagneticHover() → Efecto magnético (GSAP)     │
       │    └─ magneticRef   → div.project-card (raíz)     │
       │                                                   │
       ├─ <NuxtImg>          → Imagen del proyecto         │
       ├─ <component :is>   → Avatar SVG (prop dinámica)   │
       └─ Subtítulo          → Nombre del proyecto         │
                                                           │
       Event handlers combinados:                          │
       handleMouseMove  = onMouseMove  + onMagneticMove    │
       handleMouseLeave = onMouseLeave + onMagneticLeave   │
  ─────────────────────────────────────────────────────────┘
```

Los dos composables operan en **niveles distintos del DOM**:

- `useMagneticHover` mueve el **card raíz** (`magneticRef`)
- `useCursorLabel` posiciona el **label dentro** del contenedor de imagen (`containerRef`)

Los handlers se combinan en el componente para que un solo `@mousemove` alimente ambos sistemas.

---

## Siguiente lectura

- [01 - Arquitectura](./01-arquitectura-animaciones.md) — Visión general del sistema
- [02 - Composables](./02-composables-detalle.md) — Referencia técnica de composables
- [03 - Componentes](./03-componentes-detalles.md) — Análisis técnico de componentes
- [04 - Problemas resueltos](./04-problemas-resueltos.md) — Trampas y lecciones aprendidas
