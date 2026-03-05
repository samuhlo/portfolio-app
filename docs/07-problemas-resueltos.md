# Problemas resueltos y lecciones aprendidas

> Todo lo que rompimos, entendimos y arreglamos durante la implementación de las animaciones pinned scroll + Lenis.

---

## Índice de problemas

| #   | Problema                                                     | Solución final                                                                 |
| :-- | :----------------------------------------------------------- | :----------------------------------------------------------------------------- |
| 1   | Animaciones se deshacen al scrollear arriba                  | Flags `completed[]` unidireccionales                                           |
| 2   | Salto brusco al terminar el pin                              | `lenis.scrollTo()` con compensación                                            |
| 3   | `window.scrollTo` no funciona con Lenis                      | `lenis.scrollTo({ immediate: true })`                                          |
| 4   | Tilt/glitch al eliminar pin-spacer                           | Matar en `onLeave` (sección off-screen)                                        |
| 5   | BioSection roto tras refactor                                | `ScrollTrigger.refresh()` post-kill                                            |
| 6   | Scroll horizontal en el Hero                                 | `overflow-x: clip` (no `hidden`)                                               |
| 7   | `overflow-x: hidden` crea doble scroll                       | Diferencia entre `hidden` y `clip`                                             |
| 8   | Código duplicado en Hero y Bio                               | Composable `usePinnedScroll`                                                   |
| 9   | Efecto TV Grain de Canvas consume mucha CPU                  | Reescritura usando Canvas oculto + rAF                                         |
| 10  | Salto de scroll extremo al hacer swipe en móvil (iOS Safari) | `Delayed Kill` basado en velocidad pasiva (`lenis.velocity`) + bailout forzado |
| 11  | ContactSection (Canvas) reinventándose en cada scroll táctil | Filtrar `resize` event por umbral de dif. de `width`                           |
| 12  | "Tilt" o parpadeo general en móvil al hacer scroll           | `ScrollTrigger.config({ ignoreMobileResize: true })` y `normalizeScroll(true)` |
| 13  | Scroll pinned (scrub) es tedioso y errático en móvil         | Pivotar a animaciones `auto-play` rápidas sin `pin` en móvil                   |
| 14  | Física de ContactSection consume CPU offscreen               | `IntersectionObserver` con `pause()`/`resume()` + settle detection             |
| 15  | Pin-spacer huérfano tras bailout de delayed kill             | `MAX_ATTEMPTS = 300` + `killAndCompensate()` forzado en bailout                |
| 16  | Build fail: esbuild EPIPE por xattr macOS                    | Reinstalar esbuild (`bun pm rm esbuild && bun pm add esbuild`)                 |
| 17  | Micro-salto visible al terminar pin en desktop               | Deferred Kill: matar cuando scroll > triggerEnd + 1 viewport                   |
| 18  | Bio: texto sin doodles mientras se hace scroll               | Split doodles: early (con texto) + pin (resto)                                 |

---

## 1. Animaciones que se deshacen al scrollear arriba

### El problema

Al scrollear hacia abajo, el título se anima. Al scrollear hacia arriba, el título se desanima. El usuario esperaba que la animación jugara **una vez** y quedara fija.

### Por qué pasaba

`ScrollTrigger` con `scrub` vincula el progreso del timeline al progreso del scroll **bidireccionalmente**. Scroll down = progreso sube, scroll up = progreso baja.

### La solución

Flags por fase que impiden el retroceso:

```typescript
const completed = phases.map(() => false);

// En cada onUpdate:
if (completed[i]) return; // Ya terminó → skip

if (phaseProgress >= 1) completed[i] = true; // Marcar como completa
```

> **Analogía**: Es como ver una película en streaming. Puedes adelantar, pero si ya viste una escena, no se "desvisa". La barra de progreso solo avanza.

---

## 2. Salto brusco al terminar el pin

### El problema

Cuando la animación pineada termina y se elimina el pin-spacer, la página salta bruscamente porque de repente hay 2000px menos de contenido.

### Por qué pasaba

```
ANTES del kill:                    DESPUÉS del kill:
┌─────────────┐                   ┌─────────────┐
│   Header    │                   │   Header    │
├─────────────┤                   ├─────────────┤
│ PIN-SPACER  │ ← 2000px         │   Sección   │ ← Ahora en flow normal
│             │                   ├─────────────┤
│             │                   │   Footer    │ ← Subió 2000px ��
├─────────────┤                   └─────────────┘
│   Footer    │
└─────────────┘
```

### La solución

Compensar el scroll restando la altura del spacer eliminado:

```typescript
const pinSpacerHeight = self.end - self.start;
const targetScroll = self.scroll() - pinSpacerHeight;
self.kill();
lenis?.scrollTo(targetScroll, { immediate: true });
```

---

## 3. `window.scrollTo` no funciona con Lenis

### El problema

Al intentar compensar el scroll con `window.scrollTo(0, target)`, no pasaba nada. La página no se movía.

### Por qué pasaba

Lenis intercepta y controla el scroll del browser. Tiene su propio `animatedScroll` (posición interpolada) y `targetScroll` (posición objetivo). Cuando llamas a `window.scrollTo`, Lenis no se entera y sigue interpolando hacia su objetivo anterior, sobreescribiendo tu corrección.

### La solución

Usar la API de Lenis directamente:

```typescript
// ❌ No funciona con Lenis
window.scrollTo(0, targetScroll);

// ✅ Funciona — Lenis actualiza sus internals
lenis.scrollTo(targetScroll, { immediate: true });
```

`immediate: true` le dice a Lenis: "salta ahí ahora mismo, sin interpolación". Esto actualiza tanto `animatedScroll` como `targetScroll` y llama a `window.scrollTo` internamente.

---

## 4. Tilt/glitch al eliminar el pin-spacer

### El problema

Al eliminar el pin-spacer, había un micro-glitch visual (tilt) incluso con la compensación de scroll. Era especialmente visible con scroll rápido.

### Las iteraciones que probamos (y fallaron)

| Intento                               | Resultado                                    |
| :------------------------------------ | :------------------------------------------- |
| `kill()` + `scrollTo` en `onLeave`    | Tilt visible al usuario                      |
| `lenis.stop()` + `kill()` + `start()` | Peor — el browser toma el control brevemente |
| Doble `requestAnimationFrame`         | Más tiempo = más tilt                        |
| `lenis.reset()` (API privada)         | Error de TypeScript                          |
| No matar → skip con `onUpdate`        | Parón visible al re-entrar la zona del pin   |

### La solución: matar en `onLeave` (sección off-screen)

La clave fue entender el **timing**: `onLeave` se dispara cuando la sección ya está **fuera del viewport** (ha salido por arriba). El usuario mira el contenido de abajo. Cualquier glitch en la zona del pin es **invisible**.

```typescript
onLeave: (self) => {
  // La sección ya está FUERA del viewport → el tilt es invisible
  const pinSpacerHeight = self.end - self.start;
  const targetScroll = self.scroll() - pinSpacerHeight;
  self.kill();
  lenis?.scrollTo(targetScroll, { immediate: true });
  requestAnimationFrame(() => ScrollTrigger.refresh());
};
```

> **Lección**: No intentes hacer invisible una operación visible. Haz la operación cuando nadie mira.

---

## 5. BioSection roto tras refactor

### El problema

Después de refactorizar el Hero para usar `usePinnedScroll`, la Bio dejó de aparecer correctamente.

### Por qué pasaba

El Hero tenía un pin-spacer de 2500px. Cuando `onLeave` del Hero lo eliminaba, **toda la página se acortaba 2500px**. El ScrollTrigger de la Bio tenía sus `start`/`end` calculados con el spacer presente. Sin él, las posiciones estaban desfasadas.

### La solución

`ScrollTrigger.refresh()` después de matar cualquier trigger:

```typescript
requestAnimationFrame(() => ScrollTrigger.refresh());
```

Esto fuerza a **todos** los ScrollTriggers del DOM a recalcular sus `start`/`end` con el nuevo layout. El `requestAnimationFrame` asegura que el DOM se haya actualizado antes de recalcular.

---

## 6. Scroll horizontal en el Hero

### El problema

Tras la animación del Hero, aparecía un scrollbar horizontal. El título "SAMULHO" con `whitespace-nowrap` sobresalía del viewport.

### Por qué pasaba

Durante el pin, GSAP aplica `position: fixed` al wrapper. Al matar el pin, el wrapper vuelve a `position: static` y su contenido overflow se hace visible.

### La solución

`overflow-x: clip` en el wrapper:

```html
<div class="hero-pin-wrapper" style="overflow-x: clip"></div>
```

**¿Por qué `clip` y no `hidden`?** → Ver punto 7.

---

## 7. `overflow-x: hidden` crea doble scroll

### El problema

Al poner `overflow-x: hidden` en el body o en el pin-wrapper, aparecían **dos scrollbars**: uno de Lenis y otro del elemento.

### Por qué pasaba

`overflow: hidden` en CSS crea un **BFC (Block Formatting Context)**. Cuando un elemento tiene `overflow: hidden` y `position: fixed` (como el pin-wrapper durante el pin), se convierte en un **scroll container propio**. Lenis scrollea el `<html>`, y el wrapper scrollea su propio contenido → doble scroll.

### La diferencia clave

| Propiedad          | ¿Recorta contenido? | ¿Crea scroll container? |
| :----------------- | :-----------------: | :---------------------: |
| `overflow: hidden` |         ✅          |           ✅            |
| `overflow: clip`   |         ✅          |           ❌            |

`overflow: clip` es la función equivalente a `hidden` pero **sin crear un nuevo contexto de scroll**. Es relativamente nueva en CSS pero tiene soporte universal en browsers modernos.

```css
/* ❌ Crea doble scroll con Lenis */
.hero-pin-wrapper {
  overflow-x: hidden;
}

/* ✅ Recorta sin crear scroll container */
.hero-pin-wrapper {
  overflow-x: clip;
}
```

> **Lección**: Cuando uses smooth scrolling (Lenis, Locomotive, etc.), **nunca uses `overflow: hidden` en elementos que se pinean**. Usa `clip`.

---

## 8. Código duplicado en Hero y Bio

### El problema

HeroSection y BioSection tenían ~80 líneas idénticas cada una: `ScrollTrigger.create` con pin, `onUpdate` manual con mapeo de progreso, flags de completado, `onLeave` con compensación...

### La solución

Extraer el patrón a `usePinnedScroll`:

```typescript
// ANTES (en cada componente): ~80 líneas
ScrollTrigger.create({
  trigger: el,
  pin: true,
  onUpdate: (self) => {
    // mapeo manual de progreso...
    // flags de completado...
  },
  onLeave: (self) => {
    // kill + compensación...
  },
});

// DESPUÉS (en cada componente): ~8 líneas
createPinnedScroll({
  trigger: el,
  start: 'top top',
  end: '+=2500',
  phases: [
    { timeline: titleTl, start: 0, end: 0.6 },
    { timeline: subtitleTl, start: 0.6, end: 1 },
  ],
});
```

> **Lección**: Si copias y pegas lógica entre componentes, probablemente necesitas un composable.

---

## 9. Efecto TV Grain (Noise Background) destroza el rendimiento

### El problema

El proyecto necesitaba un efecto de fondo granulado estático (como la televisión antigua o película fotográfica) animado a pantalla completa. El componente original de Vue 2 usaba un `<canvas>` donde, en cada _frame_, se ejecutaba un bucle mutando millones de píxeles con `Math.random()`.

Esto producía:

1.  **Drenaje extremo de CPU y batería**, al calcular aleatoriedad para toda la pantalla a 60 FPS.
2.  **Jank y tirones visuales**, ya que bloqueaba el hilo principal (Main Thread) de JavaScript, paralizando GSAP y Lenis Smooth Scroll.
3.  **El grano se agrupaba en "manchas" irregulares**, porque `Math.random()` puro no genera ruido visualmente uniforme.

### Las iteraciones que probamos (y fallaron)

| Intento                                                       | Por qué falló                                                                                                                       | Lección aprendida                                                                                                                                                                                             |
| :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SVG `<feTurbulence>` como background CSS + Animación continua | El grano se deslizaba suavemente por la pantalla en vez de vibrar de forma brusca.                                                  | Modificar `background-position` con animación lineal no crea efecto "estático" o de TV antigua.                                                                                                               |
| SVG + `transform: translate3d()` rápido + `mix-blend-mode`    | Desapareció por completo el componente.                                                                                             | En navegadores WebKit/Blink (Chrome/Safari), aplicar capa de aceleración GPU (`translateZ(0)`) rompe el contecto de apilamiento para los Modos de Fusión (`mix-blend-mode`). El fondo se volvía transparente. |
| SVG Tileable externo (como hace alitwotimes.com)              | Funcionaba brutal, pero dependía de cargar un archivo `.png` estático, perdiendo dinamicidad por Props (tamaño de grano, opacidad). | Generar un PNG externo sacrifica flexibilidad reactiva.                                                                                                                                                       |

### La solución final: Doble buffer Canvas + Sprite aleatorio

Se descartó SVG debido a las inconsistencias de CSS `mix-blend-mode` con aceleración de hardware, y se volvió a Canvas pero aplicando un patrón de videojuegos 2D ("Sprite Buffering"):

1.  **Generación única off-screen:** En lugar de calcular millones de `Math.random()` cada 16ms, se genera un canvas invisible **una sola vez** al montar el componente. Este canvas es del doble del tamaño del viewport.
2.  **Dibujado como textura:** En cada _tick_ del `requestAnimationFrame`, solo le pedimos a la gráfica que copie un recorte aleatorio de XxY dimensiones de ese canvas oculto y lo pegue en el canvas visible (`ctx.drawImage`).
3.  **CSS puro para mezcla y visibilidad:** Para hacer que el canvas sea ignorado por el ratón y se mezcle con el fondo.

```vue
<!-- Extracto de la solución -->
<script setup>
// 1. Calculamos este monstruo SOLO UNA VEZ al montar.
function generateNoise(width, height) {
  const offscreen = document.createElement('canvas');
  const buffer = new Uint32Array(
    offscreen.getContext('2d').createImageData(width, height).data.buffer,
  );

  // Math.random() se ejecuta solo 1 vez x Pixel.
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.random() < props.grainDensity ? 0xffffffff : 0x00000000;
  }
  return offscreen;
}

// 2. En cada frame a 60FPS: NO calculamos ruido, solo movemos la "cámara" dentro del ruido offscreen.
function tick() {
  const x = Math.random() * noiseCanvas.width - canvas.width;
  const y = Math.random() * noiseCanvas.height - canvas.height;

  // Coste de CPU: Prácticamente 0.
  ctx.drawImage(noiseCanvas, x, y);
  requestAnimationFrame(tick);
}
</script>

<style scoped>
.noise-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none; /* Crucial para que no bloquee clicks */
  opacity: v-bind(props.opacity);
  mix-blend-mode: v-bind(props.blendMode); /* Usar CSS variables para evitar re-renders de Vue */
}
</style>
```

> **Lección monumental de rendimiento gráfico:**
> En la web, generar gráficos matemáticos en tiempo real en la CPU es un antipatrón en animación moderna. **Genera siempre una imagen/textura de estado ("buffer") de forma intensiva una sola vez, y luego gasta los frames de animación en simplemente mover de coordenada de visión esa textura.** El navegador copia bitmaps (dibujar imágenes) a la velocidad de la luz gracias a la aceleración 2D.

---

---

## 10. Salto de scroll extremo al hacer swipe en móvil (iOS Safari)

### El problema

Habíamos logrado corregir el pequeño _tilt_ o glitch al destruir el `ScrollTrigger` con `onLeave` en desktop, pero en dispositivos móviles táctiles (particularmente iOS Safari), surgió un nuevo fallo espantoso:
Si hacias un **fling** rápido (un deslizamiento con inercia), la página daba un salto dramático hacia abajo, saltándose a menudo la siguiente sección por completo.

Añadir `syncTouch: true` en la configuración de Lenis arreglaba el problema de GSAP, pero bloqueaba las mecánicas nativas de touch de iOS y generaba scroll cortado o falso en ciertos contextos.

### Por qué pasaba

Cuando el usuario da un empujón fuerte a la pantalla (un "fling") y suelta el dedo, el OS y Lenis entran en una interpolación de **Momentum**.
Durante esta fase de altísima velocidad, si el `ScrollTrigger` entra en la zona `onLeave` e inmediatamente invocamos:

```typescript
self.kill();
lenis.scrollTo(targetScroll, { immediate: true });
```

Lo que ocurre es que en un milisegundo:

1. Destruimos un elemento de 2000px de alto (el `<div class="pin-spacer">`).
2. Ajustamos virtualmente la posición.
3. Pero el motor de Momentum de Lenis/iOS **sigue empujando** con la velocidad calculada según la página _antigua_.
4. Conflicto total de posiciones, resultando en un salto de varios miles de píxeles en 1 frame.

### La solución: Delayed Kill con bailout forzado

Implementamos un sistema que retrasa la muerte (`kill()`) del `ScrollTrigger` hasta que la velocidad inercial del usuario (_momentum_) sea casi cero, permitiendo que Safari decelere de forma natural antes de hacer el cambio en el DOM:

```typescript
// En composables/usePinnedScroll.ts

onLeave: (self) => {
  const pinSpacerHeight = self.end - self.start;
  const MAX_ATTEMPTS = 300; // ~5s a 60fps — margen amplio para Lenis momentum
  let attempts = 0;

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
        // Bailout: forzar kill para evitar pin-spacer huérfano
        killAndCompensate();
      } else {
        requestAnimationFrame(attemptKill);
      }
    }
  };

  requestAnimationFrame(attemptKill);
};
```

- `MAX_ATTEMPTS = 300` da ~5 segundos de margen para que Lenis complete su momentum
- Si se supera el límite sin que la velocidad baje, se fuerza el `killAndCompensate()` para evitar dejar un pin-spacer huérfano de 2000px (ver problema #15)o.

---

## 11. ContactSection (Canvas) reinventándose en cada scroll táctil

### El problema

En el móvil, si interactuabas con la página haciendo scroll, el motor de físicas de `Matter.js` responsable de dejar caer las letras de "Contact" ejecutaba un **Re-Init** y generaba el desplome otra vez inesperadamente.

### Por qué pasaba

Se incluyó un `window.addEventListener('resize')` con un _debounce_ para redimensionar el canvas en base a los cambios de proporciones del usuario.
Sin embargo, **en móviles**, el navegador móvil oculta su "Barra de URL" verticalmente al scrollear hacia abajo, y la vuelve a mostrar al subir.
**Esto gatilla globalmente el evento `resize` del DOM.**
Aunque esto solo altera un 5% el `height` total, el código llamaba ciega e implícitamente a `destroy()` y a `initPhysics()`.

### La solución: Umbral de Sensibilidad por Width

Filtrar los eventos `resize` validando si únicamente nos interesa actuar. Como Matter.js usa gravedad vertical, si el ancho cambia un par de píxeles no hace falta repintar. Reestablecemos el universo físico **solo si el cambio de anchura fue drástico** (como rotar de pantalla vertical a horizontal), lo cual comprobamos evaluando si la diferencia de ancho supera los 50px de margen:

```typescript
const handleResize = (): void => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // ...
    const newWidth = sectionRef.value.clientWidth;

    // Si la diferencia de ancho es mínima, abortar: es simplemente
    // la barra del URL cambiando el alto o el teclado irrumpiendo.
    if (Math.abs(newWidth - prevCanvasWidth) < 50) return;

    prevCanvasWidth = newWidth;
    destroy();
    syncCanvasSize();
    initPhysics(...);
  }, 300);
};
```

---

## 12. "Tilt" o parpadeo general en móvil al hacer scroll

### El problema

Al hacer scroll en móvil, frecuentemente la página pegaba un "tilt" o un parpadeo visual repentino como si se estuviera recargando brevemente la página, rompiendo la experiencia de fluidez por completo.

### Por qué pasaba

Este es un comportamiento infame pero 100% intencionado en diseño de la librería GSAP. De forma predeterminada, `ScrollTrigger` "escucha" los eventos de redimensionamiento de ventana (`resize`) para recalcular y re-dibujar la posición exacta de todos sus "Triggers" (pins, in-outs).

En escritorio esto es normal (cuando el usuario cambia el tamaño de la ventana). En **MÓVILES**, cuando haces scroll hacia abajo, la mayoría de los navegadores (como Safari en iOS o Chrome en Android) ocultan dinámicamente su barra de direcciones (URL bar). Cuando haces scroll arriba, la muestran. Este show/hide cambia artificialmente la propiedad `window.innerHeight`, disparando el evento de _resize_.

Resultado: En cada micro-scroll donde la barra de URL se asomaba o desaparecía, GSAP detenía todo, mataba todas las animaciones instantáneamente, recalculaba la altura de toda la página y volvía a redibujar el DOM. Un caos (El infame _flicker_).

### La solución: GSAP Config

Añadimos parámetros de configuración global a `ScrollTrigger` justo en el fichero donde lo inicializamos por primera vez en la aplicación (`useGSAP.ts`):

```typescript
// En composables/useGSAP.ts

// [FIX] GSAP ignorará los pequeños cambios verticales (URL bar resizing) en móviles
ScrollTrigger.config({ ignoreMobileResize: true });
```

La opción `ignoreMobileResize` previene categóricamente estos recálculos destructivos derivados de la barra del navegador, preservando el layout intacto a menos que el usuario rote el móvil (cambio de `width`).

> **Peligro con `normalizeScroll`:** Aunque la documentación de GSAP sugiere `ScrollTrigger.normalizeScroll(true)` para problemas táctiles, **NUNCA** lo uses en combinación con Lenis o bibliotecas de smooth scroll que dependan de la inercia nativa de iOS. Aplicar `normalizeScroll(true)` forza a GSAP a secuestrar el hilo de touch principal, arruinando los _amortiguadores_ nativos del móvil y re-introduciendo el bug letal de saltos de sección al romper nuestro sistema de lectura pasiva de velocidad `lenis.velocity`.

---

## 13. Scroll pinned (scrub) es tedioso y errático en móvil

### El problema

A pesar de todos los parches técnicos (Delayed Kill, `ignoreMobileResize`, syncTouch, etc.), la experiencia de usuario (UX) de tener secciones _pineadas_ atadas al scroll (scrub) en pantallas táctiles se sentía rota. La gente no quiere tener que deslizar el dedo tres veces la misma pantalla solo para ver una palabra escribirse cuadro por cuadro. Interrumpe el flujo natural de lectura en un teléfono y hace que el sitio se sienta "pesado" o roto.

### Por qué pasaba

El patrón de GSAP `pin: true` combinado con `scrub: true` es un paradigma de escritorio. En desktop, usar la rueda del ratón es un gesto continuo, abstracto y sin esfuerzo. En móvil, el usuario interactúa 1:1 con el cristal: espera que si arrastra la pantalla hacia arriba, el contenido suba inmediatamente en la misma proporción. Bloquear ese movimiento espacial para reproducir una animación de "timeline" genera fricción cognitiva y física.

### La solución: El Gran Pivot Mobile

Rompimos la asimetría entre desktop y mobile creando lógicas condicionales puras:

1. **Desktop:** Las secciones hero y bio se quedan "pegadas" (`pin: true`) y las simulaciones de la línea de tiempo están "friccionadas" al movimiento de la rueda del ratón (`scrub: true`).
2. **Mobile:** Las restricciones se eliminan (`pin: false`, `scrub: false`). La página fluye de manera natural de arriba a abajo.
3. **Auto-Play Trigger:** En móvil, las animaciones se ejecutan instántaneamente y de forma ininterrumpida cuando la sección respectiva hace aparición (`IntersectionObserver` o GSAP `ScrollTrigger` básico que detona el `play()`).
4. **Fast-Forward:** Para compensar que la página ya no está congelada y el usuario sigue bajando velozmente de largo, re-calibramos los tiempos (`duration`) para que se ejecuten radicalmente más rápidos si `isMobile` es `true`. Modificamos la gravedad (aumentándola) de la física generativa del Canvas de contacto, aceleramos los `staggers` de entrada de texto e hicimos que las transiciones de color de background fueran súbitas.

---

## 14. Física de ContactSection consume CPU offscreen

### El problema

La simulación de Matter.js en ContactSection seguía corriendo a 60 FPS incluso cuando la sección estaba fuera del viewport, consumiendo CPU innecesariamente y descargando la batería.

### La solución: IntersectionObserver pause/resume

```typescript
// En ContactSection.vue

const { pause, resume } = usePhysicsLetters();

const handleIntersection: IntersectionObserverCallback = (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !triggered) {
      // Primera vez visible → iniciar física
      triggered = true;
      initPhysics(canvasRef.value, TEXT, { isMobile });
    } else if (triggered) {
      // Ya iniciada → pause/resume según visibilidad
      if (entry.isIntersecting) {
        resume();
      } else {
        pause();
      }
    }
  }
};

// threshold [0, 0.4]: 0 = detectar salida, 0.4 = primer trigger de entrada
observer = new IntersectionObserver(handleIntersection, {
  threshold: [0, 0.4],
});
```

`pause()` y `resume()` detienen/reanudan el `Runner` y `rAF` de Matter.js.

### Settle detection (useErrorPhysics)

Para errores flotantes (`useErrorPhysics`), se implementó detección de "settle": si la velocidad de todos los cuerpos es ~0 durante 60 frames consecutivos, se detiene el rAF completamente.

---

## 15. Pin-spacer huérfano tras bailout de delayed kill

### El problema

Con `MAX_ATTEMPTS = 60` (~1 segundo), si el usuario seguía haciendo scroll con inertia, el delayed kill hacía `return` silencioso al superar el límite. El pin-spacer de 2000px permanecía en el DOM, creando scroll muerto.

### La solución: Bailout forzado

```typescript
const MAX_ATTEMPTS = 300; // ~5s a 60fps
let attempts = 0;

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
      // Bailout: forzar kill para evitar pin-spacer huérfano
      killAndCompensate();
    } else {
      requestAnimationFrame(attemptKill);
    }
  }
};
```

En vez de `return` silencioso, se fuerza `killAndCompensate()` incluso si la velocity no ha llegado a 0.

---

## 16. Build fail: esbuild EPIPE por xattr macOS

### El problema

El build fallaba con error:

```
Error: write EPIPE
at WriteWrap.callback (fs.js: ...)
```

### Por qué pasaba

El ejecutable `esbuild` en macOS tenía extendido el atributo `com.apple.provenance` (xattr de seguridad de macOS). Cuando Node.js intentaba ejecutar el binario, el xattr causaba un `SIGKILL` intermitente.

### La solución

Reinstalar esbuild a través de bun:

```bash
bun pm rm esbuild && bun pm add esbuild
```

Esto limpia el binario cacheado y descarga una versión limpia.

---

## 17. Micro-salto visible al terminar pin en desktop

### El problema

El kill del pin-spacer se hacía en `onLeave` cuando la sección acababa de salir del viewport. El problema era doble:

1. **La sección estaba "caliente"**: Salía justo por arriba, el usuario todavía podía percibir el cambio
2. **La compensación deshacía animaciones**: Al recalcular ScrollTrigger, las animaciones volvían a su estado inicial

### Por qué pasaba

```
onLeave → kill inmediato → ScrollTrigger.refresh() → POSICIÓN CAMBIA
                                                              ↓
                                              El usuario ve el "salto" porque
                                              la sección todavía está cerca
```

### La solución: Deferred Kill (v4)

**Principio**: No matar inmediatamente. Programar el kill para cuando el usuario haya scrolleado al menos un viewport más allá del final del pin.

```typescript
// El kill se dispara cuando el scroll supera triggerEnd + 1 viewport
const safeKillPoint = self.end + window.innerHeight;

const killTrigger = ScrollTrigger.create({
  trigger: document.body,
  start: () => `top+=${safeKillPoint}px top`,
  once: true,
  onEnter: () => {
    // En este punto la sección está al menos 100vh por encima
    // → completamente invisible → el reposicionado no se nota

    const targetScroll = window.scrollY - pinSpacerHeight;

    self.kill();
    window.scrollTo(0, targetScroll); // Síncrono
    ScrollTrigger.refresh(); // Recalcular layout
    lenis?.scrollTo(targetScroll, { immediate: true }); // Sync
  },
});
```

### Por qué funciona

1. Cuando `onLeave` se dispara, NO hacemos nada
2. El usuario sigue scrollando...
3. Cuando llega a `triggerEnd + 1 viewport`, la sección está ~100vh por encima del viewport 4.完全 invisible para el usuario
4. El kill + reposicionado ocurre → el usuario no lo ve

---

## 18. Bio: texto sin doodles mientras se hace scroll

### El problema

Todos los doodles se animaban con el pinned scroll. Mientras el usuario leía el texto de la Bio, no había doodles visibles — se veían después, durante el pin.

### Por qué pasaba

Los doodles dependían 100% del pinned scroll. El usuario veía:

1. Texto aparece
   2.Hace scroll...
2. Recién ahí aparecían los doodles

### La solución: Split Doodles

Dividir los doodles en dos grupos:

| Grupo     | Doodles                          | Cuándo se animan         |
| --------- | -------------------------------- | ------------------------ |
| A (early) | quotesOpen, crossFun, fun        | Con el texto (`top 85%`) |
| B (pin)   | wave, heart, circle, quotesClose | Con el pinned scroll     |

```typescript
// ── GRUPO A: early doodles (con el texto) ──
const earlyTl = gsap.timeline({ paused: true });
// ... configs para quotesOpen, crossFun, fun

ScrollTrigger.create({
  trigger: textContainerRef.value,
  start: 'top 85%',
  once: true,
  onEnter: () => earlyTl.play(),
});

// ── GRUPO B: pin doodles ──
const doodleTl = gsap.timeline({ paused: true });
// ... configs para wave, heart, circle, quotesClose

createPinnedScroll({
  trigger: sectionRef.value,
  phases: [{ timeline: doodleTl, start: 0, end: 1 }],
});
```

### Resultado

- El usuario ve los doodles "early" mientras lee
- Los doodles "pin" aparecen durante el scroll
- Nunca hay un estado de "texto sin doodles"

---

## Siguiente lectura

- [01 - Arquitectura General](./01-arquitectura-general.md) — Visión global
- [02 - Animaciones Scroll](./02-animaciones-scroll.md) — GSAP + ScrollTrigger
- [03 - Composables](./03-composables.md) — Funciones reutilizadas
