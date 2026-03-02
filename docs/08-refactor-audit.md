# Refactor Audit — Changelog

> Auditoría completa del codebase: eliminación de código muerto, bugs corregidos, tipos centralizados, memory leaks, optimizaciones de rendimiento y refactorización de legibilidad.

---

## Resumen

| Categoría                      |       Tareas        | Impacto                                      |
| :----------------------------- | :-----------------: | :------------------------------------------- |
| Dead code eliminado            | 6 archivos + 3 deps | Bundle más limpio, menos overhead en runtime |
| Imports/variables sin usar     |    3 componentes    | Código más legible                           |
| Bugs corregidos                |          3          | Funcionalidad correcta                       |
| Tipos/constantes centralizados |  3 nuevos módulos   | DRY, single source of truth                  |
| Composables ampliados          |          2          | Reutilización, menos duplicación             |
| Memory leaks GSAP              |    3 componentes    | Sin tweens zombie                            |
| Performance (physics)          |    2 composables    | CPU idle cuando no visible                   |
| Performance (bundle)           |    1 componente     | ~30KB+ fuera del chunk crítico               |
| Legibilidad                    |    1 componente     | 7 bloques → 1 loop                           |
| Fix regresión                  |    1 composable     | Pinned scroll funcional                      |

**Resultado neto:** `28 files changed, 236 insertions(+), 354 deletions(-)`

---

## 1. Dead code eliminado

### Archivos eliminados

| Archivo                                    | Motivo                                             |
| :----------------------------------------- | :------------------------------------------------- |
| `app/stores/useAppStore.ts`                | Store vacío (solo `defineStore` sin state/actions) |
| `app/stores/useProjectsStore.ts`           | Store vacío (solo `defineStore` sin state/actions) |
| `app/utils/format.ts`                      | Stub sin usar (funciones vacías exportadas)        |
| `app/utils/viewport.ts`                    | Stub sin usar                                      |
| `app/utils/math.ts`                        | Stub sin usar                                      |
| `app/middleware/page-transition.global.ts` | Middleware vacío ejecutándose en cada navegación   |
| `app/plugins/gsap.client.ts`               | Plugin vacío (GSAP se registra desde `useGSAP.ts`) |

### Dependencias huérfanas eliminadas

| Dependencia   | Motivo                                                        |
| :------------ | :------------------------------------------------------------ |
| `pinia`       | Los stores estaban vacíos y fueron eliminados                 |
| `@pinia/nuxt` | Módulo Nuxt de Pinia — ya no necesario                        |
| `vue-router`  | Nuxt lo incluye internamente, la dep explícita era redundante |

Estas se eliminaron de `package.json` y de `nuxt.config.ts` (módulos), y se ejecutó `bun install` para limpiar el lockfile.

### Imports/variables sin usar

| Archivo             | Eliminado                                                                                      |
| :------------------ | :--------------------------------------------------------------------------------------------- |
| `BioSection.vue`    | `import { useWindowSize }`, `const TEXT_ENDS_AT`                                               |
| `useCursorLabel.ts` | `import type { Ref }`                                                                          |
| `error.vue`         | `SETTLE_SPEED_THRESHOLD`, `SETTLE_FRAME_COUNT`, `props` (reemplazado por `defineProps` inline) |

---

## 2. Bugs corregidos

### Bug 1: `ModalProjectInfo.vue` — bodySize siempre retornaba `'text-sm'`

```typescript
// ANTES (bug): ambas ramas devolvían lo mismo
const bodySize = computed(() => (props.size === 'lg' ? 'text-sm' : 'text-sm'));

// DESPUÉS (fix): rama lg devuelve 'text-base'
const bodySize = computed(() => (props.size === 'lg' ? 'text-base' : 'text-sm'));
```

### Bug 2: `usePhysicsLetters.ts` — Color fallback incorrecto

```typescript
// ANTES: no coincidía con la CSS variable --color-background
ctx.fillStyle = getComputedStyle(canvas).color || '#f5f0e8';

// DESPUÉS: match exacto con la CSS var
ctx.fillStyle = getComputedStyle(canvas).color || '#faf3f0';
```

El fallback `#f5f0e8` era un valor anterior del diseño. La CSS variable real es `#faf3f0`. Ahora se referencia desde `COLORS.background` en `config/site.ts`.

### Bug 3: `usePinnedScroll.ts` — attemptKill recursivo sin límite

```typescript
// ANTES: loop infinito si lenis.velocity nunca bajaba de 0.1
const attemptKill = () => {
  if (Math.abs(velocity) < 0.1 && !(window as any).__isTouching) {
    // kill...
  } else {
    requestAnimationFrame(attemptKill); // Sin límite
  }
};
```

Problemas:

1. `(window as any).__isTouching` nunca se definía en el codebase → siempre `undefined` → no afectaba, pero era dead code confuso.
2. Sin límite de intentos → podía correr indefinidamente si Lenis nunca se detenía.

```typescript
// DESPUÉS: bailout forzado con killAndCompensate
const MAX_ATTEMPTS = 300; // ~5s a 60fps

const killAndCompensate = () => {
  const targetScroll = self.scroll() - pinSpacerHeight;
  self.kill();
  lenis?.scrollTo(targetScroll, { immediate: true });
  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const attemptKill = () => {
  attempts++;
  if (!self.isActive && self.progress === 1) {
    const velocity = lenis?.velocity || 0;
    if (Math.abs(velocity) < 0.1) {
      killAndCompensate();
    } else if (attempts > MAX_ATTEMPTS) {
      killAndCompensate(); // Forzar kill — no dejar pin-spacer huérfano
    } else {
      requestAnimationFrame(attemptKill);
    }
  }
};
```

> **Lección**: Un bailout silencioso (`return`) es peligroso si deja efectos secundarios vivos. El pin-spacer de 2000px quedaba en el DOM, haciendo el scroll de vuelta "eterno".

---

## 3. Tipos y constantes centralizados

### 3.1 `app/types/doodle.ts` — Tipo compartido `DoodleExposed`

```typescript
export interface DoodleExposed {
  svg: SVGSVGElement | null;
}
```

Reemplaza la definición local idéntica en 7 componentes:
`HeroTitle`, `HeroSubtitle`, `BioSection`, `PlaygroundTitle`, `ModalScrollIndicators`, `ModalCloseButton`, `RandomDoodleHover`.

### 3.2 `app/config/site.ts` — Constantes globales del sitio

```typescript
export const SITE = {
  url: 'https://samuhlo.com',
  email: 'samuhlo.dev@gmail.com',
  github: 'https://github.com/samuhlo',
  linkedin: 'https://www.linkedin.com/in/samuhlo/',
};

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

export const COLORS = {
  background: '#faf3f0',
  foreground: '#0C0011',
  accent: '#FFCA40',
};
```

Consumidores actualizados: `ContactSection`, `AppNav`, `ConsoleMessage`, `index.vue`, `usePhysicsLetters`, `useErrorPhysics`, `usePinnedScroll`, `HeroSubtitle`.

### 3.3 `app/utils/matter.ts` — Utilidad compartida `destroyMatterEngine`

```typescript
import { Engine, Runner, World } from 'matter-js';

interface MatterRefs {
  engine: Matter.Engine | null;
  runner: Matter.Runner | null;
  rafId: number | null;
}

export const destroyMatterEngine = (refs: MatterRefs): MatterRefs => {
  if (refs.rafId != null) cancelAnimationFrame(refs.rafId);
  if (refs.runner) Runner.stop(refs.runner);
  if (refs.engine) {
    World.clear(refs.engine.world, false);
    Engine.clear(refs.engine);
  }
  return { engine: null, runner: null, rafId: null };
};
```

Refactorizado en `useErrorPhysics.ts` y `usePhysicsLetters.ts` — ambos duplicaban esta lógica de cleanup.

---

## 4. Composables ampliados

### 4.1 `useDoodleDraw` — Nuevos métodos `resetPaths` y `erasePaths`

Antes, 3 componentes (`ModalScrollIndicators`, `ModalCloseButton`, `RandomDoodleHover`) duplicaban la lógica de resetear y borrar doodles inline.

```typescript
// resetPaths: vuelve al estado inicial (oculto, sin dibujar)
const resetPaths = (svg, paths) => {
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));
  gsap.set(svg, { opacity: 0 });
  paths.forEach((path) => {
    const length = path.getTotalLength() + 20;
    gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
  });
};

// erasePaths: fadeout + reset (para hover-out)
const erasePaths = (svg, paths, { duration = 0.2, ease = 'power1.in' } = {}) => {
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));
  gsap.to(svg, {
    opacity: 0,
    duration,
    ease,
    onComplete: () => {
      paths.forEach((path) => {
        const length = path.getTotalLength() + 20;
        gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
      });
    },
  });
};
```

### 4.2 `usePhysicsLetters` — Nuevos métodos `pause` y `resume`

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

`slam()` llama a `resume()` automáticamente si estaba pausado, para que el efecto sea visible.

---

## 5. Memory leaks GSAP corregidos

Componentes que creaban tweens en event handlers (hover, scroll) sin cleanup en `onUnmounted`:

| Componente                  | Leak                                  | Fix                            |
| :-------------------------- | :------------------------------------ | :----------------------------- |
| `ModalScrollIndicators.vue` | Tweens en watchers de scroll position | `onUnmounted`: kill all tweens |
| `ModalCloseButton.vue`      | Tweens en mouseenter/mouseleave       | `onUnmounted`: kill all tweens |
| `RandomDoodleHover.vue`     | Tweens en hover handlers              | `onUnmounted`: kill all tweens |

> **Nota**: `useDoodleDraw.ts` y `usePinnedScroll.ts` importan gsap directamente por diseño (son composables usados dentro de contextos `useGSAP` en los componentes padre). El leak real eran los tweens creados fuera del `gsap.context()` en event handlers.

---

## 6. Optimización de rendimiento: Physics

### 6.1 Pause/resume rAF en `usePhysicsLetters` (ContactSection)

**Problema**: El loop `requestAnimationFrame` + `Runner` de Matter.js corría indefinidamente, incluso cuando la sección Contact estaba completamente fuera del viewport.

**Solución**: `ContactSection.vue` ya tenía un `IntersectionObserver` one-shot para el trigger inicial. Se extendió con dual thresholds `[0, 0.4]`:

- `0.4` → dispara la caída inicial (sin cambios)
- `0` → detecta salida del viewport → `pause()`. Re-entrada → `resume()`

```typescript
observer = new IntersectionObserver(handleIntersection, {
  threshold: [0, TRIGGER_THRESHOLD], // 0 = exit, 0.4 = trigger
});
```

### 6.2 Settle detection en `useErrorPhysics` (error.vue)

**Problema**: El bloque "404" cae, rebota y se asienta en ~2 segundos, pero el rAF + Runner seguían corriendo para siempre.

**Solución**: Contador de frames consecutivos donde `speed + angularSpeed < 0.05`. Tras 60 frames (~1s estable), se para el Runner y el rAF loop. El último frame queda renderizado estáticamente.

```typescript
const speed = textBody.speed + Math.abs(textBody.angularSpeed);
if (speed < SETTLE_SPEED_THRESHOLD) {
  settleCount++;
  if (settleCount >= SETTLE_FRAMES_REQUIRED) {
    if (runner) Runner.stop(runner);
    rafId = null;
    return; // Último frame ya pintado
  }
} else {
  settleCount = 0;
}
```

### 6.3 Lazy load de figlet en `ConsoleMessage.vue`

**Problema**: `figlet` + font Doom (~30KB+) se importaban estáticamente en el bundle principal para un easter egg de consola.

**Solución**: Reemplazado por `import()` dinámico dentro de `onMounted`:

```typescript
const [{ default: figlet }, { default: standard }] = await Promise.all([
  import('figlet'),
  import('figlet/importable-fonts/Doom.js'),
]);
```

Se carga después del mount, fuera del chunk crítico.

---

## 7. Refactor de legibilidad: BioSection data-driven

**Problema**: 7 bloques `if (ref.value?.svg) { addDrawAnimation(...) }` repetitivos con solo parámetros diferentes.

**Solución**: Array de configuración + loop:

```typescript
const doodleConfigs = [
  { ref: quotesOpenRef, duration: 0.5 },
  { ref: crossFunRef, duration: 0.4, position: '+=0.1' },
  { ref: funRef, duration: 0.5, stagger: 0.1, position: '-=0.1' },
  { ref: waveRef, duration: 0.6, position: '+=0.1' },
  { ref: heartRef, duration: 0.5, stagger: 0.1, position: '+=0.1' },
  { ref: circleRef, duration: 0.6, position: '+=0.1' },
  { ref: quotesCloseRef, duration: 0.5, position: '+=0.1' },
];

for (const cfg of doodleConfigs) {
  if (!cfg.ref.value?.svg) continue;
  addDrawAnimation(doodleTl, {
    svg: cfg.ref.value.svg,
    paths: getPaths(cfg.ref),
    duration: cfg.duration,
    ...(cfg.stagger != null && { stagger: cfg.stagger }),
    ...(cfg.position != null && { position: cfg.position }),
  });
}
```

Reducción neta: ~30 líneas, comportamiento idéntico.

---

## 8. Fix regresión: Pin-spacer huérfano

**Problema post-refactor**: Al añadir `MAX_ATTEMPTS = 60` con `return` silencioso en el bug fix #3, si Lenis tardaba más de 1s en decelerar (scroll rápido con momentum), el `attemptKill` abandonaba sin matar el ScrollTrigger. El pin-spacer de 2000px quedaba en el DOM → scroll de vuelta "eterno".

**Fix**: `MAX_ATTEMPTS = 300` (~5s) + forzar `killAndCompensate()` en lugar de `return` silencioso. El pin-spacer siempre se limpia: graciosamente si Lenis se detiene a tiempo, o forzadamente como fallback.

---

## Archivos creados

| Archivo               | Propósito                                             |
| :-------------------- | :---------------------------------------------------- |
| `app/types/doodle.ts` | Tipo compartido `DoodleExposed`                       |
| `app/config/site.ts`  | Constantes globales: `SITE`, `BREAKPOINTS`, `COLORS`  |
| `app/utils/matter.ts` | Utilidad `destroyMatterEngine` para Matter.js cleanup |

## Archivos eliminados

| Archivo                                    | Motivo           |
| :----------------------------------------- | :--------------- |
| `app/stores/useAppStore.ts`                | Store vacío      |
| `app/stores/useProjectsStore.ts`           | Store vacío      |
| `app/utils/format.ts`                      | Stub sin usar    |
| `app/utils/viewport.ts`                    | Stub sin usar    |
| `app/utils/math.ts`                        | Stub sin usar    |
| `app/middleware/page-transition.global.ts` | Middleware vacío |
| `app/plugins/gsap.client.ts`               | Plugin vacío     |

---

## Siguiente lectura

- [01 - Arquitectura General](./01-arquitectura-general.md) — Visión global
- [03 - Composables](./03-composables.md) — Funciones reutilizadas
- [07 - Problemas Resueltos](./07-problemas-resueltos.md) — Lecciones aprendidas
