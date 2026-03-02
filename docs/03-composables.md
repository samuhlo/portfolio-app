# Composables

> Funciones reutilizables del sistema de animaciones. Lógica de negocio encapsulada.

---

## Índice

| #   | Composable          | Propósito                          |
| --- | ------------------- | ---------------------------------- |
| 1   | `useDoodleDraw`     | Animación stroke-dash de SVGs      |
| 2   | `useCursorLabel`    | Label flotante con lerp + rAF      |
| 3   | `useMagneticHover`  | Efecto imán con GSAP elastic       |
| 4   | `useDragScroll`     | Click-and-drag horizontal          |
| 5   | `usePhysicsLetters` | Motor Matter.js para letras        |
| 6   | `useErrorPhysics`   | Motor Matter.js para 404           |
| 7   | `useGSAP`           | Contexto GSAP con auto-limpieza    |
| 8   | `useLenis`          | Acceso a instancia global de Lenis |
| 9   | `usePinnedScroll`   | Secciones fijas con fases          |
| 10  | `useParallax`       | Parallax simple por velocidad      |

### Módulos compartidos

| Módulo                          | Archivo               | Propósito                                    |
| :------------------------------ | :-------------------- | :------------------------------------------- |
| `DoodleExposed`                 | `app/types/doodle.ts` | Tipo compartido para refs de componentes SVG |
| `SITE`, `BREAKPOINTS`, `COLORS` | `app/config/site.ts`  | Constantes globales centralizadas            |
| `destroyMatterEngine`           | `app/utils/matter.ts` | Cleanup reutilizable para Matter.js engines  |

---

## 1. useDoodleDraw — SVG stroke-dash

### El problema

Quieres que un SVG se "dibuje" progresivamente como a mano alzada.

### La técnica

```
strokeDasharray = longitud total del path
strokeDashoffset = longitud → completamente oculto
strokeDashoffset = 0 → completamente visible
```

### preparePaths

```typescript
const preparePaths = (svgEl: SVGSVGElement): SVGPathElement[] => {
  const paths = Array.from(svgEl.querySelectorAll('path'));

  paths.forEach((path) => {
    const length = path.getTotalLength() + 20; // +20 por caps redondeados
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length, // Oculto
      visibility: 'hidden',
    });
  });

  return paths;
};
```

### addDrawAnimation

```typescript
const addDrawAnimation = (tl, { svg, paths, duration, stagger = 0 }) => {
  tl.to(svg, { opacity: 1, duration: 0.01 }).to(
    paths,
    {
      visibility: 'visible',
      strokeDashoffset: 0,
      duration,
      stagger,
    },
    '<',
  );
};
```

`'<'` = start al mismo tiempo que la animación anterior.

### resetPaths — Volver al estado inicial

```typescript
const resetPaths = (svg, paths) => {
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));
  gsap.set(svg, { opacity: 0 });
  paths.forEach((path) => {
    const length = path.getTotalLength() + 20;
    gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
  });
};
```

Mata tweens activos y resetea el SVG a estado oculto. Usado por `ModalCloseButton`, `ModalScrollIndicators` y `RandomDoodleHover`.

### erasePaths — Borrar con fadeout

```typescript
const erasePaths = (svg, paths, { duration = 0.2, ease = 'power1.in' } = {}) => {
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));
  gsap.to(svg, {
    opacity: 0,
    duration,
    ease,
    onComplete: () => {
      /* resetea strokeDashoffset de cada path */
    },
  });
};
```

Fadeout animado + reset automático al completar. Para hover-out o cuando se necesita re-animar después.

---

## 2. useCursorLabel — rAF + lerp

### El problema

Label flotante que sigue al cursor con retraso suave. CSS `transition` en `left/top` causa **layout thrashing** (recalcula layout cada frame).

### La solución: rAF + lerp + transform

```typescript
const lerp = 0.12; // Factor: 0.05=lento, 0.3=rápido
let currentX = 0,
  currentY = 0;
let targetX = 0,
  targetY = 0;

function animate() {
  currentX += (targetX - currentX) * lerp;
  currentY += (targetY - currentY) * lerp;

  label.style.transform = `translate(${currentX}px, ${currentY}px)`;
  requestAnimationFrame(animate);
}
```

### Snap inicial

```typescript
function onMouseEnter(e) {
  // Evita animación desde (0,0)
  currentX = e.clientX - rect.left + offsetX;
  currentY = e.clientY - rect.top + offsetY;
  targetX = currentX;
  targetY = currentY;

  rafId = requestAnimationFrame(animate);
}
```

### Cleanup

Cancelar rAF en `onMouseLeave` y `onBeforeUnmount`.

---

## 3. useMagneticHover — GSAP elastic

### El problema

El card se desplaza hacia el cursor al hacer hover y vuelve con bounce elástico.

### Por qué GSAP y no rAF

El elastic easing (`elastic.out`) es nativo de GSAP. Implementarlo manualmente = reinventar la rueda.

### La mecánica

```typescript
function onMagneticMove(e) {
  const rect = magneticRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const deltaX = (e.clientX - centerX) * strength;
  const deltaY = (e.clientY - centerY) * strength;

  gsap.to(magneticRef, {
    x: deltaX,
    y: deltaY,
    duration: 0.4,
    ease: 'power2.out',
    overwrite: 'auto', // Cancelar tweens anteriores
  });
}

function onMagneticLeave() {
  gsap.to(magneticRef, {
    x: 0,
    y: 0,
    duration: 0.6,
    ease: 'elastic.out(1, 0.4)', // Amplitud, período
    overwrite: 'auto',
  });
}
```

`elastic.out(1, 0.4)` → rebote amplio y lento.

---

## 4. useDragScroll — Click-and-drag

### El problema

Lenis solo captura wheel/touch. En desktop, click-and-drag no funciona.

### La mecánica

```typescript
function onMouseDown(e) {
  startX = e.pageX - el.offsetLeft;
  scrollLeft = el.scrollLeft;
}

function onMouseMove(e) {
  const x = e.pageX - el.offsetLeft;
  const walk = (x - startX) * 1.5; // Velocidad 1.5x
  el.scrollLeft = scrollLeft - walk;
}
```

Opera sobre `scrollLeft` directamente — compatible con Lenis.

### bind/unbind

```typescript
function bind() {
  el.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
```

Vincular al ciclo de vida del componente (init/destroy).

---

## 5. usePhysicsLetters — Matter.js

### El problema

Letras que caen con física real: gravedad, rebote, fricción, colisiones.

### Stack

| Capa        | Tecnología           |
| ----------- | -------------------- |
| Física      | Matter.js            |
| Render      | Canvas 2D            |
| Visibilidad | IntersectionObserver |

### Lazy init + pause/resume

```typescript
// Trigger inicial al 40% visible
// Pause/resume al entrar/salir del viewport (threshold: [0, 0.4])
const handleIntersection = (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !triggered) {
      triggered = true;
      initPhysics(canvas, TEXT, { isMobile });
    } else if (triggered) {
      entry.isIntersecting ? resume() : pause();
    }
  }
};

observer = new IntersectionObserver(handleIntersection, {
  threshold: [0, 0.4], // 0 = exit, 0.4 = trigger
});
```

### pause / resume

```typescript
const pause = () => {
  if (!isRunning || paused) return;
  paused = true;
  if (runner) Runner.stop(runner);
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const resume = () => {
  if (!isRunning || !paused) return;
  paused = false;
  if (runner && engine) Runner.run(runner, engine);
  if (drawFn) rafId = requestAnimationFrame(drawFn);
};
```

Evita ciclos de CPU desperdiciados cuando la sección está fuera del viewport. `slam()` llama a `resume()` automáticamente si estaba pausado.

### Constantes físicas

| Constante             | Valor | Efecto                    |
| --------------------- | ----- | ------------------------- |
| `LETTER_RESTITUTION`  | 0.25  | Rebote bajo               |
| `LETTER_FRICTION`     | 0.9   | Sin deslizamiento lateral |
| `LETTER_FRICTION_AIR` | 0.015 | Resistencia mínima        |
| `gravity.y`           | 4.5   | Caída rápida              |

### Slam — Manotazo

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

Impulso aleatorio hacia arriba al hacer click. `slam()` auto-resume si el motor estaba pausado.

### destroy — Cleanup compartido

```typescript
const destroy = () => {
  const reset = destroyMatterEngine({ engine, runner, rafId });
  engine = reset.engine;
  runner = reset.runner;
  rafId = reset.rafId;
  letterBodies = [];
  isRunning = false;
};
```

Usa `destroyMatterEngine` de `app/utils/matter.ts` — utilidad compartida con `useErrorPhysics`.

---

## 6. useErrorPhysics — Matter.js para 404

### Propósito

Bloque "404" que cae con física real y se asienta a mitad de pantalla. Settle detection automático para liberar CPU.

### Settle detection

```typescript
const speed = textBody.speed + Math.abs(textBody.angularSpeed);
if (speed < SETTLE_SPEED_THRESHOLD) {
  settleCount++;
  if (settleCount >= SETTLE_FRAMES_REQUIRED) {
    // 60 frames = ~1s
    if (runner) Runner.stop(runner);
    rafId = null;
    return; // Último frame ya pintado — CPU libre
  }
} else {
  settleCount = 0;
}
```

---

## Siguiente lectura

- [02 - Animaciones Scroll](./02-animaciones-scroll.md) — GSAP + ScrollTrigger
- [04 - Secciones](./04-secciones.md) — Hero, Bio, Contact, Playground
- [05 - Playground](./05-playground.md) — ProjectCard + Modal
- [08 - Refactor Audit](./08-refactor-audit.md) — Changelog del refactor
