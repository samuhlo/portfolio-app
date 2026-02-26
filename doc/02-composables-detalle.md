# Composables en detalle

> Referencia técnica de cada composable del sistema de animaciones.

---

## 1. `useGSAP` — El contrato de limpieza

### El problema que resuelve

En Vue, los componentes se montan y desmontan. Si creas animaciones GSAP en `onMounted` pero no las limpias en `onUnmounted`, tienes **memory leaks**: ScrollTriggers fantasma que siguen escuchando el scroll, tweens que animan elementos que ya no existen.

### La analogía

Es como **alquilar un escenario**. `useGSAP` firma el contrato: "todo lo que montes aquí se desmonta automáticamente cuando te vayas". No tienes que acordarte de limpiar cada animación individualmente.

### Cómo funciona

```typescript
export const useGSAP = () => {
  let ctx: gsap.Context | null = null;

  const initGSAP = (callback: (context: gsap.Context) => void) => {
    ctx = gsap.context(callback); // Crea un "scope" que trackea todo
    return ctx;
  };

  onUnmounted(() => {
    ctx?.revert(); // Destruye TODO lo creado dentro del contexto
  });

  return { gsap, ScrollTrigger, initGSAP };
};
```

### La pieza clave: `gsap.context()`

`gsap.context()` es un scope invisible que registra **todo** lo que crees dentro de él:

- Tweens (`gsap.to`, `gsap.from`)
- Timelines (`gsap.timeline`)
- ScrollTriggers
- SplitText

Cuando llamas a `ctx.revert()`, GSAP destruye todo de golpe. Sin contexto, tendrías que hacer:

```typescript
// SIN contexto (propenso a errores)
onUnmounted(() => {
  tween1.kill();
  tween2.kill();
  timeline1.kill();
  scrollTrigger1.kill();
  splitText1.revert();
  // ¿me olvido de algo? Seguro que sí.
});
```

### Uso en componentes

```typescript
// En cualquier componente
const { gsap, initGSAP } = useGSAP();

onMounted(() => {
  initGSAP(() => {
    // Todo lo que pongas aquí se limpia automáticamente
    gsap.to('.titulo', { opacity: 1, duration: 1 });
    ScrollTrigger.create({
      /* ... */
    });
  });
});
// No necesitas onUnmounted — useGSAP ya lo hace
```

### Detalle importante: `import.meta.client`

```typescript
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}
```

Nuxt renderiza en el servidor (SSR). GSAP necesita el DOM del browser para funcionar. `import.meta.client` asegura que los plugins solo se registran en el cliente.

---

## 2. `useDoodleDraw` — Dibujar SVG a mano

### El problema que resuelve

Tienes SVGs con trazos (paths) y quieres que se "dibujen" progresivamente, como si alguien los estuviera dibujando con un boli. Este composable encapsula la técnica de `strokeDasharray` / `strokeDashoffset`.

### La analogía

Imagina que tienes un camino de hormigas pintado en el suelo. `strokeDasharray` define **cuánto del camino se ve** vs cuánto se oculta. `strokeDashoffset` define **dónde empieza** la parte visible. Si el offset es igual a la longitud total, no se ve nada. Si es 0, se ve todo.

```
Offset = 100%:  ........................  (oculto)
Offset = 50%:   ============............  (medio dibujado)
Offset = 0%:    ========================  (completo)
```

### Las dos funciones

#### `preparePaths(svgEl)` — Setup inicial

```typescript
const preparePaths = (svgEl: SVGSVGElement | null): SVGPathElement[] => {
  const paths = Array.from(svgEl.querySelectorAll('path'));

  paths.forEach((path) => {
    const length = path.getTotalLength() + 20; // +20 por los caps redondeados
    gsap.set(path, {
      strokeDasharray: length, // Longitud total del dash
      strokeDashoffset: length, // Offset = longitud → completamente oculto
      visibility: 'hidden', // Ocultar hasta que empiece la animación
    });
  });

  return paths;
};
```

**¿Por qué `+20`?** Los paths con `stroke-linecap: round` tienen caps redondeados que sobresalen ligeramente del inicio del path. Sin el margen extra, verías un puntito al inicio antes de que empiece la animación.

**¿Por qué `visibility: hidden` y no `opacity: 0`?** Porque `opacity: 0` sigue ocupando espacio en el layout y puede causar parpadeos. `visibility: hidden` es más limpio para SVGs.

#### `addDrawAnimation(tl, options)` — Animar el dibujo

```typescript
const addDrawAnimation = (tl, options) => {
  const { svg, paths, duration, stagger = 0, position = '+=0' } = options;

  tl.to(svg, { opacity: 1, duration: 0.01 }, position) // 1. Hacer visible el SVG
    .to(
      paths,
      {
        visibility: 'visible', // 2. Hacer visible cada path
        strokeDashoffset: 0, // 3. Animar de oculto → dibujado
        duration,
        stagger, // 4. Delay entre cada path
      },
      '<',
    ); // '<' = al mismo tiempo que lo anterior
};
```

El `'<'` es la posición relativa de GSAP: "empieza al mismo tiempo que la animación anterior". Así la opacity del SVG y el dibujo de los paths arrancan juntos.

### Ejemplo real: BioSection

```typescript
const { preparePaths, addDrawAnimation } = useDoodleDraw();

// 1. Preparar los paths de cada doodle
const paths = preparePaths(quotesOpenRef.value.svg);

// 2. Crear un timeline pausado (se controlará externamente)
const doodleTl = gsap.timeline({ paused: true });

// 3. Añadir cada doodle al timeline
addDrawAnimation(doodleTl, {
  svg: quotesOpenRef.value.svg,
  paths,
  duration: 0.5,
});
addDrawAnimation(doodleTl, {
  svg: crossFunRef.value.svg,
  paths: preparePaths(crossFunRef.value.svg),
  duration: 0.4,
  position: '+=0.1', // Empieza 0.1s después del anterior
});
// ... más doodles

// 4. El timeline se controla desde usePinnedScroll
```

---

## 3. `usePinnedScroll` — Pinear y secuenciar

### El problema que resuelve

Quieres que una sección se **fije en la pantalla** mientras el usuario scrollea, y que durante ese scroll fijo se reproduzcan N animaciones en secuencia. Cuando termina, la sección se libera y el scroll continúa normalmente.

### La analogía

Es como un **ascensor con paradas programadas**:

- El ascensor (sección) se detiene en un piso (se pinea)
- Mientras está parado, ocurren cosas en secuencia (fases de animación)
- Cuando todas las tareas terminan, el ascensor sigue subiendo (se libera)

### La API

```typescript
const { createPinnedScroll } = usePinnedScroll();

createPinnedScroll({
  trigger: element, // Qué elemento se pinea
  start: 'top top', // Cuándo empieza el pin
  end: '+=2500', // Cuántos px de scroll dura
  phases: [
    // Secuencia de animaciones
    { timeline: titleTl, start: 0, end: 0.6 }, // 0%–60% del scroll
    { timeline: subtitleTl, start: 0.6, end: 1 }, // 60%–100% del scroll
  ],
});
```

### La mecánica interna

#### 1. El pin-spacer

Cuando GSAP pinea un elemento, crea un **pin-spacer**: un `<div>` invisible que ocupa el espacio que la sección dejaría libre al ser fijada. Sin él, todo el contenido posterior saltaría hacia arriba.

```
ANTES del pin:                    DURANTE el pin:
┌─────────────┐                  ┌─────────────┐
│   Header    │                  │   Header    │ ← scroll normal
├─────────────┤                  ├─────────────┤
│   SECCIÓN   │                  │ PIN-SPACER  │ ← div vacío (ocupa espacio)
│   (normal)  │                  │  (2500px)   │
├─────────────┤                  ├─────────────┤
│   Footer    │                  │   Footer    │
└─────────────┘                  └─────────────┘

                                 ┌═════════════┐
                                 ║   SECCIÓN   ║ ← position: fixed (flotando)
                                 ║  (pineada)  ║
                                 └═════════════┘
```

#### 2. Fases y progreso unidireccional

Cada fase tiene un rango `[start, end]` dentro del progreso total (0–1). El composable mapea el progreso del scroll al progreso de cada timeline:

```
Progreso del scroll: 0 ────────── 0.6 ────────── 1
                     │  Fase 1    │    Fase 2    │
                     │ (titleTl)  │ (subtitleTl) │
```

Las **flags `completed[]`** aseguran que una fase nunca retrocede:

```typescript
if (completed[i]) return; // Ya terminó → no volver a tocar

if (phaseProgress >= 1) completed[i] = true; // Marcar como terminada
```

Esto evita que al scrollear hacia arriba la animación se deshaga.

#### 3. El suavizado con `gsap.to`

En vez de asignar el progreso directamente (`timeline.progress(0.5)`), se usa un tween:

```typescript
gsap.to(phase.timeline, {
  progress: phaseProgress,
  duration: 0.5, // Suavizado de 500ms
  ease: 'power3.out',
  overwrite: 'auto', // Cancela tweens anteriores del mismo target
});
```

Esto crea un **efecto de inercia**: si scrolleas rápido, la animación no salta bruscamente sino que "se pone al día" suavemente. Sin esto, los movimientos serían robóticos.

#### 4. La liberación del pin (`onLeave`)

Cuando el usuario scrollea más allá del pin, `onLeave` se dispara:

```typescript
onLeave: (self) => {
  const pinSpacerHeight = self.end - self.start; // Altura del spacer
  const targetScroll = self.scroll() - pinSpacerHeight; // Posición compensada
  self.kill(); // Elimina trigger + spacer
  lenis?.scrollTo(targetScroll, { immediate: true }); // Compensa el salto
  requestAnimationFrame(() => ScrollTrigger.refresh()); // Recalcula los demás
};
```

**¿Por qué compensar el scroll?** Al matar el trigger, GSAP elimina el pin-spacer (2500px de `<div>` vacío). De repente, la página es 2500px más corta. Sin compensación, el viewport saltaría 2500px hacia abajo.

**¿Por qué en `onLeave` y no antes?** Porque en `onLeave` la sección ya está **fuera del viewport**. El usuario mira el contenido de abajo, así que cualquier glitch visual en la zona del pin es invisible. Esta fue la gran lección aprendida (ver [03-problemas-resueltos.md](./03-problemas-resueltos.md)).

---

## 4. `useLenis` — Acceso a la instancia global

Es el composable más simple: solo expone la instancia de Lenis que el plugin inyecta en Nuxt.

```typescript
export const useLenis = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$lenis as Lenis | undefined;
};
```

Se usa en `usePinnedScroll` para llamar a `lenis.scrollTo()` con `immediate: true` (scroll sin animación) al compensar la eliminación del pin-spacer.

---

## 5. `usePhysicsLetters` — Letras con gravedad

### El problema que resuelve

Quieres que las letras de un texto **caigan con física real** — gravedad, rebote, fricción — como bloques sólidos que se apilan unos sobre otros. Es el efecto "interactivo" de la sección de contacto.

### La analogía

Es como una **máquina de bolas** (pachinko). Cada letra es una bola con forma de rectángulo que se suelta desde arriba. Las paredes y el suelo son los bordes de la sección. Las letras caen, rebotan entre ellas, y se apilan en el fondo.

```
Spawn (arriba, fuera del viewport):

    C  O  N  T  A  C  T     ← Cada letra se suelta con delay (stagger)
    ↓  ↓  ↓  ↓  ↓  ↓  ↓        y velocidad angular aleatoria

Resultado final (abajo, apiladas):

   ┌──────────────────────┐
   │  C O                 │
   │    N T A C T         │
   └──────────────────────┘
```

### Arquitectura: Canvas + Matter.js

A diferencia del resto del sistema de animaciones (que usa GSAP), este composable usa **dos tecnologías distintas**:

| Qué hace             | Quién lo hace            | Por qué                                                                         |
| :------------------- | :----------------------- | :------------------------------------------------------------------------------ |
| Simulación física    | **Matter.js**            | Motor 2D con gravedad, colisiones, fricción — GSAP no tiene física real         |
| Renderizar letras    | **Canvas 2D**            | Las letras necesitan rotarse libremente — los elementos DOM no rotan con física |
| Detectar visibilidad | **IntersectionObserver** | Activar la simulación solo cuando la sección es visible (rendimiento)           |

### La mecánica interna

#### 1. Medir las letras con Canvas

Antes de crear los cuerpos físicos, el composable mide el ancho real de cada letra usando `ctx.measureText()`:

```typescript
const measureRow = (ctx, chars, fontSize, fontFamily): LetterMeasure[] => {
  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${fontFamily}`;
  return chars.map((char) => ({
    char,
    w: ctx.measureText(char).width, // Ancho real del glyph
    h: fontSize * 0.8, // Altura aprox. (80% del fontSize)
  }));
};
```

**¿Por qué `fontSize * 0.8`?** Las fuentes tipográficas tienen una "caja em" que incluye ascendentes y descendientes. El cuerpo visible de las mayúsculas ocupa ~80% de esa caja. Si usáramos `fontSize` completo, los hitboxes serían demasiado altos y las letras flotarían sobre el suelo.

#### 2. Spawn con stagger

Las letras se crean **escalonadas en el eje Y** (stagger vertical) para que no caigan todas a la vez:

```typescript
const spawnRow = (letters, canvasW, baseSpawnY, staggerStep): LetterBody[] => {
  // Centrar horizontalmente
  const totalW = letters.reduce((s, l) => s + l.w, 0);
  let cursorX = (canvasW - totalW) / 2;

  return letters.map((l, i) => {
    const x = cursorX + l.w / 2;
    cursorX += l.w;

    // Cada letra empieza más arriba que la anterior
    const spawnY = baseSpawnY - i * staggerStep;

    // Crear cuerpo físico (rectángulo)
    const body = Bodies.rectangle(x, spawnY, l.w * 0.88, l.h, letterOpts);

    // Velocidad inicial aleatoria → caen con personalidad
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 0 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

    World.add(engine.world, body);
    return { body, char: l.char };
  });
};
```

**`l.w * 0.88`**: el hitbox es un 12% más estrecho que el glyph visual para que las letras se encajen más naturalmente en vez de repelerse por colisiones en los bordes de sus cajas.

#### 3. Doble fila en móvil

En pantallas pequeñas, "CONTACT" no cabe en una fila. El composable lo divide en dos:

```typescript
if (isMobile) {
  const splitAt = Math.floor(upperText.length / 2); // "CON" | "TACT"
  const rowBottom = upperText.slice(splitAt).split(''); // TACT — cae primero
  const rowTop = upperText.slice(0, splitAt).split(''); // CON  — cae después

  // TACT: spawn cerca del tope → llega al suelo primero
  const bottomBodies = spawnRow(measBottom, W, -(measBottom[0].h / 2), 70);

  // CON: spawn mucho más arriba → llega después y se apila encima
  const topSpawnY = -(measTop[0].h / 2 + rowBottom.length * 70 + fontSize * 2.5);
  const topBodies = spawnRow(measTop, W, topSpawnY, 70);
}
```

**El truco del timing**: TACT se suelta más cerca (menos negativo en Y), así que llega al suelo antes. CON se suelta desde mucho más arriba (`+ fontSize * 2.5`), así que cuando llega, TACT ya está asentado y CON se apila encima. Sin este desfase, las letras colisionarían en el aire.

#### 4. El render loop

Matter.js calcula la física, pero no dibuja nada. El composable usa un `requestAnimationFrame` manual para leer las posiciones/rotaciones de Matter.js y dibujarlas en el Canvas:

```typescript
const draw = (): void => {
  ctx.clearRect(0, 0, W, H); // Limpiar frame anterior
  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = getComputedStyle(canvas).color; // Respetar theme

  for (const { body, char } of letterBodies) {
    ctx.save();
    ctx.translate(body.position.x, body.position.y); // Posición de Matter.js
    ctx.rotate(body.angle); // Rotación de Matter.js
    ctx.fillText(char, 0, 0); // Dibujar la letra
    ctx.restore();
  }

  rafId = requestAnimationFrame(draw);
};
```

**¿Por qué Canvas y no DOM?** Para animar N elementos con rotación libre y física, DOM sería muy lento: cada letra necesitaría `transform: translate() rotate()` en cada frame, forzando reflows. Canvas dibuja directamente en un bitmap — es un solo elemento en el DOM sin importar cuántas letras haya.

#### 5. Limpieza

```typescript
const destroy = (): void => {
  cancelAnimationFrame(rafId); // Parar render loop
  Runner.stop(runner); // Parar simulación física
  World.clear(engine.world); // Eliminar todos los cuerpos
  Engine.clear(engine); // Liberar el motor
  letterBodies = []; // Limpiar referencias
};
```

Se llama desde `onUnmounted` en ContactSection.

#### 6. Slam — El manotazo en la mesa

Cuando el usuario hace click en el link de email, `slam()` aplica un impulso violento hacia arriba a **todas** las letras, como si alguien diera un golpe en la mesa:

```typescript
const slam = (): void => {
  if (!isRunning) return;

  for (const { body } of letterBodies) {
    const upForce = -(15 + Math.random() * 10); // Impulso vertical variable
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 8, // Dispersión horizontal
      y: upForce,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3); // Giro caótico
  }
};
```

**Tres capas de aleatoriedad:**

| Parámetro            | Rango        | Efecto                             |
| :------------------- | :----------- | :--------------------------------- |
| `y` (impulso arriba) | `-(15 a 25)` | Cada letra salta a distinta altura |
| `x` (horizontal)     | `±4`         | Se dispersan lateralmente          |
| `angularVelocity`    | `±0.15`      | Giran caóticamente al saltar       |

Después del impulso, la gravedad las vuelve a atraer y se re-apilan en el suelo, en posiciones distintas cada vez. El efecto es determinista en su mecánica pero caótico en su resultado — nunca se ve igual dos veces.

### Constantes físicas

| Constante             | Valor   | Efecto                                                 |
| :-------------------- | :------ | :----------------------------------------------------- |
| `LETTER_RESTITUTION`  | `0.25`  | Rebote bajo → las letras se asientan rápido            |
| `LETTER_FRICTION`     | `0.9`   | Mucha fricción → no se deslizan lateralmente al chocar |
| `LETTER_FRICTION_AIR` | `0.015` | Mínima resistencia al aire → caen naturalmente         |
| `gravity.y`           | `4.5`   | Gravedad fuerte (>1) → caída rápida y dramática        |
| `staggerStep`         | `70`    | Separación vertical entre spawns → efecto cascada      |

---

## 6. `useCursorLabel` — Texto que persigue al cursor

> Documentación completa en [05 - Playground](./05-playground-projectcard.md#2-usecursorlabel--texto-flotante-con-lerp)

Composable que crea un label flotante que sigue al cursor con retraso suave. Usa `requestAnimationFrame` + lerp (interpolación lineal) + `transform: translate()` en vez de CSS `transition` en `left`/`top` para evitar layout thrashing y mantener 60fps.

---

## 7. `useMagneticHover` — Efecto imán con GSAP

> Documentación completa en [05 - Playground](./05-playground-projectcard.md#3-usemagnethover--el-card-que-persigue)

Composable que desplaza un elemento hacia el cursor al hacer hover, usando `gsap.to` para el follow y `elastic.out` para el snap-back al salir. A diferencia de `useCursorLabel`, usa GSAP en vez de rAF manual porque el elastic easing es nativo de GSAP.

---

## 8. `useDragScroll` — Click-and-drag horizontal

> Documentación completa en [06 - ProjectModal](./06-project-modal.md#8-usedragscroll--click-and-drag-en-desktop)

Composable que habilita click-and-drag para scroll horizontal en un contenedor. Opera directamente sobre `scrollLeft` con un multiplicador de velocidad (1.5x). Se vincula y desvincula con `bind()`/`unbind()`, integrado al ciclo de vida de Lenis en el ProjectModal.

---

## Siguiente lectura

- [01 - Arquitectura](./01-arquitectura-animaciones.md) — Visión general del sistema
- [03 - Componentes](./03-componentes-detalles.md) — Análisis técnico de componentes
- [04 - Problemas resueltos](./04-problemas-resueltos.md) — Trampas y lecciones aprendidas
- [05 - Playground](./05-playground-projectcard.md) — ProjectCard y efectos interactivos
- [06 - ProjectModal](./06-project-modal.md) — Sistema modular de detalle de proyecto
