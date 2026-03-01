# Composables

> Funciones reutilizables del sistema de animaciones. Lógica de negocio encapsulada.

---

## Índice

| #   | Composable          | Propósito                          |
| --- | ------------------- | ---------------------------------- |
| 1   | `useGSAP`           | Contexto GSAP con auto-limpieza    |
| 2   | `useLenis`          | Acceso a instancia global de Lenis |
| 3   | `usePinnedScroll`   | Secciones fijas con fases          |
| 4   | `useDoodleDraw`     | Animación stroke-dash de SVGs      |
| 5   | `useCursorLabel`    | Label flotante con lerp + rAF      |
| 6   | `useMagneticHover`  | Efecto imán con GSAP elastic       |
| 7   | `useDragScroll`     | Click-and-drag horizontal          |
| 8   | `usePhysicsLetters` | Motor Matter.js para letras        |
| 9   | `useParallax`       | Parallax simple por velocidad      |
| 10  | `useDoodleDraw`     | Dibujo SVG stroke-dash             |

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

### Lazy init

```typescript
const handleIntersection = (entries) => {
  if (entry.isIntersecting && !triggered) {
    triggered = true;
    initPhysics(canvas, TEXT, { isMobile });
  }
};

observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
observer.observe(sectionRef);
```

`threshold: 0.2` → activa cuando 20% visible.

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

Impulso aleatorio hacia arriba al hacer click.

---

## Siguiente lectura

- [02 - Animaciones Scroll](./02-animaciones-scroll.md) — GSAP + ScrollTrigger
- [04 - Secciones](./04-secciones.md) — Hero, Bio, Contact, Playground
- [05 - Playground](./05-playground.md) — ProjectCard + Modal
