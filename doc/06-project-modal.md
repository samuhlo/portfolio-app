# ProjectModal: Sistema modular de detalle de proyecto

> Modal superpuesto que muestra los detalles expandidos de un proyecto. Se abre/cierra con query params, anima con GSAP, scrollea con Lenis, y separa layouts desktop/mobile.

---

## Índice

| #   | Pieza                       | Tipo        | Descripción                                  |
| :-- | :-------------------------- | :---------- | :------------------------------------------- |
| 1   | `ProjectModal.vue`          | Orquestador | Estado, GSAP enter/leave, Lenis, drag scroll |
| 2   | `ModalDesktopLayout.vue`    | Layout      | Slider horizontal (texto + imágenes)         |
| 3   | `ModalMobileLayout.vue`     | Layout      | Layout vertical (título → slider → info)     |
| 4   | `ModalCloseButton.vue`      | UI Atom     | Botón X con doodle draw-on-hover             |
| 5   | `ModalImageSlide.vue`       | UI Atom     | Slide con `<NuxtImg>` optimizada + fallback  |
| 6   | `ModalProjectInfo.vue`      | UI Molecule | Bloque [INFO] + [TECHS] + [LINKS]            |
| 7   | `ModalScrollIndicators.vue` | UI Molecule | Flechas doodle según posición de scroll      |
| 8   | `useDragScroll`             | Composable  | Click-and-drag para scroll horizontal        |

---

## 1. ProjectModal — El orquestador

### Qué hace

Es el punto de entrada del sistema. No renderiza UI directamente — delega en layouts según el viewport. Sus responsabilidades:

- **Estado**: `isOpen` y `currentProject` derivados del query param `?project=`
- **Animación**: GSAP enter/leave con Teleport al `<body>`
- **Scroll suave**: instancia Lenis local para el slider horizontal
- **Drag scroll**: `useDragScroll` para arrastrar con el ratón en desktop

### La analogía

Es como el **director de una obra de teatro**. No actúa en escena — coordina: decide qué escenografía montar (desktop o mobile), cuándo se abre el telón (GSAP enter), cuándo se cierra (GSAP leave), y mantiene la maquinaria de fondo funcionando (Lenis, drag scroll).

### Source of truth: la URL

```
https://samuhlo.dev/?project=tinyshow
                      └── isOpen = true, currentProject = 'tinyshow'

https://samuhlo.dev/
                      └── isOpen = false
```

El modal NO usa un `ref<boolean>`. La URL es la fuente de verdad. Esto permite compartir enlaces directos a un proyecto y usar el botón atrás del navegador para cerrar.

### Animación GSAP: Enter y Leave

```
ENTER:                                      LEAVE:
bg: opacity 0 → 1 (0.5s)                   content: y0 → y60, opacity 0 (0.7s)
content: y200, scale 0.95 → y0, scale 1     bg: opacity 1 → 0 (0.5s)
         (0.8s, expo.out)                            (power2.inOut)
```

### El fix crítico: `contentRef` único

```
❌ ANTES (roto):                             ✅ DESPUÉS (funciona):
┌──────────────────────────┐                ┌──────────────────────────┐
│ v-if="!isMobile"         │                │ div ref="contentRef"     │ ← siempre existe
│   div ref="contentRef"   │ ← se destruye  │   v-if desktop layout   │
│     DesktopLayout        │   al cambiar   │   v-else mobile layout  │
│ v-else                   │                └──────────────────────────┘
│   div ref="contentRef"   │ ← ref = null
│     MobileLayout         │   durante leave
└──────────────────────────┘   → GSAP falla
```

Con `v-if/v-else` directamente en el `contentRef`, al cambiar de layout o al ejecutar la animación de leave, el ref podía ser `null`. GSAP intentaba animar `null` y la animación se colgaba. La solución: un `<div ref="contentRef">` wrapper que siempre existe y contiene ambos layouts dentro.

### Lenis: scroll horizontal suave

El slider desktop usa Lenis con orientación horizontal, sincronizado con el ticker de GSAP:

```typescript
localLenis = new Lenis({
  wrapper: container, // El scroll container del layout
  content: content, // El contenido scrolleable
  orientation: 'horizontal',
  gestureOrientation: 'both', // Scroll vertical del trackpad → mueve horizontal
  smoothWheel: true,
  lerp: 0.08, // Factor de suavizado
  autoRaf: false, // Se gestiona manualmente via gsap.ticker
});

gsap.ticker.add((time) => localLenis?.raf(time * 1000));
```

Los refs del contenedor se obtienen a través de `defineExpose` en los layouts:

```
ProjectModal
  └─ layoutRef → ModalDesktopLayout.defineExpose({
                    scrollContainerRef,
                    scrollContentRef,
                  })
```

Cuando cambia `isMobile` con el modal abierto, Lenis se destruye y re-inicializa automáticamente para adaptarse al nuevo layout.

---

## 2. ModalDesktopLayout — Slider horizontal

### Estructura

```
┌─────────────────────────────────────────────────────────────────────┐
│ [X]                                                     (close btn) │
│                                                                     │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  TINYSHOW    │  │          │  │          │  │          │  ...   │
│  │  2025        │  │  IMG 1   │  │  IMG 2   │  │  IMG 3   │       │
│  │              │  │          │  │          │  │          │       │
│  │  [INFO]      │  └──────────┘  └──────────┘  └──────────┘       │
│  │  [TECHS]     │                                                   │
│  │  [LINKS]     │                                         ← →       │
│  └──────────────┘                                     (indicators)  │
└─────────────────────────────────────────────────────────────────────┘
  ◀────────────── scroll horizontal ──────────────▶
```

El primer slide es el bloque de texto (título + `ModalProjectInfo`). Los siguientes son las imágenes del proyecto con `ModalImageSlide`. El indicador de flechas (`ModalScrollIndicators`) se posiciona `absolute bottom-8 right-12`.

---

## 3. ModalMobileLayout — Layout vertical

### Estructura

```
┌──────────────────────┐
│                  [X]  │ ← doodle auto-draw
│                       │
│  TINYSHOW             │
│  2025                 │
│                       │
│  ┌────┐ ┌────┐ ┌────┐│
│  │IMG1│ │IMG2│ │IMG3││ ← slider horizontal independiente
│  └────┘ └────┘ └────┘│
│                  ← →  │ ← indicators (entre slider e info)
│                       │
│  [INFO]               │
│  [TECHS]              │
│  [LINKS]              │
└──────────────────────┘
  ▲ scroll vertical (página)
```

En mobile, el close button tiene `autoPlay` — el doodle X se dibuja automáticamente 400ms después de montar, sin necesidad de hover (que no existe en touch).

---

## 4. ModalCloseButton — X con doodle hover

### Comportamiento dual: desktop vs mobile

| Plataforma              | Al montar                                 | Hover enter                              | Hover leave                       |
| :---------------------- | :---------------------------------------- | :--------------------------------------- | :-------------------------------- |
| **Desktop**             | SVG recto visible                         | Doodle X se dibuja, SVG recto desaparece | Doodle se borra, SVG recto vuelve |
| **Mobile** (`autoPlay`) | SVG recto no se renderiza                 | —                                        | —                                 |
|                         | Doodle se dibuja automático (400ms delay) |                                          | Erase es un no-op                 |

### El problema del stuck animation

Al entrar y salir muy rápido del hover, el flag `isAnimating` se quedaba en `true` porque el draw no terminaba antes del erase. Solución: eliminar el flag y usar `gsap.killTweensOf()`:

```typescript
function killAllTweens() {
  const svg = doodleRef.value?.svg;
  if (svg) gsap.killTweensOf(svg);
  preparedPaths.forEach((p) => gsap.killTweensOf(p));
}

function draw() {
  killAllTweens(); // Matar todo lo pendiente
  resetPaths(); // Resetear a estado inicial
  // ... redibujar
}
```

### Superficie de hover agrandada

El botón visual es el icono X, pero la hitbox es un `div` mayor (`w-18 h-18` en desktop) con `p-3` de padding. Esto evita que el usuario pierda el hover al moverse un pixel fuera de la línea del SVG.

---

## 5. ModalImageSlide — NuxtImg optimizada

Muestra una imagen del proyecto con `<NuxtImg>` o un placeholder X si no hay `src`:

```vue
<NuxtImg
  :src="src"
  :alt="alt"
  loading="lazy"          <!-- Solo carga cuando entra en viewport -->
  format="webp"           <!-- Conversión automática -->
  quality="80"            <!-- Reduce peso sin pérdida visual -->
  sizes="sm:90vw md:50vw lg:40vw"  <!-- Srcset responsivo -->
  placeholder             <!-- Blur-up mientras carga -->
  draggable="false"       <!-- Evitar drag nativo del browser -->
/>
```

`draggable="false"` + `pointer-events-none` + `select-none` son críticos: sin ellos, al intentar arrastrar el slider, el browser intercepta el evento e intenta arrastrar la imagen como archivo.

---

## 6. ModalProjectInfo — Fuente única de datos

Componente que centraliza [INFO], [MAIN TECHS], y [LINKS] con variantes de tamaño:

| Prop     | Desktop                           | Mobile              |
| :------- | :-------------------------------- | :------------------ |
| `size`   | `lg`                              | `sm`                |
| `layout` | `row` (techs y links lado a lado) | `column` (apilados) |

Ambos layouts consumen este mismo componente — no hay duplicación de datos.

---

## 7. ModalScrollIndicators — Flechas reactivas

### Lógica

Escucha el evento `scroll` del contenedor y calcula si hay contenido disponible a izquierda/derecha:

```typescript
const { scrollLeft, scrollWidth, clientWidth } = el;
canScrollLeft.value = scrollLeft > SCROLL_THRESHOLD; // 10px
canScrollRight.value = scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD;
```

Cuando `canScrollLeft` cambia a `true`, se dibuja `DoodleArrowLeftGeneral` con stroke-dash. Cuando cambia a `false`, se borra con fadeout. Igual para la derecha.

### Anti-stuck: `gsap.killTweensOf()`

Mismo patrón que el close button — antes de dibujar o borrar, se matan todos los tweens pendientes del SVG y sus paths.

---

## 8. useDragScroll — Click-and-drag en desktop

### El problema que resuelve

Lenis solo captura eventos de wheel/touch. En desktop, al hacer click-and-drag en el slider, no pasaba nada (las clases `cursor-grab` eran puramente visuales).

### La mecánica

```typescript
function onMouseDown(e: MouseEvent) {
  startX = e.pageX - el.offsetLeft;
  scrollLeft = el.scrollLeft;
}

function onMouseMove(e: MouseEvent) {
  const x = e.pageX - el.offsetLeft;
  const walk = (x - startX) * 1.5; // Multiplicador de velocidad
  el.scrollLeft = scrollLeft - walk;
}
```

Opera directamente sobre `scrollLeft`, compatible con Lenis. Se vincula al ciclo de vida de Lenis: `bind()` al inicializar, `unbind()` al destruir.

---

## Arquitectura: cómo encajan las piezas

```
PlaygroundSection
  └─ ProjectCard (@click → router.push({ query: { project } }))

ProjectModal (Teleport to body)
  ├─ Estado: route.query.project
  ├─ GSAP: onEnter / onLeave
  ├─ Lenis: scroll horizontal suave
  ├─ useDragScroll: click-and-drag
  │
  ├─ ModalDesktopLayout (v-if !isMobile)
  │    ├─ ModalCloseButton (hover: draw/erase doodle)
  │    ├─ Title + ModalProjectInfo (size=lg, layout=row)
  │    ├─ ModalImageSlide × N (NuxtImg)
  │    └─ ModalScrollIndicators (flechas doodle)
  │
  └─ ModalMobileLayout (v-else)
       ├─ ModalCloseButton (autoPlay: draw automático)
       ├─ Title
       ├─ ModalImageSlide × N (slider horizontal)
       ├─ ModalScrollIndicators
       └─ ModalProjectInfo (size=sm, layout=column)
```

---

## Decisiones de diseño

| Decisión                                    | Alternativa descartada      | Razón                                                     |
| :------------------------------------------ | :-------------------------- | :-------------------------------------------------------- |
| URL como source of truth                    | `ref<boolean>`              | Permite deep links y botón atrás                          |
| `contentRef` wrapper único                  | `v-if/v-else` en contentRef | GSAP necesita un nodo real durante leave                  |
| `gsap.killTweensOf()` vs flag `isAnimating` | Flag booleano               | El flag se corrompe en hover rápido; kill es determinista |
| `<NuxtImg>` vs `<img>`                      | `<img>` nativo              | Format conversion, srcset, placeholder automáticos        |
| `useDragScroll` sobre `scrollLeft`          | Lenis drag API              | Lenis no tiene drag nativo; `scrollLeft` es compatible    |
| `autoPlay` en mobile close btn              | Mismo hover que desktop     | No hay hover en touch devices                             |

---

## Siguiente lectura

- [01 - Arquitectura](./01-arquitectura-animaciones.md) — Visión general del sistema
- [02 - Composables](./02-composables-detalle.md) — Referencia técnica de composables
- [05 - Playground](./05-playground-projectcard.md) — ProjectCard y efectos interactivos
