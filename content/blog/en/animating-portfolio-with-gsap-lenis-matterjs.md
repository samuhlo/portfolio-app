---
title: How I Animated My Portfolio with GSAP, Lenis, and Matter.js
description: Adding GSAP, Lenis, and Matter.js to a Nuxt SSR portfolio sounded great until timing, scroll, and performance issues started piling up. Here is what worked, and what did not.
date: "2026-03-14"
category: breakdown
topics: ["GSAP", "Lenis", "Matter.js", "Vue", "Nuxt", "animation", "performance"]
time_to_read: 11
published: true
lang: en
translationKey: animated-portfolio
slug: animating-portfolio-with-gsap-lenis-matterjs
---

## I wanted the portfolio to have weight

I had wanted to seriously dive into GSAP, Lenis, and Matter.js for a while. I had done isolated experiments, but I was missing a real place to put them together without turning a client project into a lab. The portfolio was perfect for that: if things fell apart, they fell apart on my own time.

I was not just trying to make a pretty site. I wanted it to actually feel alive. I wanted inertial scroll, a hero that did not enter like any generic landing page, letters that felt like objects instead of flat text, and doodles that looked like they were being drawn in real time.

On paper, it sounded great. In Nuxt with SSR, three libraries like these can quickly turn into a mess of timing issues, lingering listeners, desynced scroll, and mediocre mobile performance.

I am not pasting the full production code here because it would be unreadable. What I am doing is breaking down the decisions I made, the specific problems I hit, and the kind of simplified snippets I wish I had read before starting.

---

## GSAP was the foundation, but cleanup was the key

GSAP drives almost everything in the portfolio. ScrollTrigger handles scroll-linked animations, and SplitText lets me treat text letter by letter. The starting point is the usual one:

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)
```

Getting the first animation running was easy. The thing that gave me trouble was different: not leaving garbage behind when components unmount. In an SPA, this happens quietly. You navigate around, mount one component, then another, then come back, and if cleanup is not solid, triggers keep running even when the DOM is gone.

`gsap.context()` fixed that exact issue. It groups everything created inside it and then reverts all of it at once when the component disappears. In Vue, it stays pretty clean if you wrap it in a composable:

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

Then, inside each component, anything inside `initGSAP()` is under control:

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

There was another smaller detail that is very mobile-specific: the browser bar appears and disappears, `window.innerHeight` changes, and ScrollTrigger reads that as a resize. The result was tiny jitters and constant recalculations while scrolling.

One line saved me here:

```typescript
ScrollTrigger.config({ ignoreMobileResize: true })
```

Looks trivial, but it removed a lot of noise. It still recalculates when it actually should, like orientation changes, but it stops reacting to every tiny viewport movement.

---

## Lenis and GSAP only feel smooth when they share a clock

I wanted Lenis for one simple reason: smooth scrolling without the feeling of a plugin glued on top. The issue is that Lenis and GSAP, left on their own, each try to control timing. One runs its own `requestAnimationFrame`, the other runs its ticker, and even if the gap is small, you can feel it.

The cleanest approach I found was disabling Lenis' internal loop and mounting it on GSAP's ticker. That way, everything runs in the same frame:

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

`autoRaf: false` prevents Lenis from creating its own loop. Then GSAP feeds it time on every frame, and `lagSmoothing(0)` removes an extra smoothing layer I did not want here. After this, scroll and triggers started moving in sync for real.

In Nuxt, this sits best in a client-only plugin so the Lenis instance is available app-wide:

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

### The navbar stopped acting weird when I stopped forcing it

The navbar hides on the way down and reappears on the way up. Nothing groundbreaking. My first implementation used ScrollTrigger with `onUpdate`. It worked almost always. The problem was that "almost." On first load, before Lenis had fully stabilized, the navbar sometimes hid on its own.

The fix was simpler than the original idea: listen directly to Lenis' `scroll` event and skip the trigger for this case.

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

That `scroll > 80` mattered. Without it, any tiny gesture near the top would hide the navbar and look sloppy.

---

## The hero was built in three layers

The most visible part of the portfolio is the hero. The title starts as "SAMUEL LOPEZ" and, as you scroll, some letters drop out, the gap reflows, and a hand-drawn `h` appears until it becomes "SAMUh.LO".

::blog-media
---
src: blog/animated-portfolio/samuhlo_intro_2.mp4
caption: Hero animation, falling letters and hand-drawn "h"
maxWidth: 80%
align: center
---
::

I split it into three pieces because otherwise it became unmanageable very quickly.

### HeroTitle: the falling letters

Each letter that needs to disappear lives in its own `<span>` with a `ref`. There is also a wrapper that starts at zero width and later makes room for the drawn `h`.

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

The timeline does four things: a slight imbalance, the fall, the collapse of the original gap, and finally the drawing of the `h`.

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

The important detail here is that the gap is measured in `em`, not pixels. It sounds minor, but it made scaling with title size automatic and removed a lot of desktop/mobile tuning.

### HeroSubtitle: crossed text and doodles

While the title runs its sequence, the subtitle enters separately. "Front-end Developer" appears, gets crossed out, and hand-drawn words animate around it. Each one is an SVG animated with the same `strokeDashoffset` technique that I later reused across the project.

### HeroSection: one trigger controlling everything

What paid off most here was avoiding multiple ScrollTriggers competing with each other. Both `HeroTitle` and `HeroSubtitle` expose their timelines with `defineExpose`, and then the main container distributes scroll progress between both.

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

One trigger, two timelines, and progression that is easy to tune. For such a dense animation, this gave me much more control than splitting responsibility across independent triggers.

---

## The pin-spacer was the biggest UX problem

This is where I paused the most. Not because of raw technical complexity, but because the experience felt bad.

When GSAP pins a section, it creates a :hand-drawn{svg="/blog/doodles/blog_medium_circle.svg" placement="around"}[pin-spacer] that keeps vertical space while the animation runs. If that animation consumes 2500px of scroll, that space still exists when scrolling back up. And that is the ugly part: users are forced to watch the full animation rewind in reverse.

That behavior bothers me on other sites, so I did not want to leave it as-is. Killing the trigger on `onLeave` looked obvious, but I tested it and got a visible micro-jump because the section was still too close to the viewport.

The good fix was waiting longer. Much longer. Until users had scrolled at least another full viewport below the section. At that point, none of the hero was visible, so I could reposition scroll without calling attention to it.

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

Order matters a lot here. First, remove the main trigger. Then compensate scroll in the same frame. Then refresh ScrollTrigger. Finally sync Lenis. Change that order and jumps come back, or real scroll and Lenis internal scroll drift apart.

The result is much cleaner: once the animation has played, that section behaves like static HTML. You can scroll back up quickly without replaying the hero backward.

### On mobile, I stopped forcing scroll-driven behavior

I ran a quick test with people using the portfolio on mobile, and the result was pretty clear: nobody was "playing" with the hero scroll. They just swiped and kept going. If the animation depended too much on gesture control, it either stayed halfway or passed unnoticed.

At that point, insisting made no sense. On mobile I switched to autoplay:

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

On desktop, user-controlled pacing makes sense. On mobile, not always. Sometimes you have to stop chasing the ideal animation and adapt to how people actually use the page.

---

## Matter.js came in so contact would be more than decoration

If I was going to add physics, I wanted it to matter. The contact section has the text "CONTACT" dropping with bounce, rotation, and real gravity. On click, everything launches upward.

::blog-media
---
src: blog/animated-portfolio/contact_section_2.mp4
caption: Contact section with Matter.js-driven letters
maxWidth: 80%
align: center
---
::

The setup here is straightforward: a Matter.js engine to compute physics and a canvas to draw. One thinks, the other paints.

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

Matter.js does not render for you. It only computes. For this case, that was perfect, because I wanted full visual control in canvas.

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

### It did not fit on mobile, so I had to split it

"CONTACT" on one row did not fit well on mobile if I wanted to keep a decent size. I split it into two lines: `CON` and `TACT`. And since I did not want awkward collisions, I made the second row drop first and the top row arrive after.

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

I also increased gravity on mobile to `8.5`. Not for realism, but for attention span: if letters took too long to settle, people were already in the next section.

### Physics only starts when needed

There was no point running Matter.js while the section was off-screen. I activated it with `IntersectionObserver` and also paused/resumed based on visibility.

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

That double `requestAnimationFrame` is one of those small tricks that saves you from absurd canvas/layout bugs. The first lets the browser paint. The second lets real element size settle before calculating anything serious.

### The slam was the fun part

When users click the section or the email, letters fly upward. No deep science here: random upward velocity, some rotation, and Matter.js handles the rest.

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

Simple, yes. But it is the kind of interaction that makes the section stop being background animation and start responding to the user.

---

## Doodles were visual, but the real work was in the SVG

The portfolio is full of underlines, circles, strike-throughs, and hand-drawn words. I made them in Affinity and exported as SVG because I wanted the stroke to feel rougher and less perfect than any quickly generated icon.

::image-slider
---
maxWidth: 850px
align: center
images:
  - src: blog/animated-portfolio/doodles_letras.jpg
    alt: Letter doodles
    label: Doodles de titulos
  - src: blog/animated-portfolio/doodles_details.jpg
    alt: Detail doodles
    label: Doodles de detalles
---
::

The technique for "drawing" a path in real time has no mystery. It is the classic `strokeDasharray` and `strokeDashoffset`. The interesting part was not discovering it, but making it work well with SSR, across multiple SVGs, and in reusable components.

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

### The detail that annoyed me: rounded line caps

When a path has `stroke-linecap: round`, the rounded tip sticks out slightly. If you compute exact length and animate from there, a tiny dot can appear too early. It happened to me several times until I stopped fighting and added a small margin:

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

That `+20` was exactly what I needed so nothing leaked before animation started.

### The SSR flash showed up here too

In SSR, initial HTML arrives with visible paths. If you wait for Vue hydration and only then apply `gsap.set()`, the full SVG flashes briefly. Small flash, but enough to ruin the effect.

The cleanest fix I found was hiding the full SVG first and only then preparing paths.

```typescript
const preparePaths = (svgEl: SVGElement) => {
  gsap.set(svgEl, { opacity: 0 })

  const paths = svgEl.querySelectorAll('path')
  // ... preparar longitudes y offsets
}
```

Then when it is time to draw, I reveal it on the first frame of the timeline:

```typescript
tl.to(svgEl, { opacity: 1, duration: 0.01 })
tl.to(paths, {
  strokeDashoffset: 0,
  visibility: 'visible',
  duration
})
```

### Turning it into Vue components saved me from repeating code everywhere

I ended up building a script that transforms exported SVGs into Vue components with an exposed `ref`. That lets the doodle animation composable access the real DOM node without smashing encapsulation.

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

Using `currentColor` instead of fixed color also helped. Doodles inherit context color, so I do not have to maintain duplicated variants for dark and light backgrounds.

---

## To keep all this from collapsing, there was no silver bullet

Performance did not come from one magical optimization. It came from several small, unglamorous decisions that together kept the page stable.

I already mentioned `ignoreMobileResize`, which removed absurd mobile recalculations. But there was more.

### Matter.js: pause and resume is better than destroy

In the contact section, I do not destroy the engine every time it leaves the viewport. I pause it. Recreating it continuously is more expensive than keeping it ready.

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

`IntersectionObserver` is enough to decide when to stop and when to resume.

### On the 404 page, I cut physics as soon as it stopped adding value

The 404 page also uses physics for the number. Once it falls, bounces a bit, and settles, continuing to compute frames is wasted CPU. I added a simple settle detector.

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

If it stays almost still for around one second, everything stops. Users lose nothing visually, and the page stops working in the background.

### Resize runs with debounce

Window resize triggers a lot of recalculation: canvas, offsets, triggers. If you react to every pixel change, you constantly redo work.

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

For physics specifically, I also only reinitialize when width really changes. If variation is tiny, I ignore it:

```typescript
const newWidth = container.clientWidth
if (Math.abs(newWidth - prevWidth) < 50) return
```

Not brilliant technique. Just setting a sensible threshold and not recalculating for sport.

---

## What I would repeat and what I would not

Yes, it was worth it. But not because everything was smooth from day one. It was worth it because it forced me to solve problems that never appear in small demos.

GSAP still feels like the most solid piece in this stack. The documentation is good, errors are usually readable, and `gsap.context()` fits Vue really well when you want clean teardown. Lenis requires getting loop and sync fully locked down, but once that is done, it behaves reliably.

Matter.js surprised me in a good way. It is pretty direct for this kind of effect: engine, bodies, world, and a canvas that draws what is needed. Not much magic. And doodles are still probably the most personal part of the whole portfolio. The technique is old, yes, but turning hand-drawn strokes into reusable components gives a result that would have been hard to get from a more generic solution.

If I rebuilt this today, I would review horizontal scroll more carefully, because it has its own Lenis instance and that forces extra care so it does not clash with the global one. I would also question whether the hero complexity really needs that exact pinning system, or whether I could now get a similar result with fewer moving parts.

Still, I do not regret it. The result feels close to what I wanted from the start: a site that does not just move, but feels intentionally built.
