---
title: Cómo animé mi portfolio con GSAP, Lenis y Matter.js
description: Las decisiones técnicas detrás de animar un portfolio con GSAP, Lenis smooth scroll y física real con Matter.js en Nuxt SSR — incluyendo los problemas concretos y cómo los resolví.
date: "2026-03-12"
category: breakdown
topics: ["GSAP", "Lenis", "Matter.js", "Vue", "Nuxt", "animaciones", "performance"]
time_to_read: 12
published: true
slug: animated-portfolio
---

## ¿Por qué tres librerías para un portfolio?

La respuesta honesta es que llevaba tiempo con ganas de pelearme con ellas.

GSAP, Lenis, Matter.js. No las elegí porque las vi en un tutorial de YouTube ni porque estuvieran de moda en Twitter ese mes. Las llevaba investigando un tiempo, había hecho pruebas sueltas, y el portfolio me pareció el contexto perfecto para meterlas en serio. Si algo salía mal, el único perjudicado era yo.

La apuesta era clara: quería un portfolio que se sintiera vivo. No solo bonito — vivo. Que tuviera peso, que las cosas se movieran con intención, que al hacer scroll pasara algo que valiera la pena. Eso implica animaciones de entrada, scroll suave de verdad, física real, y elementos dibujados a mano que aparecen como si alguien los estuviera trazando en ese momento.

El riesgo también era claro. Tres librerías de animación en una sola web SSR con Nuxt pueden convertirse en un desastre de performance, de timing, de conflictos entre ellas. Y spoiler: hubo momentos en los que fue exactamente eso.

En este artículo cuento cómo lo resolví. No el código completo del proyecto — eso sería ilegible — sino las decisiones técnicas, los problemas concretos que aparecieron, y versiones simplificadas del código para ilustrar cada concepto. Si usas Vue, Nuxt o simplemente GSAP en cualquier framework, debería serte útil.

Empecemos.

---

## 1. La base: GSAP y cómo no liarte con la limpieza

GSAP es el motor de todo. ScrollTrigger para las animaciones vinculadas al scroll, SplitText para manipular texto letra a letra. Lo primero que hay que hacer es registrar los plugins:

```javascript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)
```

Pero registrarlos a nivel global en un proyecto Vue/Nuxt tiene una trampa: si creas animaciones o ScrollTriggers dentro de componentes y no los limpias al desmontarlos, se acumulan. Memoria que no se libera, triggers que siguen escuchando aunque el componente ya no exista.

La solución de GSAP para esto es `gsap.context()`. Es como un :hand-drawn{svg="/blog/doodles/blog_small_underline.svg"}[sandbox] — todas las animaciones que crees dentro de él se agrupan bajo un mismo paraguas, y cuando llamas a `.revert()`, desaparecen todas de golpe.

En Vue esto queda muy limpio con un composable:

```javascript
// useGSAP.js
import { onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const useGSAP = () => {
  let ctx = null

  const initGSAP = (callback, scope) => {
    ctx = gsap.context(callback, scope)
    return ctx
  }

  onUnmounted(() => {
    ctx?.revert() // limpia todo al desmontar
  })

  return { gsap, ScrollTrigger, initGSAP }
}
```

Cada componente que necesita animaciones llama a `initGSAP()` pasándole un callback. Todo lo que se cree dentro de ese callback — tweens, ScrollTriggers, timelines — queda registrado en el contexto y se destruye automáticamente cuando el componente sale del DOM.

```javascript
// En cualquier componente
const { gsap, initGSAP } = useGSAP()
const boxRef = ref(null)

onMounted(() => {
  initGSAP(() => {
    gsap.from(boxRef.value, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, boxRef.value) // scope opcional: limita los selectores CSS al elemento
})
```

Hay un detalle más que me costó descubrir. En móvil, cuando el usuario hace scroll, la barra de navegación del navegador (Safari, Chrome) aparece y desaparece. Eso cambia el `window.innerHeight` y ScrollTrigger lo interpreta como un resize, recalculando todos los triggers. El resultado: parpadeos y saltos cada vez que el usuario mueve el dedo.

La solución es una sola línea:

```javascript
ScrollTrigger.config({ ignoreMobileResize: true })
```

Con esto, los cambios de tamaño menores en móvil se ignoran. Las posiciones de los triggers se calculan con el tamaño inicial y ya no hay temblores.

> `ignoreMobileResize` solo ignora cambios pequeños de viewport. Un giro de pantalla de vertical a horizontal sí provoca un recálculo, que es lo correcto.

---

## 2. Lenis — scroll suave sin pelearse con GSAP

Lenis es una librería de smooth scroll. Lo que hace es interceptar el scroll nativo y reemplazarlo por uno interpolado, dándole esa sensación fluida y física de que la página tiene inercia.

El problema con Lenis + GSAP es que cada uno quiere llevar el ritmo. GSAP tiene su propio loop de animación (el ticker), y Lenis tiene el suyo (requestAnimationFrame). Si los dejas correr por separado, el scroll de Lenis y los ScrollTriggers de GSAP van ligeramente desincronizados. En pantallas de 120hz se nota.

La solución es obligar a Lenis a usar el ticker de GSAP en lugar del suyo:

```javascript
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// autoRaf: false → Lenis no crea su propio loop
const lenis = new Lenis({ autoRaf: false })

// Sincronizar ScrollTrigger con cada evento de scroll de Lenis
lenis.on('scroll', ScrollTrigger.update)

// Conectar Lenis al ticker de GSAP
gsap.ticker.add((time) => {
  lenis.raf(time * 1000) // GSAP da segundos, Lenis espera milisegundos
})

// Sin interpolación extra del ticker de GSAP
gsap.ticker.lagSmoothing(0)
```

Con `autoRaf: false` le dices a Lenis "tú no manejes tu propio loop". Luego lo conectas al ticker de GSAP pasándole el tiempo en cada frame. Y con `lagSmoothing(0)` eliminas una interpolación extra que GSAP aplica cuando detecta lag — útil en general, pero aquí introduce una capa más de suavizado que no queremos.

El resultado es que Lenis y ScrollTrigger comparten exactamente el mismo frame. :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Cero desincronía].

En Nuxt, esto vive en un plugin client-side para que solo se ejecute en el navegador y la instancia de Lenis esté disponible globalmente:

```javascript
// plugins/lenis.client.js
export default defineNuxtPlugin(() => {
  const lenis = new Lenis({ autoRaf: false })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  return {
    provide: { lenis } // disponible como $lenis en cualquier componente
  }
})
```

### El problema del navbar

El navbar se oculta al hacer scroll hacia abajo y reaparece al subir. Comportamiento estándar. Mi primera implementación usaba un ScrollTrigger con `onUpdate` para detectar la dirección del scroll. Funcionaba bien... excepto en la primera carga.

Al entrar a la página, antes de que el usuario hubiera hecho scroll, el navbar a veces desaparecía solo. El problema era un race condition: Lenis todavía no había emitido eventos de scroll cuando ScrollTrigger intentaba registrar el trigger, y los primeros eventos se perdían o llegaban con un estado incorrecto.

La solución fue escuchar el evento `scroll` de Lenis directamente, sin pasar por ScrollTrigger:

```javascript
const { $lenis } = useNuxtApp()

const showAnim = gsap.from(navEl, {
  yPercent: -100,
  duration: 0.35,
  ease: 'power2.out',
  paused: true
}).progress(1) // empieza en estado "visible"

$lenis?.on('scroll', ({ scroll, direction }) => {
  if (direction === 1 && scroll > 80) {
    showAnim.reverse() // scrollando hacia abajo → ocultar
  } else if (direction === -1) {
    showAnim.play()    // scrollando hacia arriba → mostrar
  }
})
```

El `scroll > 80` previene que el navbar se oculte en micro-scrolls cuando el usuario está en el tope de la página. Sin eso, cualquier toque accidental en el trackpad lo escondía.

> `.progress(1)` en un `gsap.from()` coloca la animación en su estado final. Es un truco limpio para crear una animación reutilizable que empieza "ya completada".

---

## 3. El Hero — letras que caen y una "h" dibujada a mano

La animación principal del hero es esto: el título muestra "SAMUEL LOPEZ" al cargar. Al hacer scroll, las letras E, L, espacio, P, E, Z caen fuera de pantalla. El espacio que ocupaban colapsa. Y en ese hueco aparece una "h" dibujada como con bolígrafo — creando ".SAMUh.LO".

::blog-media
---
src: blog/animated-portfolio/samuhlo_intro_2.mp4
caption: Animación del hero — letras cayendo y la "h" dibujada a mano
maxWidth: 80%
align: center
---
::

La arquitectura tiene tres capas.

**Capa 1: el componente HeroTitle**

Cada letra que va a caer es un `<span>` independiente con `ref`:

```html
<div class="inline-flex items-baseline">
  <span>S</span><span>A</span><span>M</span><span>U</span>
  <span ref="letraE1">E</span>
  <span ref="letraL1">L</span>
  <span ref="espacio">&nbsp;</span>

  <!-- wrapper que crecerá para hacer sitio a la "h" -->
  <span ref="hWrap" style="width: 0; overflow: visible">
    <DoodleH ref="doodleH" style="opacity: 0" />
  </span>

  <span>L</span><span>O</span>
  <span ref="letraP">P</span>
  <span ref="letraE2">E</span>
  <span ref="letraZ">Z</span>
</div>
```

El timeline hace cuatro cosas en secuencia:

```javascript
const tl = gsap.timeline({ paused: true })

// 1. Golpecito inicial — pierden el equilibrio
tl.to(fallingLetters, {
  y: '-10px',
  rotation: (i) => [-8, 12, 0, -15, 8, -12][i],
  duration: 0.25,
  ease: 'power2.out',
  stagger: 0.02
})

// 2. Caída con gravedad
tl.to(fallingLetters, {
  y: '120vh',
  rotation: (i) => [-40, 60, 0, -80, 50, -70][i],
  duration: 0.7,
  ease: 'power3.in',
  stagger: 0.04
}, '-=0.1')

// 3. Colapsar el espacio que ocupaban + abrir hueco para la "h"
tl.to(fallingLetters, { width: 0, opacity: 0, duration: 0.5 })
  .to(hWrapRef, { width: '0.85em', duration: 0.5 }, '<')

// 4. Dibujar la "h" con strokeDashoffset
tl.to(hPaths, {
  strokeDashoffset: 0,
  visibility: 'visible',
  duration: 0.85,
  ease: 'power2.inOut'
})
```

El hueco se mide en `em`, no en píxeles. Eso significa que si el título es enorme en desktop y pequeño en móvil, el hueco escala automáticamente con el font-size. Un detalle que me ahorró mucho trabajo.

**Capa 2: el componente HeroSubtitle**

Mientras el título hace lo suyo, el subtítulo tiene su propio timeline: aparece el texto "Front-end Developer", se tacha con una línea, y alrededor van apareciendo palabras dibujadas a mano — "front", "back", "design", "ux/ui", "ai", "brand". Cada palabra es un SVG dibujado con la técnica de strokeDashoffset que explico en la sección de doodles.

**Capa 3: HeroSection orquesta todo con un único ScrollTrigger**

Aquí está la parte que más me gusta. Ambos componentes exponen su timeline hacia afuera con `defineExpose`:

```javascript
// En HeroTitle.vue
defineExpose({ getTimeline: () => titleTimeline })

// En HeroSubtitle.vue
defineExpose({ getTimeline: () => subtitleTimeline })
```

Y HeroSection los recoge y los pasa a un único ScrollTrigger pineado:

```javascript
const titleTl = heroTitleRef.value?.getTimeline()
const subtitleTl = heroSubtitleRef.value?.getTimeline()

createPinnedScroll({
  trigger: pinWrapperRef.value,
  start: 'top top',
  end: '+=2500',         // 2500px de scroll para completar todo
  phases: [
    { timeline: titleTl,    start: 0,   end: 0.6 }, // primeros 60% del scroll
    { timeline: subtitleTl, start: 0.6, end: 1   }  // últimos 40%
  ]
})
```

El ScrollTrigger controla el progreso de cada timeline según cuánto ha scrollado el usuario. Un solo trigger, dos animaciones, timing preciso. No hay dos ScrollTriggers peleándose.

---

## 4. El PinSpacer fix — la animación que no te obliga a rebobinar

Este fue el problema de UX que más me molestó cuando lo descubrí en otras webs.

Cuando GSAP pinea un elemento — lo fija en pantalla mientras el usuario hace scroll — crea un elemento auxiliar llamado :hand-drawn{svg="/blog/doodles/blog_medium_circle.svg" placement="around"}[pin-spacer]. Este spacer ocupa el espacio vertical del contenido durante todo el tiempo que dura la animación. Si la animación dura 2500px de scroll, el spacer tiene 2500px de alto.

El problema: una vez completada la animación, si el usuario quiere volver al principio de la página, tiene que hacer scroll hacia arriba pasando por esos 2500px. Y mientras lo hace, la animación se reproduce al revés. Las letras "des-caen", el subtítulo se "des-dibuja". Es horrible.

La solución intuitiva es matar el ScrollTrigger en `onLeave` — cuando el usuario termina la animación y sale por abajo. Pero hay un problema: en ese momento la sección acaba de salir del viewport. Está demasiado cerca. Matar el trigger y reposicionar el scroll en ese instante causa un micro-salto visible.

La solución real es esperar más. Esperar a que el usuario haya scrollado al menos un viewport entero más allá de donde terminó la animación. En ese punto la sección está completamente fuera de pantalla, y el reposicionado es invisible.

```javascript
ScrollTrigger.create({
  trigger: pinElement,
  start: 'top top',
  end: '+=2500',
  pin: true,

  onLeave: (self) => {
    // NO matamos aquí. Todavía se vería.
    // Guardamos las medidas que necesitaremos.
    const pinSpacerHeight = self.end - self.start

    // Creamos un segundo trigger que se dispara cuando el scroll
    // supera el final de la animación + 1 viewport completo.
    const safePoint = self.end + window.innerHeight

    ScrollTrigger.create({
      trigger: document.body,
      start: () => `top+=${safePoint}px top`,
      once: true,

      onEnter: () => {
        const scrollNow = window.scrollY
        const targetScroll = scrollNow - pinSpacerHeight

        // 1. Matar el trigger principal (desaparece el pin-spacer)
        self.kill()

        // 2. Reposicionar el scroll en el mismo frame
        window.scrollTo(0, targetScroll)

        // 3. Recalcular todos los triggers con el DOM estabilizado
        ScrollTrigger.refresh()

        // 4. Sincronizar Lenis sin animación
        lenis?.scrollTo(targetScroll, { immediate: true })
      }
    })
  }
})
```

La secuencia importa. Primero se mata el trigger (el pin-spacer desaparece del DOM, el contenido sube). Luego se corrige la posición del scroll síncronamente para compensar exactamente esos píxeles que desaparecieron. Luego se recalculan los triggers con el DOM ya estable. Y por último se sincroniza Lenis, que tiene su propio estado interno de posición de scroll — sin esto, Lenis pensaría que está en una posición diferente a donde realmente está la página.

El resultado: una vez que el usuario ha visto la animación completa y ha seguido scrollando, la sección se convierte en HTML estático. Puede volver arriba a la velocidad que quiera sin rebobinar nada.

### Mobile: autoplay en lugar de scroll-driven

Hice una prueba de campo con gente real mirando el portfolio en móvil. El feedback fue claro: nadie hacía scroll intencionadamente para reproducir la animación del hero. Simplemente swipeaban para bajar y la animación quedaba a medias o no se veía.

La solución fue detectar si el usuario está en móvil y, en ese caso, reproducir las animaciones automáticamente en lugar de vincularlas al scroll:

```javascript
const isMobile = window.matchMedia('(max-width: 768px)').matches

if (isMobile) {
  // Agrupar todas las fases en un timeline maestro
  const masterTl = gsap.timeline({ paused: true })
  phases.forEach(phase => masterTl.add(phase.timeline.play(), '>'))
  masterTl.timeScale(1.8) // un poco más rápido en móvil

  // Hero: autoplay con delay inicial
  setTimeout(() => masterTl.play(), 1200)

  // Otras secciones: cuando entran en viewport
  ScrollTrigger.create({
    trigger: element,
    start: 'top 60%',
    onEnter: () => masterTl.play(),
    once: true
  })
}
```

`timeScale(1.8)` acelera el timeline un 80%. En desktop la animación puede durar lo que quiera porque el usuario la controla con el scroll. En móvil, más corta.

---

## 5. Matter.js — física real para la sección de Contacto

La sección de Contacto tiene el texto "CONTACT" escrito en letras grandes que caen desde arriba con física real — rebote, rotación, gravedad. Si haces click, las letras salen volando hacia arriba.

::blog-media
---
src: blog/animated-portfolio/contact_section_2.mp4
caption: Sección Contact — letras con física Matter.js
maxWidth: 80%
align: center
---
::

Para esto usé Matter.js, un motor de física 2D para el navegador. La idea es sencilla: un canvas encima de la sección, y dentro del canvas un mundo físico con cuerpos rectangulares que representan las letras. El canvas solo dibuja — no tiene nada en el DOM que se pueda seleccionar.

### El setup básico

```javascript
import { Engine, Runner, Bodies, World, Body } from 'matter-js'

// Motor de física con gravedad
const engine = Engine.create({ gravity: { x: 0, y: 4.5 } })
const runner = Runner.create()

// Paredes invisibles: suelo, pared izquierda, pared derecha
World.add(engine.world, [
  Bodies.rectangle(W/2, H + 100, W*2, 200, { isStatic: true }), // suelo
  Bodies.rectangle(-100, H/2, 200, H*4, { isStatic: true }),    // izquierda
  Bodies.rectangle(W+100, H/2, 200, H*4, { isStatic: true }),   // derecha
])

// Crear un cuerpo para cada letra
const letterBody = Bodies.rectangle(x, spawnY, letterWidth, letterHeight, {
  restitution: 0.25, // rebote
  friction: 0.9,
  frictionAir: 0.015,
  density: 0.005
})
Body.setVelocity(letterBody, { x: (Math.random() - 0.5) * 4, y: 0 })
Body.setAngularVelocity(letterBody, (Math.random() - 0.5) * 0.15)

World.add(engine.world, letterBody)
Runner.run(runner, engine)

// Loop de render: cada frame, leer posiciones y pintar en canvas
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

Cada frame se leen las posiciones y ángulos que calcula Matter.js, y se pintan las letras en el canvas en esas coordenadas. Matter.js no sabe nada de renderizado — solo hace los cálculos de física. El canvas solo pinta — no sabe nada de física. Separación limpia.

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

  // Paredes invisibles
  World.add(engine.world, [
    Bodies.rectangle(W / 2, H + 25, W * 2, 50, { isStatic: true }),
    Bodies.rectangle(-25,   H / 2, 50, H * 2, { isStatic: true }),
    Bodies.rectangle(W + 25, H / 2, 50, H * 2, { isStatic: true }),
  ]);

  // Bola
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

    // Suelo
    ctx.fillStyle = 'rgba(255,202,64,0.12)';
    ctx.fillRect(0, H - 3, W, 3);

    // Sombra
    const shadowAlpha = Math.max(0, 0.25 - (ball.position.y / H) * 0.25);
    const shadowW = R * 2 * (1 - ball.position.y / H * 0.4);
    ctx.beginPath();
    ctx.ellipse(ball.position.x, H - 3, Math.max(4, shadowW), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,202,64,${shadowAlpha})`;
    ctx.fill();

    // Bola
    const { x, y } = ball.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ball.angle);
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffca40';
    ctx.fill();
    // Marca de rotación
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

### Las complicaciones del móvil

En móvil, el texto "CONTACT" en una sola fila no cabe en el ancho de pantalla con un tamaño legible. Tuve que dividirlo en dos filas ("CON" y "TACT") y gestionar el spawn de forma que la segunda fila ("TACT") cayera primero y se asentara antes de que llegara la primera ("CON").

```javascript
if (isMobile) {
  // TACT: spawn justo encima del canvas, cae primero
  spawnRow(rowBottom, W, -(letterHeight / 2), staggerDelay)

  // CON: spawn mucho más arriba para llegar después
  const topSpawnY = -(letterHeight / 2 + rowBottom.length * staggerDelay + fontSize * 1.8)
  spawnRow(rowTop, W, topSpawnY, staggerDelay)
}
```

También aumenté la gravedad en móvil a 8.5 (vs 4.5 en desktop). El motivo: en móvil el usuario puede hacer scroll rápido y si las letras caen despacio, la sección desaparece antes de que terminen. Con más gravedad bajan en menos tiempo y la animación se ve completa.

### Lazy init con IntersectionObserver

La física no arranca hasta que la sección es visible. Tiene sentido: ¿para qué calcular física de algo que nadie está viendo?

```javascript
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !triggered) {
      triggered = true

      // Doble rAF para asegurar que el layout CSS está calculado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncCanvasSize()
          initPhysics(canvas, 'CONTACT')
        })
      })
    } else if (triggered) {
      // Pausar/reanudar según visibilidad
      entry.isIntersecting ? resume() : pause()
    }
  }
}, {
  threshold: [0, 0.4] // 0 para detectar salida, 0.4 para trigger de inicio
})
```

El doble `requestAnimationFrame` es un truco que aparece bastante cuando trabajas con canvas. El primer `rAF` espera a que el navegador haya aplicado todos los estilos CSS. El segundo espera a que el layout esté completamente calculado. Sin esto, `canvas.clientWidth` puede devolver 0 o un valor incorrecto.

El `pause()` y `resume()` paran el Runner de Matter.js y cancelan el loop de `requestAnimationFrame` cuando la sección sale del viewport. CPU a cero cuando no se ve nada.

### El slam

Cuando el usuario hace click en cualquier parte de la sección (o en el email), las letras salen volando hacia arriba:

```javascript
const slam = () => {
  for (const { body } of letterBodies) {
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 8,
      y: -(15 + Math.random() * 10) // hacia arriba, velocidad variable
    })
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
  }
}
```

Simple. A cada cuerpo se le asigna una velocidad hacia arriba aleatoria entre -15 y -25, y una rotación aleatoria. Matter.js hace el resto.

---

## 6. Los doodles SVG — de Affinity a componente Vue

Por todo el portfolio hay elementos dibujados a mano: subrayados, círculos, tachones, palabras escritas con letra. Los dibujé en Affinity y los exporté como SVG.

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

El efecto de "dibujo en tiempo real" — que el trazo aparezca progresivamente como si alguien lo estuviera trazando en ese momento — se consigue con una técnica CSS clásica: `strokeDasharray` y `strokeDashoffset`.

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

  // Preparar: dash tan largo como el path, offset = invisible
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

### Cómo funciona el truco

Imagina que el trazo de un path SVG es una línea de puntos. `strokeDasharray` define el patrón: cuánto de línea, cuánto de espacio. Si pones un valor igual a la longitud total del path, tienes un solo "dash" tan largo como el path entero.

`strokeDashoffset` desplaza ese patrón. Si el offset es igual a la longitud del path, el dash está completamente desplazado — no se ve nada. Si el offset es 0, el dash está en su posición — se ve todo.

Animar `strokeDashoffset` de la longitud del path hasta 0 crea el efecto de dibujo:

```javascript
const preparePaths = (svgEl) => {
  const paths = svgEl.querySelectorAll('path')

  paths.forEach(path => {
    const length = path.getTotalLength() + 20 // +20 de margen para los caps redondeados
    path.style.strokeDasharray = length
    path.style.strokeDashoffset = length
    path.style.visibility = 'hidden' // ocultar hasta que empiece la animación
  })

  return paths
}

const drawPaths = (tl, paths, duration) => {
  tl.to(paths, {
    visibility: 'visible',
    strokeDashoffset: 0,
    duration,
    ease: 'power1.inOut'
  })
}
```

El `+20` de margen en la longitud es un detalle que descubrí a las malas. Cuando el path tiene `stroke-linecap: round`, los extremos del trazo son semicírculos que sobresalen un poco más allá del endpoint. Sin ese margen, al inicio de la animación se ve un puntito — el cap redondeado asomando antes de que empiece el trazo.

El `visibility: hidden` antes de que empiece la animación (en lugar de `opacity: 0`) también es intencional. Con `opacity: 0` el elemento sigue ocupando espacio visualmente en algunos contextos de compositing. Con `visibility: hidden` desaparece limpiamente.

### El problema del SSR flicker

En Nuxt con SSR, el HTML se renderiza en el servidor y se envía al navegador. Los SVGs tienen sus paths visibles en ese HTML inicial. Cuando Vue hidrata la página y GSAP ejecuta los `gsap.set()` para ocultar los paths, hay un instante en que los paths están visibles antes de ser ocultados. Un flash.

La solución fue ocultar el SVG completo con `opacity: 0` antes de que GSAP toque los paths individuales:

```javascript
const preparePaths = (svgEl) => {
  // Ocultar el contenedor completo primero, antes de calcular longitudes
  // Esto previene el flash de SSR → hidratación
  gsap.set(svgEl, { opacity: 0 })

  const paths = svgEl.querySelectorAll('path')
  // ... resto de la preparación
}
```

Y al añadir la animación de dibujo al timeline, se hace visible en el primer frame de la animación:

```javascript
tl.to(svgEl, { opacity: 1, duration: 0.01 }) // invisible → visible instantáneamente
tl.to(paths, { strokeDashoffset: 0, visibility: 'visible', duration })
```

### Duración proporcional a la longitud del path

Hay SVGs que tienen múltiples paths de longitudes muy distintas. Un subrayado simple tiene un path. Un círculo puede tener tres o cuatro. Si animas todos con la misma duración, los paths cortos terminan antes que los largos — y visualmente queda raro, como si algunos trazos se dibujaran a cámara rápida.

La solución es escalar la duración de cada path según su longitud relativa:

```javascript
const drawProportional = (tl, paths, maxDuration) => {
  const lengths = paths.map(p => p.getTotalLength())
  const maxLength = Math.max(...lengths)

  paths.forEach(path => {
    const ratio = path.getTotalLength() / maxLength
    const duration = Math.max(maxDuration * 0.4, maxDuration * ratio)
    // mínimo 40% de la duración máxima para que ningún path vaya demasiado rápido

    tl.to(path, {
      visibility: 'visible',
      strokeDashoffset: 0,
      duration,
      ease: 'power1.inOut'
    }, '<+=0.1') // pequeño stagger entre paths
  })
}
```

El path más largo toma `maxDuration`. Los más cortos toman una fracción proporcional, con un mínimo del 40% para que no queden demasiado rápidos.

### De Affinity a componente Vue

Hice un script que convierte los SVGs exportados de Affinity en componentes Vue listos para usar. Cada componente expone la referencia al elemento SVG para que el composable de doodles pueda acceder a los paths:

```vue
<!-- DoodleSubrayado.vue -->
<script setup>
import { ref } from 'vue'

const svgRef = ref(null)
defineExpose({ svg: svgRef })
</script>

<template>
  <svg ref="svgRef" viewBox="0 0 200 20" fill="none" xmlns="...">
    <path d="M2,10 Q100,2 198,10" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" />
  </svg>
</template>
```

`defineExpose({ svg: svgRef })` es clave. Hace que el padre pueda acceder al elemento SVG del DOM a través de la ref del componente. Sin esto, la encapsulación de Vue impediría que `preparePaths` llegara a los paths.

Usando `currentColor` para el stroke en lugar de un color hardcodeado, los doodles heredan el color del texto del elemento padre. En secciones con fondo oscuro se vuelven claros automáticamente.

---

## 7. Performance — que no pete

Con todo esto encima, la pregunta es inevitable: ¿carga bien?

La respuesta es que no fue gratis. Hubo decisiones conscientes en cada pieza del sistema para que el resultado final fuera fluido.

### El ignoreMobileResize que ya mencioné

```javascript
ScrollTrigger.config({ ignoreMobileResize: true })
```

Una línea que elimina un goteo constante de recálculos en móvil. Sin esto, cada vez que la barra de URL del navegador aparece o desaparece, ScrollTrigger recalcula todos los triggers. Con muchos triggers en la página, eso es trabajo innecesario en cada scroll.

### Pausa y reanuda, no destruyas

Para Matter.js, el patrón es pausar el motor cuando la sección no es visible, no destruirlo. Destruir y recrear el motor cada vez que la sección entra y sale de pantalla es más caro que simplemente pausar el Runner y cancelar el rAF:

```javascript
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

IntersectionObserver detecta cuándo la sección entra y sale del viewport y llama a `pause()` o `resume()` en consecuencia.

### Settle detection en la página 404

La página 404 tiene el número "404" cayendo con física. Una vez que aterriza y se queda quieto, no tiene sentido seguir ejecutando el motor de física ni el loop de rAF.

```javascript
let settleCount = 0

const draw = () => {
  // ... pintar
  const speed = body.speed + Math.abs(body.angularSpeed)

  if (speed < 0.05) {
    settleCount++
    if (settleCount >= 60) { // ~1 segundo a 60fps
      Runner.stop(runner)
      return // salir del loop sin programar el siguiente rAF
    }
  } else {
    settleCount = 0
  }

  rafId = requestAnimationFrame(draw)
}
```

Cuando el cuerpo lleva 60 frames consecutivos casi sin moverse (speed < 0.05), se para el Runner y se deja de llamar a `requestAnimationFrame`. El "404" queda pintado en el último frame como imagen estática. CPU a cero.

### Debounce del resize

Cuando el usuario redimensiona la ventana, muchos componentes necesitan recalcular cosas — tamaño del canvas de física, posición de ScrollTriggers, etc. Sin debounce, cada pixel de resize dispara un recálculo.

```javascript
let resizeTimer = null

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    // recalcular solo cuando el usuario ha parado de redimensionar
    rebuildPhysics()
    ScrollTrigger.refresh()
  }, 300)
})
```

300ms de debounce. El recálculo solo ocurre una vez, cuando el usuario termina de redimensionar.

Para la física, además, solo se reinicializa si el ancho cambió significativamente — más de 50px. Esto ignora los cambios de altura que provoca la barra de URL del navegador en móvil sin el `ignoreMobileResize` de ScrollTrigger:

```javascript
const newWidth = container.clientWidth
if (Math.abs(newWidth - prevWidth) < 50) return // ignorar cambios pequeños
```

### Limpieza automática con gsap.context

Todo lo mencionado en la sección 1 — el contexto de GSAP que limpia automáticamente los tweens y ScrollTriggers al desmontar el componente — es fundamental en una SPA. En una navegación sin recarga de página, los componentes se montan y desmontan constantemente. Sin limpieza, los triggers se acumulan y la memoria crece.

---

## Cierre — :hand-drawn{svg="/blog/doodles/blog_inter.svg" placement="right" width="0.9em" count="2"}[¿valió la pena?]

Sí. Pero no fue gratis ni fue rápido.


La parte que más tiempo me llevó no fue escribir código — fue afinar y darle mimo a los detalles. Conseguir que las animaciones se vieran bien en todos los tamaños de pantalla, que no se descolocaran en móviles raros, que el PinSpacer fix no causara saltos, que la física arrancara en el momento correcto.

GSAP es sólido. La documentación es buena, los errores son predecibles, y `gsap.context()` hace que trabajar con Vue sea limpio. La integración con Lenis requiere un par de ajustes específicos, pero una vez que está configurada, simplemente funciona.

Matter.js me sorprendió por lo directo que es para casos de uso básicos. Motor, cuerpos, mundo, loop de render. Sin magia. El canvas rendering manual te da control total pero también significa que tú eres responsable de cada pixel.

Los doodles SVG son mi parte favorita. La técnica de strokeDashoffset tiene décadas, pero sigue siendo elegante. El detalle de hacerlos a mano y convertirlos a componentes Vue con un script le da al portfolio algo que es difícil de conseguir con herramientas generativas: que parezca :hand-drawn{svg="/blog/doodles/blog_long_underline.svg"}[hecho por una persona].

Si lo repitiera, probablemente encapsularía mejor el scroll horizontal — tiene una instancia de Lenis propia que a veces interfiere con la global y requiere cuidado. Y pensaría antes si toda la animación del Hero merece el PinSpacer, o si hay una forma más simple de conseguir el mismo efecto.

Pero en general, estoy contento con cómo quedó. Y sobre todo, con lo que aprendí peleándome con ello.

> La parte que más tiempo me llevó no fue escribir código — fue afinar y darle mimo a los detalles,