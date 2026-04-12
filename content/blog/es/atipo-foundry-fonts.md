---
title: "Atipo Foundry: tipografía de alto nivel a dos horas de casa"
description: A veces buscamos assets premium fuera y se nos olvida mirar cerca. Mi descubrimiento de Atipo, el estudio asturiano detrás de Silka Mono y Strawford.
date: '2026-03-25'
category: find
topics: ['tipografía', 'diseño', 'ui', 'atipo', 'recursos']
time_to_read: 5
published: true
lang: es
translationKey: atipo-foundry
slug: atipo-foundry-tipografia-de-alto-nivel
---

## La typo al lado de casa

Muchas veces, cuando construyes productos digitales, y más si vas rápido, tiras de Google Fonts. Pero cuando quieres un toque más personal y distintivo, se te queda corto. No porque sean fuentes malas ni porque no tengan variedad, sino porque buscas algo más especial, que no esté en tres millones de webs.

Puedes hacer una búsqueda y encontrar rápido las tipografías más usadas o tendencias nuevas (por ejemplo, yo sigo varios canales de diseño que te dan ideas muy buenas). Puedes entrar en Behance o Dribbble a buscar inspiración, puedes ir mirando en Awwwards las páginas que te gustan e investigar sus fuentes... y con todo eso montarte un "backlog" de tipografías que vayan contigo y con los usos donde podrían encajar.

Pero vamos a ser sinceros, esto es raro salvo que te guste mucho o sea un proyecto bastante importante. La mayoría entraríamos en Typewolf, miraríamos las 20 primeras que están de moda y seleccionaríamos. O en FontShare, o en la que más te guste. Y esto es así, lo hacemos más de lo que nos gustaría reconocer y es normal (no siempre hay tiempo, no todo el mundo le da tanto valor a la tipografía, muchas te parecen iguales).

Pero hace un tiempo descubrí un estudio de diseño que me cambió un poco el chip. Es un estudio de Gijón que lleva años sacando tipografías con un nivel técnico y estético altísimo. No es solo que las letras sean bonitas. Es que el kerning, la legibilidad en pantalla y la estructura geométrica aguantan de lujo cuando las metes en una interfaz densa. Y, encima, están a dos horas en coche de mi tierra natal.

Desde que los conocí, primero miro ahí por si alguna me encaja y no me suelo arrepentir, porque siempre tienen algo que me encanta.

## Mis tres licencias de Atipo

De momento, para web (para diseño tengo bastantes más), he usado tres. Tres que cada una me resolvía algo concreto y que no encontraba en otras hasta el momento en que las vi.

**Strawford** es la base de todo el blog y el portfolio. La base de la interfaz. Me gusta la calidez que tiene, cosa que muchas geométricas puras sacrifican por mantenerlo todo bajo control. En entornos con contraste alto, en titulares o en bloques de lectura más densos, encaja en todo sin molestar y te arrastra la mirada según el peso que le metas. Esto es un win por partida doble en una tipografía de UI.

**Silka Mono** es la tipografía estilo código, pero más humana. La tengo en casi todas las partes de la web que tienen que comunicar precisión (etiquetas, fechas, datos numéricos, botones...). No carga nada la interfaz y fluye que da gusto. Junto con Strawford, me parece que forman un combo que transmite una calidez y una sensación muy agradable a la vista.

**Bariol Icons** la usé para el logotipo de [TinyShow](https://tinyshow.vercel.app/) y fue probablemente la decisión más rápida de todo el proceso. Cuando la vi sabía lo que quería hacer con ella, y ahí quedó: un spinner en el logotipo. Pienso usarla como detalle en más cosas en el futuro porque me encanta.

::image-slider
---
height: 750
maxWidth: 1400px
images:
  - src: https://www.atipofoundry.com/media/pages/fonts/strawford/3c088c2e7b-1620143428/strawford-font-03.jpg
    alt: Espécimen de la familia Strawford
    label: STRAWFORD_EXAMPLE_01
  - src: https://www.atipofoundry.com/media/pages/fonts/strawford/5bfabf34ec-1620143428/strawford-font-12.jpg
    alt: Espécimen de la familia Strawford
    label: STRAWFORD_EXAMPLE_02
  - src: https://www.atipofoundry.com/media/pages/fonts/silka-mono/f9334ad42b-1591511644/Silka-Mono-09.jpg
    alt: Espécimen de la familia Silka Mono
    label: SILKA_MONO_EXAMPLE_01
  - src: https://www.atipofoundry.com/media/pages/fonts/silka-mono/7998f2ef74-1591511642/Silka-Mono-12.jpg
    alt: Espécimen de la familia Silka Mono
    label: SILKA_MONO_EXAMPLE_02
---
::

::code-preview
---
height: 450
maxWidth: 850px
align: center
html: |
  <div class="demo-wrapper">
    <div class="badge font-silka">Atipo Foundry // Gijón</div>

    <h2 class="title font-strawford">
      <span class="char">S</span><span class="char">t</span><span class="char">r</span><span class="char">a</span><span class="char">w</span><span class="char">f</span><span class="char">o</span><span class="char">r</span><span class="char">d</span>
      <span class="char">&nbsp;</span>
      <span class="char">+</span>
      <span class="char">&nbsp;</span>
      <span class="char">S</span><span class="char">i</span><span class="char">l</span><span class="char">k</span><span class="char">a</span>
    </h2>

    <div class="code-block font-silka">
      <span class="line"><span class="hl-keyword">const</span> stack = [</span>
      <span class="line">  <span class="hl-string">'Vue 3'</span>,</span>
      <span class="line">  <span class="hl-string">'GSAP'</span>,</span>
      <span class="line">  <span class="hl-string">'Atipo Fonts'</span></span>
      <span class="line">];</span>
    </div>

    <button class="replay-btn font-silka">Ejecutar Timeline</button>
  </div>
css: |
  body {
    background: #0c0011;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: clamp(0.8rem, 3vw, 1.4rem);
    box-sizing: border-box;
  }

  .demo-wrapper {
    width: min(100%, 760px);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    align-items: flex-start;
    padding: clamp(1rem, 3vw, 2.2rem);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
  }

  .font-strawford {
    font-family: 'Strawford', system-ui, sans-serif;
  }

  .font-silka {
    font-family: 'Silka Mono', monospace;
  }

  .badge {
    font-size: clamp(0.62rem, 2.4vw, 0.72rem);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #ffca40;
  }

  .title {
    font-size: clamp(1.45rem, 8vw, 3rem);
    font-weight: 500;
    color: #faf3f0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    line-height: 1.05;
  }

  .char {
    display: inline-block;
  }

  .code-block {
    width: min(100%, 38rem);
    max-width: 100%;
    background: rgba(0, 0, 0, 0.4);
    padding: clamp(0.85rem, 2.4vw, 1.2rem);
    border-radius: 4px;
    font-size: clamp(0.73rem, 2.7vw, 0.85rem);
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border: 1px solid rgba(255, 255, 255, 0.04);
    overflow-x: auto;
  }

  .line {
    white-space: pre;
  }

  .hl-keyword { color: #ffca40; }
  .hl-string { color: #a3be8c; }

  .replay-btn {
    margin-top: 1rem;
    background: transparent;
    border: 1px solid rgba(255, 202, 64, 0.5);
    color: #ffca40;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    font-size: clamp(0.66rem, 2.4vw, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.2s ease;
  }

  .replay-btn:hover {
    background: #ffca40;
    color: #0c0011;
  }

  @media (max-width: 640px) {
    .replay-btn {
      width: 100%;
      text-align: center;
    }
  }
js: |
  const tl = gsap.timeline();

  const playAnim = () => {
    tl.clear()
      .set('.char', { y: '100%', opacity: 0 })
      .set('.code-block', { opacity: 0, x: -15 })
      .set('.badge', { opacity: 0, y: -10 })
      .to('.badge', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      .to('.char', {
        y: '0%',
        opacity: 1,
        duration: 0.7,
        stagger: 0.03,
        ease: 'power3.out'
      }, '-=0.2')
      .to('.code-block', {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4');
  };

  playAnim();

  document.querySelector('.replay-btn').addEventListener('click', () => {
    playAnim();
  });
---
::

## El modelo "Pay what you want"

Atipo tiene un modelo de distribución muy honesto. En muchas familias te dejan descargar gratis uno de los pesos para que pruebes, y en otras te lo dejan si compartes su trabajo (lo cual me parece genial). Así, con ese peso puedes hacer pruebas y, si ves que te convence, te pillas la familia completa o lo que necesites. Hay que diferenciar también qué licencia quieres, si solo para diseño o si la quieres meter en una web. Son diferentes y hay que pillarlas por separado, con un modelo "pay what you want".

Con la calidad que tienen, me parece un modelo genial. Donde otras fuentes podrían costarte una costilla flotante, aquí con un mínimo te la puedes llevar.

## Atipo y la buena tipografia

Me apetecía escribir esto para dejar constancia y darles las gracias. A veces nos cegamos buscando todo fuera, como si el mejor diseño o el mejor talento estuviera a miles de kilómetros. Y no somos capaces de ver el talento de lo más cercano, ni de comprometernos a apoyar lo nuestro. A veces ya no es solo eso, también cuesta más encontrar las cosas de aquí en un océano de referencias. Pero poniéndole un poco más de ganas, puedes encontrar talento al lado de casa y apoyar proyectos locales sin perder calidad (qué coño, y ganando calidad y originalidad).

Si estás montando un producto, tu portfolio, o simplemente estás harto de tirar siempre de Inter y Roboto, échale un ojo a su catálogo.

:hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="2em"}[**Están en [atipofoundry.com](https://www.atipofoundry.com/)**]
