---
title: Como animei o meu portfolio con GSAP, Lenis e Matter.js
description: Meter GSAP, Lenis e Matter.js nun portfolio con Nuxt SSR soaba moi ben ata que empezaron a aparecer problemas de timing, scroll e performance. Aquí conto que me funcionou e que non.
date: "2026-03-14"
category: breakdown
topics: ["GSAP", "Lenis", "Matter.js", "Vue", "Nuxt", "animaciones", "performance"]
time_to_read: 11
published: true
lang: gl
translationKey: animated-portfolio
slug: animando-o-meu-portfolio-con-gsap-lenis-e-matterjs
---

## Quería que o portfolio tivese peso

Levaba tempo con ganas de meterme en serio con GSAP, Lenis e Matter.js. Fixera probas soltas, pero faltábame un sitio real onde xuntalas sen converter un proxecto de cliente nun laboratorio. O portfolio era perfecto para iso: se me pegaba unha leite, a leite era miña.

Non buscaba só unha web bonita. Quería que se sentise viva de verdade. Que o scroll tivese inercia, que o hero non entrase como calquera landing, que algunhas letras parecesen obxectos e non texto plano, e que os doodles desen a sensación de estarse trazando nese momento.

Sobre o papel soaba ben. En Nuxt con SSR, tres librarías deste tipo convértense rápido nun xaleo de timings, listeners que quedan vivos, scroll desincronizado e rendemento frouxo en móbil.

Aquí non vou pegar o código real enteiro porque sería infumable. O que si fago é contar as decisións que tomei, os problemas concretos que atopei e os snippets simplificados que me gustaría ter lido antes de poñerme.

## GSAP foi a base, pero a clave estaba na limpeza

GSAP move practicamente todo o portfolio. ScrollTrigger para as animacións ligadas ao scroll e SplitText para tratar o texto letra a letra. O punto de partida é o típico:

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)
```

O fácil era arrincar a primeira animación. O que me deu guerra foi outra cousa: non deixar lixo ao desmontar compoñentes. Nunha SPA iso pasa sen facer moito ruído. Vas navegando, montas un compoñente, logo outro, logo volves e, se non limpas ben, os triggers seguen aí aínda que o DOM xa non exista.

`gsap.context()` arranxoume xusto iso. Agrupa todo o que se crea dentro e logo revérteo de golpe cando o compoñente desaparece. En Vue queda bastante limpo se o empaquetas nun composable:

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

Logo, en cada compoñente, todo o que cae dentro de `initGSAP()` queda baixo control:

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

Houbo outro detalle máis parvo, pero moi de móbil: a barra do navegador aparece e desaparece, cambia `window.innerHeight` e ScrollTrigger interprétao como un resize. O resultado eran pequenos tremores e recálculos constantes mentres a persoa usuaria facía scroll.

Aquí salvoume unha liña:

```typescript
ScrollTrigger.config({ ignoreMobileResize: true })
```

Parece unha tontería, pero quitou bastante ruído. Segue recalculando cando toca de verdade (por exemplo, nun cambio de orientación), pero deixa de reaccionar a cada movemento mínimo do viewport.

## Lenis e GSAP só van finos se comparten reloxo

Lenis interesábame por unha razón simple: quería smooth scroll sen esa sensación de plugin pegado enriba. O problema é que, se deixas Lenis e GSAP ir cada un pola súa conta, cada un intenta marcar o seu ritmo. Un leva o seu `requestAnimationFrame`, o outro o seu ticker, e a diferenza pode ser pequena, pero nótase.

A forma máis limpa que atopei foi desactivar o loop interno de Lenis e colgalo do ticker de GSAP. Así todo corre no mesmo frame:

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

`autoRaf: false` evita que Lenis cree o seu propio loop. Logo GSAP pásalle o tempo en cada frame, e `lagSmoothing(0)` quita unha capa extra de suavizado que aquí non me interesaba. A partir de aí, scroll e triggers empezaron a ir acompasados de verdade.

En Nuxt isto vive mellor nun plugin client-side para que a instancia de Lenis quede dispoñible en toda a app:

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

### O navbar deixou de facer cousas raras cando deixei de forzalo

O navbar escóndese ao baixar e reaparece ao subir. Nada especialmente orixinal. A miña primeira implementación resolvíao con ScrollTrigger e `onUpdate`. Funcionaba case sempre. O problema era ese “case”. Na primeira carga, antes de que Lenis estivese do todo asentado, o navbar ás veces desaparecía só.

A saída foi máis simple ca idea orixinal: escoitar directamente o evento `scroll` de Lenis e esquecerme de ScrollTrigger neste caso.

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

Ese `scroll > 80` foi importante. Sen el, calquera microxesto preto do top escondía o navbar e quedaba bastante cutre.

## O hero montouse en tres capas

A parte máis vistosa do portfolio está no hero. O título arrinca como “SAMUEL LOPEZ” e, ao facer scroll, algunhas letras desprómanse, o oco recolócase e aparece unha `h` debuxada a man ata acabar en “SAMUh.LO”.

::blog-media
---
src: blog/animated-portfolio/samuhlo_intro_2.mp4
caption: Animación do hero, letras caendo e a "h" debuxada a man
maxWidth: 80%
align: center
---
::

Dividino en tres pezas porque, se non, aquilo volvíaseme inmanejable moi rápido.

### HeroTitle: as letras que caen

Cada letra que tiña que desaparecer vive no seu propio `<span>` con `ref`. Tamén hai un wrapper que empeza con ancho cero e logo fai sitio para a `h` debuxada.

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

O timeline fai catro cousas: un pequeno desequilibrio, a caída, o colapso do oco orixinal e, ao final, o debuxo da `h`.

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

O detalle importante aquí é que o oco está medido en `em`, non en píxeles. Parece pouca cousa, pero fixo que escalase só co tamaño do título e aforroume bastante traballo entre desktop e móbil.

### HeroSubtitle: o texto tachado e os doodles

Mentres o título fai o seu, o subtítulo entra por outro lado. Aparece “Front-end Developer”, táchase e arredor van entrando palabras debuxadas a man. Cada unha é un SVG animado coa mesma técnica de `strokeDashoffset` que logo reutilicei por todo o proxecto.

### HeroSection: un só trigger mandando en todo

O que máis me compensou aquí foi non ter varios ScrollTriggers pelexando entre si. Tanto `HeroTitle` como `HeroSubtitle` expoñen o seu timeline con `defineExpose`, e logo o contedor principal reparte o progreso do scroll entre os dous.

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

Un trigger, dous timelines e unha progresión bastante fácil de afinar. Para unha animación tan cargada, iso deume moito máis control ca repartir a responsabilidade entre varios triggers independentes.

## O pin-spacer foi o maior problema de UX

Aquí foi onde máis me parei. Non por dificultade técnica pura, senón porque a experiencia que quedaba era mala.

Cando GSAP pinea unha sección crea un :hand-drawn{svg="/blog/doodles/blog_medium_circle.svg" placement="around"}[pin-spacer] que conserva o oco vertical mentres dura a animación. Se esa animación consume 2500px de scroll, ese oco tamén existe ao volver cara arriba. E aí vén o feo: a persoa usuaria cómese todo o rebobinado da animación ao revés.

Ese comportamento moléstame bastante noutras webs, así que non quería deixalo tal cal. Matar o trigger xusto en `onLeave` parecía a resposta obvia, pero probeino e producía un micro-salto visible, porque a sección aínda estaba demasiado preto do viewport.

A boa solución foi esperar máis. Bastante máis. Ata que a persoa usuaria pasase polo menos outro viewport completo por baixo da sección. Nese punto xa non se vía nada do hero e podía recolocar o scroll sen que cantase demasiado.

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

Aquí a orde importa bastante. Primeiro desaparece o trigger principal, logo compenso o scroll no mesmo frame, despois refresco ScrollTrigger e ao final sincronizo Lenis. Se cambias a orde, volven os saltos ou aparece desaxuste entre o scroll real e o scroll interno de Lenis.

O resultado é moito máis limpo: unha vez vista a animación, esa parte compórtase como HTML estático. Podes volver arriba rápido sen tragarte o hero cara atrás.

### En móbil deixei de insistir co scroll-driven

Fixen unha proba con xente usando o portfolio en móbil e a conclusión foi bastante clara: ninguén estaba “xogando” co scroll do hero. Simplemente facían swipe e seguían baixando. A animación, se dependía demasiado do xesto, quedaba a medias ou pasaba sen pena nin gloria.

Aí non tiña sentido empeñarme. En móbil pasei a autoplay:

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

En desktop ten sentido que a persoa usuaria controle o ritmo co scroll. En móbil, non sempre. Ás veces toca deixar de perseguir a idea bonita e adaptarse a como usa a xente a páxina de verdade.

## Matter.js entrou para que o contacto non fose só decorado

Se ía meter física, quería que se notase. A sección de contacto ten o texto “CONTACT” caendo con rebote, rotación e gravidade real. E ao facer click, todo sae disparado cara arriba.

::blog-media
---
src: blog/animated-portfolio/contact_section_2.mp4
caption: Sección Contact, letras con física Matter.js
maxWidth: 80%
align: center
---
::

A base aquí é bastante directa: un motor de Matter.js para calcular a física e un canvas para debuxar. Un pensa, o outro pinta.

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

Matter.js non debuxa nada por ti. Só calcula. E para este caso, viñame perfecto, porque o control visual quería levalo eu enteiro dende o canvas.

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

### En móbil non cabía, así que houbo que partilo

“CONTACT” nunha soa fila non entraba ben en móbil se quería manter un tamaño decente. Dividino en dúas liñas: `CON` e `TACT`. E como non quería que chocasen de forma rara, fixen que a segunda fila caese primeiro e a primeira chegase despois.

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

Tamén subín a gravidade en móbil a `8.5`. Non por realismo, senón por tempo de atención: se as letras tardaban demasiado en asentarse, a xente xa se fora á seguinte sección.

### A física non arrinca ata que toca

Non tiña ningún sentido ter Matter.js correndo cando esa sección nin sequera estaba en pantalla. Activeino con `IntersectionObserver` e, ademais, pauseino e reanudeino segundo a visibilidade.

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

Ese dobre `requestAnimationFrame` é un deses trucos pequenos que che aforran bugs absurdos con canvas e layout. O primeiro deixa que o navegador pinte. O segundo deixa que o tamaño real do elemento se asente antes de calcular nada serio.

### O slam era a parte divertida

Cando a persoa usuaria fai click na sección ou no email, as letras saen despedidas. Aquí non había demasiada ciencia: velocidade aleatoria cara arriba, algo de rotación e que Matter.js faga o resto.

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

Simple, si. Pero é desas interaccións que fan que a sección deixe de ser só unha animación de fondo e pase a responder á persoa usuaria.

---

## Os doodles eran visuais, pero o traballo real estaba no SVG

Por todo o portfolio hai subliñados, círculos, tachóns e palabras debuxadas a man. Fixenos en Affinity e exporteinos como SVG porque quería que o trazo tivese un punto máis torpe e menos perfecto ca calquera icono xerado á présa.

::image-slider
---
maxWidth: 850px
align: center
images:
  - src: blog/animated-portfolio/doodles_letras.jpg
    alt: Doodles letras
    label: Doodles de títulos
  - src: blog/animated-portfolio/doodles_details.jpg
    alt: Doodles detalles
    label: Doodles de detalles
---
::

A técnica para “debuxar” un path en tempo real non ten ningún misterio novo. É a clásica de `strokeDasharray` e `strokeDashoffset`. O interesante non era descubrila, senón levala ben a SSR, a varios SVG distintos e a compoñentes reutilizables.

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

### O detalle que me fastidiou: os caps redondeados

Cando o path ten `stroke-linecap: round`, o extremo redondeado sobresae un pouco. Se calculas a lonxitude exacta e animas dende aí, ás veces aparece un puntiño antes de tempo. Pasoume varias veces ata que deixei de pelexar con iso e lle sumei unha pequena marxe:

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

Ese `+20` era xusto o que necesitaba para que non asomase nada antes de empezar a animación.

### O flash de SSR tamén apareceu aquí

En SSR o HTML inicial chega cos paths visibles. Se esperas a que Vue hidrate e logo aplicas os `gsap.set()`, durante un intre o SVG vese enteiro. Un flash pequeno, pero suficiente para estragar o efecto.

A forma máis limpa que atopei foi ocultar primeiro o SVG completo e logo preparar os paths.

```typescript
const preparePaths = (svgEl: SVGElement) => {
  gsap.set(svgEl, { opacity: 0 })

  const paths = svgEl.querySelectorAll('path')
  // ... preparar longitudes e offsets
}
```

E cando toca debuxalo, fágolle visible no primeiro frame do timeline:

```typescript
tl.to(svgEl, { opacity: 1, duration: 0.01 })
tl.to(paths, {
  strokeDashoffset: 0,
  visibility: 'visible',
  duration
})
```

### Pasalo a compoñente Vue aforroume repetir código por todas partes

Acabei montando un script que transforma os SVG exportados en compoñentes Vue cun `ref` exposto. Así o composable que anima doodles pode acceder ao elemento real do DOM sen romper a encapsulación a marteladas.

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

Usar `currentColor` no canto dunha cor fixa tamén viña ben. Así os doodles herdan a cor do contexto e non teño que manter variantes duplicadas para fondo escuro e fondo claro.

---

## Para que todo isto non petase, non houbo unha bala de prata

O rendemento non saíu dunha optimización milagrosa. Saíu de varias decisións pequenas, bastante pouco glamurosas, que xuntas fixeron que a páxina non se viñese abaixo.

Xa comentei `ignoreMobileResize`, que quitou recálculos absurdos en móbil. Pero houbo máis.

### Matter.js: pausar e reanudar é mellor que destruír

Na sección de contacto non destrúo o motor cada vez que sae do viewport. Páusoo. Recrealo continuamente sae máis caro ca deixalo listo para volver.

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

Con `IntersectionObserver` chega para decidir cando hai que parar e cando volver arrincar.

### Na 404 cortei a física en canto xa non achegaba nada

A páxina 404 tamén usa física para o número. Unha vez que cae, rebota un pouco e queda quieto, seguir calculando frames é malgastar CPU. Aí metín unha detección simple de asentamento.

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

Se pasa arredor dun segundo practicamente quieto, párase todo. Visualmente a persoa usuaria non perde nada e a páxina deixa de traballar en segundo plano.

### O resize vai con debounce

Redimensionar a ventá dispara un montón de cálculos: canvas, offsets, triggers. Se reaccionas a cada píxel de cambio, acabas refacendo traballo constantemente.

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

Para a física, ademais, só reinicializo se o ancho cambia de verdade. Se a variación é mínima, ignóroa:

```typescript
const newWidth = container.clientWidth
if (Math.abs(newWidth - prevWidth) < 50) return
```

Non é unha técnica brillante. É simplemente poñer un límite sensato e deixar de recalcular por deporte.

---

## O que repetiría e o que non

Si, pagou a pena. Pero non porque todo saíse rodado, senón precisamente porque me obrigou a resolver problemas que en demos pequenas non aparecen.

GSAP segue parecéndome a peza máis sólida do conxunto. A documentación é boa, os erros adoitan ser bastante lexibles e `gsap.context()` encaixa moi ben con Vue cando queres manter as cousas limpas. Lenis require deixar ben pechado o tema do loop e da sincronización, pero unha vez montado non dá demasiada guerra.

Matter.js sorprendeume para ben. É bastante directo para este tipo de efectos: motor, corpos, mundo e un canvas que debuxa o que toca. Sen demasiada maxia. E os doodles seguen sendo probablemente a parte máis persoal de todo o portfolio. A técnica é vella, si, pero pasar trazos feitos a man a compoñentes reutilizables dálle un punto que sería difícil sacar dunha solución máis xenérica.

Se o rehixese hoxe, revisaría un pouco mellor o scroll horizontal, porque leva a súa propia instancia de Lenis e iso obriga a ir con coidado para que non se cruce coa global. E tamén me volvería preguntar se toda a complexidade do hero necesita exactamente ese sistema de pinning, ou se agora sería capaz de conseguir algo parecido con menos pezas.

Pero vaia, non me arrepinto. O resultado séntese bastante próximo ao que quería dende o principio: unha web que non só se move, senón que parece construída con intención.
