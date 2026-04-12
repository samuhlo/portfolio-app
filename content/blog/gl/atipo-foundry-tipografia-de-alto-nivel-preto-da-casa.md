---
title: 'Atipo Foundry: tipografía de alto nivel preto da casa'
description: Ás veces buscamos assets premium fóra e esquecemos mirar preto. O meu descubrimento de Atipo, o estudo asturiano detrás de Silka Mono e Strawford.
date: '2026-03-25'
category: find
topics: ['tipografía', 'diseño', 'ui', 'atipo', 'recursos']
time_to_read: 5
published: true
lang: gl
translationKey: atipo-foundry
slug: atipo-foundry-tipografia-de-alto-nivel-preto-da-casa
---

## A typo ao lado da casa

Moitas veces, cando constrúes produtos dixitais, e máis se vas rápido, tiras de Google Fonts. Pero cando queres un toque máis persoal e distintivo, queda curto. Non porque sexan fontes malas nin porque non teñan variedade, senón porque buscas algo máis especial, que non estea en tres millóns de webs.

Podes facer unha busca e atopar rápido as tipografías máis usadas ou tendencias novas (por exemplo, eu sigo varios canais de deseño que che dan ideas moi boas). Podes entrar en Behance ou Dribbble a buscar inspiración, podes ir mirando en Awwwards as páxinas que che gustan e investigar as súas fontes... e con todo iso montar un "backlog" de tipografías que vaian contigo e cos usos onde poderían encaixar.

Pero imos ser sinceros, isto é raro salvo que che guste moito ou sexa un proxecto bastante importante. A maioría entraríamos en Typewolf, miraríamos as 20 primeiras que están de moda e seleccionaríamos. Ou en FontShare, ou na que máis che guste. E isto é así, facémolo máis do que nos gustaría recoñecer e é normal (non sempre hai tempo, non todo o mundo lle dá tanto valor á tipografía, moitas parécenche iguais).

Pero hai un tempo descubrín un estudo de deseño que me cambiou un pouco o chip. É un estudo de Xixón que leva anos sacando tipografías cun nivel técnico e estético altísimo. Non é só que as letras sexan bonitas. É que o kerning, a lexibilidade en pantalla e a estrutura xeométrica aguantan de luxo cando as metes nunha interface densa. E, ademais, están a dúas horas en coche da miña terra natal.

Dende que os coñecín, primeiro miro aí por se algunha me encaixa e non adoito arrepentirme, porque sempre teñen algo que me encanta.

## As miñas tres licenzas de Atipo

De momento, para web (para deseño teño bastantes máis), usei tres. Tres que cada unha me resolvía algo concreto e que non atopaba noutras ata o momento no que as vin.

**Strawford** é a base de todo o blog e do portfolio. A base da interface. Gústame a calidez que ten, algo que moitas xeométricas puras sacrifican por manter todo baixo control. En contornos con contraste alto, en titulares ou en bloques de lectura máis densos, encaixa en todo sen molestar e arrástrate a mirada segundo o peso que lle metas. Isto é un win por partida dobre nunha tipografía de UI.

**Silka Mono** é a tipografía estilo código, pero máis humana. Téñoa en case todas as partes da web que teñen que comunicar precisión (etiquetas, datas, datos numéricos, botóns...). Non carga nada a interface e flúe que dá gusto. Xunto con Strawford, paréceme que forman un combo que transmite unha calidez e unha sensación moi agradable á vista.

**Bariol Icons** useina para o logotipo de [TinyShow](https://tinyshow.vercel.app/) e foi probablemente a decisión máis rápida de todo o proceso. Cando a vin souben o que quería facer con ela, e aí quedou: un spinner no logotipo. Penso usala como detalle en máis cousas no futuro porque me encanta.

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

Atipo ten un modelo de distribución moi honesto. En moitas familias déixanche descargar gratis un dos pesos para que probes, e noutras déixancho se compartes o seu traballo (o cal me parece xenial). Así, con ese peso podes facer probas e, se ves que che convence, pillas a familia completa ou o que necesites. Hai que diferenciar tamén que licenza queres, se só para deseño ou se a queres meter nunha web. Son diferentes e hai que pillalas por separado, cun modelo "pay what you want".

Coa calidade que teñen, paréceme un modelo xenial. Onde outras fontes poderían custarche unha costela flotante, aquí cun mínimo xa as podes levar.

## Atipo e a boa tipografía

Apetecíame escribir isto para deixar constancia e darlles as grazas. Ás veces cegámonos buscando todo fóra, coma se o mellor deseño ou o mellor talento tivese que estar a miles de quilómetros. E deixamos de ver o talento que temos preto, ou de comprometernos a apoiar o noso. Ás veces nin sequera é só iso, simplemente custa máis atopar as cousas de aquí nun océano de referencias. Pero se lle poñes un pouco máis de ganas, podes atopar talento ao lado da casa e apoiar proxectos locais sen perder calidade (que carallo, e gañando calidade e orixinalidade).

Se estás montando un produto, o teu portfolio, ou simplemente estás farto de tirar sempre de Inter e Roboto, bótalle un ollo ao seu catálogo.

:hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="2em"}[**Están en [atipofoundry.com](https://www.atipofoundry.com/)**]
