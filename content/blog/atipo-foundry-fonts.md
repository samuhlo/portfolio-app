---
title: Atipo Foundry — tipografía de alto nivel a dos horas de casa
description: A veces buscamos assets premium en fundiciones internacionales y nos olvidamos de mirar cerca. Mi descubrimiento de Atipo, el estudio asturiano detrás de Silka Mono y Strawford.
date: '2026-03-15'
category: find
topics: ['tipografía', 'diseño', 'ui', 'atipo', 'recursos']
time_to_read: 5
published: true
slug: atipo-foundry
---

## El asset que tenías al lado

Cuando construyes productos digitales, las tipografías de Google Fonts acaban por quedarse cortas. No porque sean malas, sino porque necesitas algo con más carácter, más pesos, o simplemente algo que no esté en tres millones de webs más.

El reflejo automático es abrir Typewolf, ver qué fundición de Brooklyn, Berlín o Suiza está de moda este mes y preparar la tarjeta.

Descubrí :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Atipo Foundry] hace un tiempo y me rompió un poco los esquemas. Es un estudio de Gijón que lleva años sacando tipografías de una calidad técnica y estética brutal. No es solo que las letras sean bonitas: los kerning pairs, la legibilidad en pantallas de alta densidad y la estructura geométrica aguantan cualquier test de estrés que les eches en una interfaz densa. Y están a dos horas en coche.

## Mis tres licencias de Atipo

No llegué a estas tres por descarte. Llegué porque cada una resuelve algo concreto que no encontraba en otras.

**Strawford** la uso como tipografía base de interfaces. Lo que me engancha de ella es que es geométrica pero no aséptica: tiene una calidez que las geométricas puras suelen sacrificar por la coherencia formal. En entornos de alto contraste, en titulares, en bloques de lectura densa, se asienta sin llamar la atención o cautiva la mirada según el peso que le des. Que es exactamente lo que necesitas de una tipografía de UI.

**Silka Mono** la tengo en casi todas las partes de la interfaz que necesitan comunicar precisión: etiquetas, fechas, datos numéricos, micro-copys técnicos. No es que sea bonita (que también) sino que hace que esos elementos parezcan que pertenecen a un sistema, no que fueron añadidos a última hora. Hay monoespaciadas que cargan visualmente el layout. Ésta no.

**Bariol Icons** ya está en producción. La usé para el logotipo de [TinyShow](https://tinyshow.vercel.app/) y fue la decisión más rápida de todo el proceso de diseño: cuando la vi se me ocurrió usarla en un spinner y no hubo más deliberación.

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
  }
  .demo-wrapper {
    display: flex;

    flex-direction: column;
    gap: 1.2rem;
    align-items: flex-start;
    padding: 2.5rem;
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
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #ffca40;
  }
  .title {
    font-size: 3rem;
    font-weight: 500;
    color: #faf3f0;
    margin: 0;
    display: flex;
    overflow: hidden;
  }
  .char {
    display: inline-block;
  }
  .code-block {
    background: rgba(0, 0, 0, 0.4);
    padding: 1.2rem;
    border-radius: 4px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border: 1px solid rgba(255, 255, 255, 0.04);
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
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.2s ease;
  }
  .replay-btn:hover {
    background: #ffca40;
    color: #0c0011;
  }
js: |
  const tl = gsap.timeline();

  const playAnim = () => {
    // Reset states
    tl.clear()
      .set('.char', { y: '100%', opacity: 0 })
      .set('.code-block', { opacity: 0, x: -15 })
      .set('.badge', { opacity: 0, y: -10 })
      
      // Animate
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

  // Run on load
  playAnim();

  // Button interaction
  document.querySelector('.replay-btn').addEventListener('click', () => {
    playAnim();
  });
---
::

## El modelo "Pay what you want"

Atipo tiene un modelo de distribución muy honesto. Para casi todas sus familias, te permiten descargar un peso gratis (normalmente el Regular o Medium), o pagando lo que quieras. Si quieres la familia completa con todos los pesos, itálicas y licencias web, el precio base es ridículamente accesible para la calidad que entregan.

Te dejan probar el producto real en tu entorno de diseño, ver si encaja, y si te funciona, pagas. Como inversión en activos para tu stack personal, el retorno es absoluto.

## Menos hype, más ejecución

Quería escribir esto para dejar constancia y darles las gracias. A veces nos cegamos buscando la excelencia fuera, asumiendo que el mejor diseño o la mejor ingeniería solo ocurre en los grandes hubs internacionales.

Si estás montando un producto, tu portfolio, o estás harto de usar Inter y Roboto: échale un ojo a su catálogo.

:hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="2em"}[**Están en [atipofoundry.com](https://www.atipofoundry.com/)**]