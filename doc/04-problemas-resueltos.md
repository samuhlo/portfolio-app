# Problemas resueltos y lecciones aprendidas

> Todo lo que rompimos, entendimos y arreglamos durante la implementación de las animaciones pinned scroll + Lenis.

---

## Índice de problemas

| #   | Problema                                    | Solución final                          |
| :-- | :------------------------------------------ | :-------------------------------------- |
| 1   | Animaciones se deshacen al scrollear arriba | Flags `completed[]` unidireccionales    |
| 2   | Salto brusco al terminar el pin             | `lenis.scrollTo()` con compensación     |
| 3   | `window.scrollTo` no funciona con Lenis     | `lenis.scrollTo({ immediate: true })`   |
| 4   | Tilt/glitch al eliminar pin-spacer          | Matar en `onLeave` (sección off-screen) |
| 5   | BioSection roto tras refactor               | `ScrollTrigger.refresh()` post-kill     |
| 6   | Scroll horizontal en el Hero                | `overflow-x: clip` (no `hidden`)        |
| 7   | `overflow-x: hidden` crea doble scroll      | Diferencia entre `hidden` y `clip`      |
| 8   | Código duplicado en Hero y Bio              | Composable `usePinnedScroll`            |
| 9   | Efecto TV Grain de Canvas consume mucha CPU | Reescritura usando Canvas oculto + rAF  |

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

## Checklist para futuras secciones pineadas

Cuando quieras añadir una nueva sección con pin + animaciones:

- [ ] Crear los timelines con `paused: true`
- [ ] Usar `useDoodleDraw` si hay SVGs
- [ ] Llamar a `createPinnedScroll()` con las fases
- [ ] Poner `overflow-x: clip` en el wrapper si hay contenido que sobresale
- [ ] Testear con scroll rápido y scroll lento
- [ ] Testear subir y bajar después de completar la animación
- [ ] Verificar que no hay scroll horizontal en móvil
