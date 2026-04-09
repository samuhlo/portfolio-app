---
title: Atipo Foundry — tipografía de alto nivel preto da casa
description: Ás veces buscamos assets premium fóra e esquecemos mirar preto. O meu descubrimento de Atipo, o estudo asturiano detrás de Silka Mono e Strawford.
date: '2026-03-17'
category: find
topics: ['tipografia', 'deseño', 'ui', 'atipo', 'recursos']
time_to_read: 5
published: true
lang: gl
translationKey: atipo-foundry
slug: atipo-foundry-tipografia-de-alto-nivel-preto-da-casa
---

## O asset que tiñas ao lado

Cando constrúes produtos dixitais, as tipografías de Google Fonts acaban quedando curtas. Non porque sexan malas, senón porque precisas algo con máis carácter, máis pesos, ou simplemente algo que non estea en tres millóns de webs máis.

O reflexo automático é abrir Typewolf, ver que estudo tipográfico de Brooklyn, Berlín ou Suíza está de moda este mes e preparar a tarxeta.

Descubrín :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Atipo Foundry] hai un tempo e rompeume un pouco os esquemas. É un estudo de Xixón que leva anos sacando tipografías cun nivel técnico e estético altísimo. Non é só que as letras sexan bonitas: o kerning, a lexibilidade en pantalla e a estrutura xeométrica aguantan moi ben cando as metes nunha interface densa. E están a dúas horas en coche.

## As miñas tres licenzas de Atipo

Non cheguei a estas tres por descarte. Cheguei porque cada unha me resolvía algo concreto que non estaba atopando noutras.

**Strawford** úsoa como tipografía base de interfaces. O que me engancha dela é que é xeométrica pero non aséptica: ten unha calidez que moitas xeométricas puras adoitan sacrificar por manter todo baixo control. En contornos de alto contraste, en titulares ou en bloques de lectura densa, aséntase sen molestar ou tira da mirada segundo o peso que lle metas. E iso, nunha tipografía de UI, vale moitísimo.

**Silka Mono** téñoa en case todas as partes da interface que precisan comunicar precisión: etiquetas, datas, datos numéricos, microcopy técnico. Non é só que sexa bonita, que tamén, senón que fai que eses elementos parezan parte dun sistema e non un engadido de última hora. Hai monoespaciadas que cargan visualmente o layout. Esta non.

**Bariol Icons** useina para o logotipo de [TinyShow](https://tinyshow.vercel.app/) e foi probablemente a decisión máis rápida de todo o proceso de deseño: vina, ocorréuseme usala nun spinner e non houbo máis voltas.

::image-slider
---
height: 750
maxWidth: 1400px
images:
  - src: https://www.atipofoundry.com/media/pages/fonts/strawford/3c088c2e7b-1620143428/strawford-font-03.jpg
    alt: Espécime da familia Strawford
    label: STRAWFORD_EXAMPLE_01
  - src: https://www.atipofoundry.com/media/pages/fonts/strawford/5bfabf34ec-1620143428/strawford-font-12.jpg
    alt: Espécime da familia Strawford
    label: STRAWFORD_EXAMPLE_02
  - src: https://www.atipofoundry.com/media/pages/fonts/silka-mono/f9334ad42b-1591511644/Silka-Mono-09.jpg
    alt: Espécime da familia Silka Mono
    label: SILKA_MONO_EXAMPLE_01
  - src: https://www.atipofoundry.com/media/pages/fonts/silka-mono/7998f2ef74-1591511642/Silka-Mono-12.jpg
    alt: Espécime da familia Silka Mono
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

## O modelo "Pay what you want"

Atipo ten un modelo de distribución moi honesto. En moitas familias deixan descargar gratis un dos pesos, e se queres a familia completa con todos os pesos, itálicas e licenzas web, entras no modelo "pay what you want". Para a calidade que entregan, paréceme unha forma moi intelixente de deixarche probar sen obrigarte a comprar ás cegas.

Déixanche probar a fonte no teu contorno de deseño, ver se encaixa e, se che funciona, pagar despois. Como investimento en activos para o teu stack persoal, a min compénsame moitísimo.

## Atipo e a boa tipografía

Quería escribir isto para deixar constancia e darlles as grazas. Ás veces cegámonos buscando a excelencia fóra, coma se o mellor deseño ou a mellor enxeñaría só puidesen saír dos grandes hubs internacionais, e esquecemos mirar preto cando o nivel está aí.

Se estás montando un produto, o teu portfolio, ou simplemente estás farto de tirar sempre de Inter e Roboto, bótalle un ollo ao seu catálogo.

:hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="2em"}[**Están en [atipofoundry.com](https://www.atipofoundry.com/)**]
