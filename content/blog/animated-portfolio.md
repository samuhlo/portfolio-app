---
title: Cómo animé el portfolio con GSAP, Lenis y Matter.js
description: Meter GSAP, Lenis y Matter.js en un portfolio con Nuxt SSR sonaba muy bien hasta que empezaron los problemas de timing, scroll y performance. Aquí cuento qué me funcionó y qué no.
date: "2026-03-14"
category: breakdown
topics: ["GSAP", "Lenis", "Matter.js", "Vue", "Nuxt", "animaciones", "performance"]
time_to_read: 11
published: true
slug: animated-portfolio
---

## Quería que el portfolio tuviera peso

Llevaba tiempo con ganas de meterme en serio con GSAP, Lenis y Matter.js. Había hecho pruebas sueltas, pero me faltaba un sitio real donde juntarlas sin convertir un proyecto de cliente en un laboratorio. El portfolio era perfecto para eso: si me pegaba una leche, la leche era mía.

No buscaba solo una web bonita. Quería que se sintiera viva de verdad. Que el scroll tuviera inercia, que el hero no entrara como cualquier landing, que algunas letras parecieran objetos y no texto plano, y que los doodles diesen la sensación de estar trazándose en ese momento.

Sobre el papel sonaba bien. En Nuxt con SSR, tres librerías de este tipo juntas se pueden convertir rápido en un jaleo de timings, listeners que se quedan vivos, scroll desincronizado y rendimiento mediocre en móvil.

Aquí no voy a pegar el código real entero porque sería infumable. Lo que sí hago es contar las decisiones que tomé, los problemas concretos que me encontré y el tipo de snippets simplificados que me habría gustado leer antes de ponerme con ello.

---

## GSAP fue la base, pero la clave estaba en la limpieza

GSAP mueve prácticamente todo el portfolio. ScrollTrigger para las animaciones ligadas al scroll y SplitText para tratar el texto letra a letra. El punto de partida es el típico:

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)
```

Lo fácil era arrancar la primera animación. Lo que me dio guerra fue otra cosa: no dejar basura al desmontar componentes. En una SPA eso pasa sin hacer mucho ruido. Vas navegando, montas un componente, luego otro, luego vuelves, y si no limpias bien, los triggers siguen ahí aunque el DOM ya no exista.

`gsap.context()` me arregló justo eso. Agrupa todo lo que se crea dentro y luego lo revierte de golpe cuando el componente desaparece. En Vue queda bastante limpio si lo empaquetas en un composable:

```typescript
// useGSAP.ts
import { onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const useGSAP = () => {
  let ctx: gsap.Context | null = null

  const initGSAP = (callback: () => void, scope?: Element | string) => {
    ctx = gsap.context(callback, scope)
    return ctx
  }

  onUnmounted(() => {
    ctx?.revert()
  })

  return { gsap, ScrollTrigger, initGSAP }
}
```

Luego, en cada componente, todo lo que caiga dentro de `initGSAP()` queda bajo control:

```typescript
const { gsap, initGSAP } = useGSAP()
const boxRef = ref<HTMLElement | null>(null)

onMounted(() => {
  initGSAP(() => {
    gsap.from(boxRef.value, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, boxRef.value ?? undefined)
})
```

Hubo otro detalle más tonto, pero muy de móvil: la barra del navegador aparece y desaparece, cambia `window.innerHeight` y ScrollTrigger interpreta eso como un resize. El resultado eran pequeños temblores y recálculos constantes mientras el usuario hacía scroll.

Aquí me salvó una línea:

```typescript
ScrollTrigger.config({ ignoreMobileResize: true })
```

Parece una tontería, pero quitó bastante ruido. Sigue recalculando cuando toca de verdad, como en un cambio de orientación, pero deja de reaccionar a cada movimiento mínimo del viewport.

---

## Lenis y GSAP solo van finos si comparten reloj

Lenis me interesaba por una razón simple: quería smooth scroll sin esa sensación de plugin pegado encima. El problema es que Lenis y GSAP, si los dejas a su aire, cada uno intenta marcar su ritmo. Uno lleva su `requestAnimationFrame`, el otro su ticker, y la diferencia puede ser pequeña, pero se nota.

La forma más limpia que encontré fue desactivar el loop interno de Lenis y colgarlo del ticker de GSAP. Así todo corre en el mismo frame:

```typescript
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const lenis = new Lenis({ autoRaf: false })

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)
```

`autoRaf: false` evita que Lenis cree su propio loop. Luego GSAP le va pasando el tiempo en cada frame, y `lagSmoothing(0)` quita una capa extra de suavizado que aquí no me interesaba. A partir de ahí, scroll y triggers empezaron a ir acompasados de verdad.

En Nuxt esto vive mejor en un plugin client-side para que la instancia de Lenis quede disponible en toda la app:

```typescript
// plugins/lenis.client.ts
export default defineNuxtPlugin(() => {
  const lenis = new Lenis({ autoRaf: false })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  return {
    provide: { lenis }
  }
})
```

### El navbar dejó de hacer cosas raras cuando dejé de forzarlo

El navbar se esconde al bajar y reaparece al subir. Nada especialmente original. Mi primera implementación lo resolvía con ScrollTrigger y `onUpdate`. Funcionaba casi siempre. El problema era ese “casi”. En la primera carga, antes de que Lenis estuviera del todo asentado, el navbar a veces desaparecía solo.

La salida fue más simple que la idea original: escuchar directamente el evento `scroll` de Lenis y olvidarme del trigger para este caso.

```typescript
const { $lenis } = useNuxtApp()

const showAnim = gsap.from(navEl, {
  yPercent: -100,
  duration: 0.35,
  ease: 'power2.out',
  paused: true
}).progress(1)

$lenis?.on('scroll', ({ scroll, direction }) => {
  if (direction === 1 && scroll > 80) {
    showAnim.reverse()
  } else if (direction === -1) {
    showAnim.play()
  }
})
```

Ese `scroll > 80` fue importante. Sin él, cualquier microgesto cerca del top escondía el navbar y quedaba bastante cutre.

---

## El hero se montó en tres capas

La parte más vistosa del portfolio está en el hero. El título arranca como “SAMUEL LOPEZ” y, al hacer scroll, algunas letras se desploman, el hueco se recoloca y aparece una `h` dibujada a mano hasta acabar en “SAMUh.LO”.

::blog-media
---
src: blog/animated-portfolio/samuhlo_intro_2.mp4
caption: Animación del hero, letras cayendo y la "h" dibujada a mano
maxWidth: 80%
align: center
---
::

Lo dividí en tres piezas porque, si no, aquello se volvía inmanejable muy rápido.

### HeroTitle: las letras que caen

Cada letra que tenía que desaparecer vive en su propio `<span>` con `ref`. También hay un wrapper que empieza con ancho cero y luego hace sitio para la `h` dibujada.

```html
<div class="inline-flex items-baseline">
  <span>S</span><span>A</span><span>M</span><span>U</span>
  <span ref="letraE1">E</span>
  <span ref="letraL1">L</span>
  <span ref="espacio">&nbsp;</span>

  <span ref="hWrap" style="width: 0; overflow: visible">
    <DoodleH ref="doodleH" style="opacity: 0" />
  </span>

  <span>L</span><span>O</span>
  <span ref="letraP">P</span>
  <span ref="letraE2">E</span>
  <span ref="letraZ">Z</span>
</div>
```

El timeline hace cuatro cosas: un pequeño desequilibrio, la caída, el colapso del hueco original y, al final, el dibujo de la `h`.

```typescript
const tl = gsap.timeline({ paused: true })

tl.to(fallingLetters, {
  y: '-10px',
  rotation: (i) => [-8, 12, 0, -15, 8, -12][i],
  duration: 0.25,
  ease: 'power2.out',
  stagger: 0.02
})

tl.to(fallingLetters, {
  y: '120vh',
  rotation: (i) => [-40, 60, 0, -80, 50, -70][i],
  duration: 0.7,
  ease: 'power3.in',
  stagger: 0.04
}, '-=0.1')

tl.to(fallingLetters, {
  width: 0,
  opacity: 0,
  duration: 0.5
})
  .to(hWrapRef, {
    width: '0.85em',
    duration: 0.5
  }, '<')

tl.to(hPaths, {
  strokeDashoffset: 0,
  visibility: 'visible',
  duration: 0.85,
  ease: 'power2.inOut'
})
```

El detalle importante aquí es que el hueco está medido en `em`, no en píxeles. Parece poca cosa, pero hizo que escalara solo con el tamaño del título y me quitó bastante trabajo entre desktop y móvil.

### HeroSubtitle: el texto tachado y los doodles

Mientras el título hace lo suyo, el subtítulo entra por otro lado. Aparece “Front-end Developer”, se tacha y alrededor van entrando palabras dibujadas a mano. Cada una es un SVG animado con la misma técnica de `strokeDashoffset` que luego reutilicé por todo el proyecto.

### HeroSection: un solo trigger mandando sobre todo

Lo que más me compensó aquí fue no tener varios ScrollTriggers peleándose. Tanto `HeroTitle` como `HeroSubtitle` exponen su timeline con `defineExpose`, y luego el contenedor principal reparte el progreso del scroll entre ambos.

```typescript
// HeroTitle.vue
defineExpose({ getTimeline: () => titleTimeline })

// HeroSubtitle.vue
defineExpose({ getTimeline: () => subtitleTimeline })
```

```typescript
const titleTl = heroTitleRef.value?.getTimeline()
const subtitleTl = heroSubtitleRef.value?.getTimeline()

createPinnedScroll({
  trigger: pinWrapperRef.value,
  start: 'top top',
  end: '+=2500',
  phases: [
    { timeline: titleTl, start: 0, end: 0.6 },
    { timeline: subtitleTl, start: 0.6, end: 1 }
  ]
})
```

Un trigger, dos timelines y una progresión bastante fácil de afinar. Para una animación tan cargada, eso me dio mucho más control que repartir la responsabilidad entre varios triggers independientes.

---

## El pin-spacer fue el mayor problema de UX

Aquí fue donde más me paré. No por dificultad técnica pura, sino porque la experiencia resultante era mala.

Cuando GSAP pinea una sección crea un :hand-drawn{svg="/blog/doodles/blog_medium_circle.svg" placement="around"}[pin-spacer] que conserva el hueco vertical mientras dura la animación. Si esa animación consume 2500px de scroll, ese hueco también existe al volver hacia arriba. Y ahí viene lo feo: el usuario se come todo el rebobinado de la animación al revés.

Ese comportamiento me molesta bastante en otras webs, así que no quería dejarlo tal cual. Matar el trigger justo en `onLeave` parecía la respuesta obvia, pero lo probé y producía un micro-salto visible porque la sección todavía estaba demasiado cerca del viewport.

La solución buena fue esperar más. Bastante más. Hasta que el usuario hubiera pasado al menos otro viewport completo por debajo de la sección. En ese punto ya no se veía nada del hero y podía recolocar el scroll sin cantar demasiado.

```typescript
ScrollTrigger.create({
  trigger: pinElement,
  start: 'top top',
  end: '+=2500',
  pin: true,

  onLeave: (self) => {
    const pinSpacerHeight = self.end - self.start
    const safePoint = self.end + window.innerHeight

    ScrollTrigger.create({
      trigger: document.body,
      start: () => `top+=${safePoint}px top`,
      once: true,

      onEnter: () => {
        const scrollNow = window.scrollY
        const targetScroll = scrollNow - pinSpacerHeight

        self.kill()
        window.scrollTo(0, targetScroll)
        ScrollTrigger.refresh()
        lenis?.scrollTo(targetScroll, { immediate: true })
      }
    })
  }
})
```

Aquí el orden importa bastante. Primero desaparece el trigger principal, luego compenso el scroll en el mismo frame, después refresco ScrollTrigger y al final sincronizo Lenis. Si cambias el orden, vuelven los saltos o aparece desajuste entre el scroll real y el interno de Lenis.

El resultado es mucho más limpio: una vez vista la animación, esa parte se comporta como HTML estático. Puedes volver arriba rápido sin tragarte el hero marcha atrás.

### En móvil dejé de insistir con el scroll-driven

Hice una prueba con gente usando el portfolio en móvil y la conclusión fue bastante clara: nadie estaba “jugando” con el scroll del hero. Simplemente hacían swipe y seguían bajando. La animación, si dependía demasiado del gesto, quedaba a medias o pasaba sin pena ni gloria.

Ahí no tenía sentido empeñarme. En móvil cambié a autoplay:

```typescript
const isMobile = window.matchMedia('(max-width: 768px)').matches

if (isMobile) {
  const masterTl = gsap.timeline({ paused: true })
  phases.forEach((phase) => masterTl.add(phase.timeline.play(), '>'))
  masterTl.timeScale(1.8)

  setTimeout(() => masterTl.play(), 1200)

  ScrollTrigger.create({
    trigger: element,
    start: 'top 60%',
    onEnter: () => masterTl.play(),
    once: true
  })
}
```

En desktop tiene sentido que el usuario controle el ritmo con el scroll. En móvil, no siempre. A veces hay que dejar de perseguir la idea bonita y adaptarse a cómo usa la gente la página de verdad.

---

## Matter.js entró para que el contacto no fuera solo decorado

Si iba a meter física, quería que se notara. La sección de contacto tiene el texto “CONTACT” cayendo con rebote, rotación y gravedad real. Y al hacer click, todo sale disparado hacia arriba.

::blog-media
---
src: blog/animated-portfolio/contact_section_2.mp4
caption: Sección Contact, letras con física Matter.js
maxWidth: 80%
align: center
---
::

La base aquí es bastante directa: un motor de Matter.js para calcular la física y un canvas para dibujar. Uno piensa, el otro pinta.

```typescript
import { Engine, Runner, Bodies, World, Body } from 'matter-js'

const engine = Engine.create({ gravity: { x: 0, y: 4.5 } })
const runner = Runner.create()

World.add(engine.world, [
  Bodies.rectangle(W / 2, H + 100, W * 2, 200, { isStatic: true }),
  Bodies.rectangle(-100, H / 2, 200, H * 4, { isStatic: true }),
  Bodies.rectangle(W + 100, H / 2, 200, H * 4, { isStatic: true })
])

const letterBody = Bodies.rectangle(x, spawnY, letterWidth, letterHeight, {
  restitution: 0.25,
  friction: 0.9,
  frictionAir: 0.015,
  density: 0.005
})

Body.setVelocity(letterBody, { x: (Math.random() - 0.5) * 4, y: 0 })
Body.setAngularVelocity(letterBody, (Math.random() - 0.5) * 0.15)

World.add(engine.world, letterBody)
Runner.run(runner, engine)

const draw = () => {
  ctx.clearRect(0, 0, W, H)

  for (const { body, char } of letterBodies) {
    ctx.save()
    ctx.translate(body.position.x, body.position.y)
    ctx.rotate(body.angle)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }

  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
```

Matter.js no dibuja nada por ti. Solo calcula. Y eso, para este caso, me venía perfecto porque el control visual lo quería llevar yo entero desde el canvas.

::code-preview
---
height: 350
maxWidth: 850px
align: center
html: |
  <canvas id="c"></canvas>
  <p id="hint">click para lanzar</p>
css: |
  body {
    margin: 0;
    background: #0c0011;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
  }
  canvas { display: block; border: 1px solid rgba(255,255,255,0.06); }
  #hint {
    font-family: monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin: 0;
  }
js: |
  const W = 380, H = 240;
  const canvas = document.getElementById('c');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const { Engine, Runner, Bodies, World, Body } = Matter;
  const engine = Engine.create({ gravity: { x: 0, y: 2 } });

  World.add(engine.world, [
    Bodies.rectangle(W / 2, H + 25, W * 2, 50, { isStatic: true }),
    Bodies.rectangle(-25, H / 2, 50, H * 2, { isStatic: true }),
    Bodies.rectangle(W + 25, H / 2, 50, H * 2, { isStatic: true }),
  ]);

  const R = 22;
  const ball = Bodies.circle(W / 2, R + 10, R, {
    restitution: 0.65,
    friction: 0.3,
    frictionAir: 0.01,
  });
  World.add(engine.world, ball);
  Runner.run(engine);

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0c0011';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,202,64,0.12)';
    ctx.fillRect(0, H - 3, W, 3);

    const shadowAlpha = Math.max(0, 0.25 - (ball.position.y / H) * 0.25);
    const shadowW = R * 2 * (1 - ball.position.y / H * 0.4);
    ctx.beginPath();
    ctx.ellipse(ball.position.x, H - 3, Math.max(4, shadowW), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,202,64,${shadowAlpha})`;
    ctx.fill();

    const { x, y } = ball.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ball.angle);
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffca40';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R * 0.75, 0);
    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(draw);
  };
  draw();

  canvas.addEventListener('click', () => {
    Body.setVelocity(ball, {
      x: (Math.random() - 0.5) * 10,
      y: -(14 + Math.random() * 8),
    });
  });
---
::

### En móvil no cabía, así que hubo que partirlo

“CONTACT” en una sola fila no entraba bien en móvil si quería mantener un tamaño decente. Lo dividí en dos líneas: `CON` y `TACT`. Y como no quería que chocaran de forma rara, hice que la segunda fila cayera primero y la primera llegara después.

```typescript
if (isMobile) {
  spawnRow(rowBottom, W, -(letterHeight / 2), staggerDelay)

  const topSpawnY = -(
    letterHeight / 2 +
    rowBottom.length * staggerDelay +
    fontSize * 1.8
  )

  spawnRow(rowTop, W, topSpawnY, staggerDelay)
}
```

También subí la gravedad en móvil a `8.5`. No por realismo, sino por tiempo de atención: si las letras tardaban demasiado en asentarse, la gente ya se había ido a la siguiente sección.

### La física no arranca hasta que toca

No tenía ningún sentido tener Matter.js corriendo cuando esa sección ni siquiera estaba en pantalla. Lo activé con `IntersectionObserver` y, además, lo pausé y reanudé según visibilidad.

```typescript
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !triggered) {
      triggered = true

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncCanvasSize()
          initPhysics(canvas, 'CONTACT')
        })
      })
    } else if (triggered) {
      entry.isIntersecting ? resume() : pause()
    }
  }
}, {
  threshold: [0, 0.4]
})
```

Ese doble `requestAnimationFrame` es uno de esos trucos pequeños que te ahorran bugs absurdos con canvas y layout. El primero deja que el navegador pinte. El segundo deja que el tamaño real del elemento se asiente antes de calcular nada serio.

### El slam era la parte divertida

Cuando el usuario hace click en la sección o en el email, las letras salen despedidas. Aquí no había demasiada ciencia: velocidad aleatoria hacia arriba, algo de rotación y que Matter.js haga el resto.

```typescript
const slam = () => {
  for (const { body } of letterBodies) {
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 8,
      y: -(15 + Math.random() * 10)
    })
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
  }
}
```

Simple, sí. Pero es de esas interacciones que hacen que la sección deje de ser solo una animación de fondo y pase a responder al usuario.

---

## Los doodles eran visuales, pero el trabajo real estaba en el SVG

Por todo el portfolio hay subrayados, círculos, tachones y palabras dibujadas a mano. Los hice en Affinity y los exporté como SVG porque quería que el trazo tuviera un punto más torpe y menos perfecto que cualquier icono generado a toda prisa.

::image-slider
---
maxWidth: 850px
align: center
images:
  - src: blog/animated-portfolio/doodles_letras.jpg
    alt: Doodles letras
    label: Doodles de titulos
  - src: blog/animated-portfolio/doodles_details.jpg
    alt: Doodles detalles
    label: Doodles de detalles
---
::

La técnica para “dibujar” un path en tiempo real no tiene misterio nuevo. Es la clásica de `strokeDasharray` y `strokeDashoffset`. Lo interesante no era descubrirla, sino llevarla bien a SSR, a varios SVGs distintos y a componentes reutilizables.

::code-preview
---
height: 350
maxWidth: 850px
align: center
html: |
  <div class="scene">
    <svg id="doodle" viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="p1"
        d="M10,70 C30,20 60,80 100,40 C130,10 150,75 190,45 C220,20 250,65 280,38 C295,28 305,50 312,42"
        stroke="#ffca40" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <button id="btn">replay</button>
  </div>
css: |
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 2rem;
    background: #0c0011;
  }
  svg { width: 320px; }
  button {
    font-family: monospace;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: none;
    border: 1.5px solid #faf3f0;
    padding: 0.5rem 1.4rem;
    color: #faf3f0;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  button:hover { background: #faf3f0; color: #0c0011; }
js: |
  const path = document.getElementById('p1');
  const length = path.getTotalLength() + 20;

  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  const draw = () =>
    gsap.to(path, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' });

  draw();

  document.getElementById('btn').addEventListener('click', () => {
    gsap.set(path, { strokeDashoffset: length });
    draw();
  });
---
::

### El detalle que me fastidió: los caps redondeados

Cuando el path tiene `stroke-linecap: round`, el extremo redondeado sobresale un poco. Si calculas la longitud exacta y animas desde ahí, a veces aparece un puntito antes de tiempo. Me pasó varias veces hasta que dejé de pelearme y le sumé un pequeño margen:

```typescript
const preparePaths = (svgEl: SVGElement) => {
  const paths = svgEl.querySelectorAll('path')

  paths.forEach((path) => {
    const length = path.getTotalLength() + 20
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`
    path.style.visibility = 'hidden'
  })

  return paths
}
```

Ese `+20` era justo lo que necesitaba para que no asomara nada antes de empezar la animación.

### El flash de SSR también apareció aquí

En SSR el HTML inicial llega con los paths visibles. Si esperas a que Vue hidrate y entonces aplicas los `gsap.set()`, durante un instante el SVG se ve entero. Un flash pequeño, pero suficiente para estropear el efecto.

La forma más limpia que encontré fue ocultar primero el SVG completo y luego preparar los paths.

```typescript
const preparePaths = (svgEl: SVGElement) => {
  gsap.set(svgEl, { opacity: 0 })

  const paths = svgEl.querySelectorAll('path')
  // ... preparar longitudes y offsets
}
```

Y cuando toca dibujarlo, lo hago visible en el primer frame del timeline:

```typescript
tl.to(svgEl, { opacity: 1, duration: 0.01 })
tl.to(paths, {
  strokeDashoffset: 0,
  visibility: 'visible',
  duration
})
```

### Pasarlo a componente Vue me ahorró repetir código por todas partes

Acabé montando un script que transforma los SVG exportados en componentes Vue con `ref` expuesta. Así el composable que anima doodles puede acceder al elemento real del DOM sin romper la encapsulación a martillazos.

```vue
<script setup>
import { ref } from 'vue'

const svgRef = ref<SVGSVGElement | null>(null)
defineExpose({ svg: svgRef })
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2,10 Q100,2 198,10"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>
```

Usar `currentColor` en vez de un color fijo también vino bien. Así los doodles heredan el color del contexto y no tengo que mantener variantes duplicadas para fondo oscuro y claro.

---

## Para que todo esto no petara, no hubo una bala de plata

El rendimiento no salió de una optimización milagrosa. Salió de varias decisiones pequeñas, bastante poco glamurosas, que juntas hicieron que la página no se viniera abajo.

Ya he comentado `ignoreMobileResize`, que quitó recálculos absurdos en móvil. Pero hubo más.

### Matter.js: pausar y reanudar es mejor que destruir

En la sección de contacto no destruyo el motor cada vez que sale del viewport. Lo pauso. Recrearlo continuamente sale más caro que dejarlo listo para volver.

```typescript
const pause = () => {
  Runner.stop(runner)
  cancelAnimationFrame(rafId)
  rafId = null
}

const resume = () => {
  Runner.run(runner, engine)
  rafId = requestAnimationFrame(draw)
}
```

Con `IntersectionObserver` basta para decidir cuándo hay que parar y cuándo volver a arrancar.

### En la 404 corté la física en cuanto ya no aportaba nada

La página 404 también usa física para el número. Una vez que cae, rebota un poco y se queda quieto, seguir calculando frames es malgastar CPU. Ahí metí una detección simple de asentamiento.

```typescript
let settleCount = 0

const draw = () => {
  const speed = body.speed + Math.abs(body.angularSpeed)

  if (speed < 0.05) {
    settleCount++
    if (settleCount >= 60) {
      Runner.stop(runner)
      return
    }
  } else {
    settleCount = 0
  }

  rafId = requestAnimationFrame(draw)
}
```

Si pasa alrededor de un segundo prácticamente quieto, se para todo. Visualmente el usuario no pierde nada y la página deja de trabajar en segundo plano.

### El resize va con debounce

Redimensionar la ventana dispara un montón de cálculos: canvas, offsets, triggers. Si reaccionas a cada pixel de cambio, acabas rehaciendo trabajo constantemente.

```typescript
let resizeTimer: ReturnType<typeof setTimeout> | null = null

window.addEventListener('resize', () => {
  if (resizeTimer)
    clearTimeout(resizeTimer)

  resizeTimer = setTimeout(() => {
    rebuildPhysics()
    ScrollTrigger.refresh()
  }, 300)
})
```

Para la física, además, solo reinicializo si el ancho cambia de verdad. Si la variación es mínima, la ignoro:

```typescript
const newWidth = container.clientWidth
if (Math.abs(newWidth - prevWidth) < 50) return
```

No es una técnica brillante. Es simplemente poner un límite sensato y no recalcular por deporte.

---

## Lo que repetiría y lo que no

Sí, valió la pena. Pero no porque todo saliera rodado, sino justo porque me obligó a resolver problemas que en demos pequeñas no aparecen.

GSAP me sigue pareciendo la pieza más sólida del conjunto. La documentación es buena, los errores suelen ser bastante legibles y `gsap.context()` encaja muy bien con Vue cuando quieres mantener las cosas limpias. Lenis requiere dejar bien cerrado el tema del loop y de la sincronización, pero una vez montado no da demasiada guerra.

Matter.js me sorprendió para bien. Es bastante directo para este tipo de efectos: motor, cuerpos, mundo y un canvas que dibuja lo que toca. Sin demasiada magia. Y los doodles siguen siendo probablemente la parte más personal de todo el portfolio. La técnica es vieja, sí, pero pasar trazos hechos a mano a componentes reutilizables le da un punto que habría sido difícil sacar de una solución más genérica.

Si lo rehaciera hoy, revisaría un poco mejor el scroll horizontal, porque lleva su propia instancia de Lenis y eso obliga a ir con cuidado para que no se cruce con la global. Y también me volvería a preguntar si toda la complejidad del hero necesita exactamente ese sistema de pinning o si ahora sería capaz de conseguir algo parecido con menos piezas.

Pero vamos, no me arrepiento. El resultado se siente bastante cercano a lo que quería desde el principio: una web que no solo se mueve, sino que parece construida con intención.
