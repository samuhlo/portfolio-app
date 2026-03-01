# Secciones

> Componentes de página completos. Cada sección es una unidad independiente con su propia lógica de animación.

---

## Índice

| #   | Componente              | Tipo    | Descripción                                        |
| --- | ----------------------- | ------- | -------------------------------------------------- |
| 1   | `HeroSection.vue`       | LAYOUT  | Orquestador del Hero con pinned scroll             |
| 2   | `HeroTitle.vue`         | FEATURE | Título "SAMUELOPZ" con animación de caída + doodle |
| 3   | `HeroSubtitle.vue`      | FEATURE | Subtítulo + doodles de palabras                    |
| 4   | `BioSection.vue`        | LAYOUT  | Biografía con pinned scroll para doodles           |
| 5   | `ContactSection.vue`    | LAYOUT  | Letras físicas con Matter.js                       |
| 6   | `PlaygroundSection.vue` | LAYOUT  | Grilla de proyectos + ProjectModal                 |

---

## 1. HeroSection — El orquestador

### Propósito

Orquesta las animaciones de HeroTitle y HeroSubtitle desde un único ScrollTrigger.

### Estructura

```typescript
createPinnedScroll({
  trigger: pinWrapperRef,
  start: 'top top',
  end: '+=2500', // 2500px de scroll pineado
  phases: [
    { timeline: titleTl, start: 0, end: 0.6 }, // 0%–60%
    { timeline: subtitleTl, start: 0.6, end: 1 }, // 60%–100%
  ],
});
```

### Pin wrapper

```html
<div ref="pinWrapperRef" style="overflow-x: clip">
  <section class="hero-section h-screen">
    <HeroTitle ref="heroTitleRef" />
    <HeroSubtitle ref="heroSubtitleRef" />
  </section>
</div>
```

**Por qué overflow-x: clip y no hidden?** → Ver [07-Problemas Resueltos](./07-problemas-resueltos.md#7-overflow-x-hidden-crea-doble-scroll).

---

## 2. HeroTitle — Caída + doodle

### La animación (4 fases)

```
1. GOLPECITO    → Letras pierden equilibrio (y: -10px, rotate)
2. CAÍDA        → Caen fuera del viewport (y: 120vh, rotate)
3. EMPUJAR      → Width → 0 para hacer sitio a la "h"
4. DIBUJAR H    → Doodle stroke-dash + punto aparece
```

### Configuración

```typescript
const ANIMATION_CONFIG = {
  gapWidth: 0.85, // Ancho del hueco para la "h" (en em)
  durations: {
    bump: 0.25,
    fall: 0.7,
    push: 0.5,
    draw: 0.85,
    dotFadIn: 0.3,
  },
  rotationsBump: [-8, 12, 0, -15, 8, -12],
  rotationsFall: [-40, 60, 0, -80, 50, -70],
};
```

### El doodle de la "h"

Usa `useDoodleDraw` para preparar paths y animarlos con stroke-dashoffset.

---

## 3. HeroSubtitle — Palabras + doodles

### Estructura

Cada palabra es un componente doodle que expone su SVG:

```typescript
interface DoodleExposed {
  svg: SVGSVGElement | null;
}
```

### Las palabras

| Palabra  | Doodle           | Posición |
| -------- | ---------------- | -------- |
| UX/UI    | DoodleWordUxui   | right    |
| Frontend | DoodleWordFront  | left     |
| Backend  | DoodleWordBack   | center   |
| Brand    | DoodleWordBrand  | center   |
| Design   | DoodleWordDesign | left     |

### La animación

Timeline secuencial:

1. Crossline (línea tachando)
2. Palabras secuenciales (stagger)

---

## 4. BioSection — Texto + doodles pineados

### Propósito

Biografía con **pin solo para doodles**. El texto se anima independientemente (IntersectionObserver), los doodles se animan durante el pin.

### Estructura

```
├── textContainer    → gsap.from con SplitText (no pineado)
└── doodles wrapper  → pinned scroll timeline
    ├── quotesOpen
    ├── crossFun
    ├── fun
    ├── wave
    ├── heart
    └── quotesClose
```

### SplitText

```typescript
const split = new SplitText(paragraphs, { type: 'lines' });

gsap.from(split.lines, {
  y: 40,
  opacity: 0,
  duration: 0.8,
  stagger: 0.08,
  scrollTrigger: {
    trigger: textContainerRef,
    start: 'top 85%',
    once: true, // Solo una vez
  },
});
```

### Heartbeat

Tras completar los doodles, el corazón late en loop:

```typescript
const heartbeatTl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });

heartbeatTl
  .to(heartRef.value, { scale: 1.2, duration: 0.15 })
  .to(heartRef.value, { scale: 1, duration: 0.15 });
```

---

## 5. ContactSection — Letras físicas

### Propósito

"CONTACT" como letras que caen con física real (Matter.js).

### Lazy init

```typescript
const handleIntersection = (entries) => {
  if (entry.isIntersecting && !triggered) {
    triggered = true;
    initPhysics(canvas, 'CONTACT', { isMobile });
  }
};

observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
observer.observe(sectionRef);
```

### Doble fila en móvil

```typescript
if (isMobile) {
  const splitAt = Math.floor(text.length / 2);
  // TACT cae primero (más cerca)
  // CON cae después (más lejos)
}
```

### Slam

Click en email → impulso aleatorio hacia arriba:

```typescript
const slam = () => {
  for (const { body } of letterBodies) {
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 8,
      y: -(15 + Math.random() * 10),
    });
  }
};
```

---

## 6. PlaygroundSection — Grilla de proyectos

### Estructura

```vue
<section>
  <PlaygroundTitle />
  <div class="grid grid-cols-12">
    <ProjectCard ... />
  </div>
  <ProjectModal />
</section>
```

### Grilla asimétrica

Usa CSS Grid con posicionamiento explícito:

```html
<div class="md:col-start-4 md:col-span-7">
  <ProjectCard name="Tinyshow" ... />
</div>
```

### ProjectModal

Se abre via query param: `?project=tinyshow`. Ver [05-Playground](./05-playground.md).

---

## Siguiente lectura

- [02 - Animaciones Scroll](./02-animaciones-scroll.md) — GSAP + ScrollTrigger
- [03 - Composables](./03-composables.md) — Funciones reutilizadas
- [05 - Playground](./05-playground.md) — ProjectCard + ProjectModal
- [06 - UI & Layout](./06-ui-layout.md) — Nav, Footer, Noise, Loader
