---
title: Atipo Foundry -- High-End Type Two Hours from Home
description: Sometimes we search for premium assets abroad and forget to look nearby. This is how I discovered Atipo, the Asturias studio behind Silka Mono and Strawford.
date: '2026-03-25'
category: find
topics: ['typography', 'design', 'ui', 'atipo', 'resources']
time_to_read: 5
published: true
lang: en
translationKey: atipo-foundry
slug: atipo-foundry-high-end-type-close-to-home
---

## The asset you had next to you

When you build digital products, Google Fonts eventually starts feeling limited. Not because those fonts are bad, but because you need more character, more weights, or simply something that is not already on three million other websites.

The default reflex is opening Typewolf, checking which type studio in Brooklyn, Berlin, or Switzerland is trending this month, and getting your card ready.

I discovered :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Atipo Foundry] a while ago, and it reset my expectations a bit. It is a studio from Gijon that has been releasing typefaces with very high technical and aesthetic quality for years. It is not just that the letterforms look good: kerning, on-screen readability, and geometric structure all hold up extremely well in dense interfaces. And they are two hours away by car.

## My three Atipo licenses

I did not land on these three by elimination. I picked them because each one solved something specific I could not find elsewhere.

**Strawford** is my base UI typeface. What hooks me is that it is geometric without feeling sterile: it keeps warmth that many strict geometric families usually sacrifice for control. In high-contrast environments, in headings, or in dense reading blocks, it can stay out of the way or pull attention depending on weight. That is huge value in a UI font.

**Silka Mono** is in almost every interface area where I need to communicate precision: labels, dates, numeric data, technical microcopy. It is not only beautiful, which it is, but it makes those elements feel like part of a system instead of a last-minute add-on. Some monospaced fonts overload a layout visually. This one does not.

**Bariol Icons** was what I used for the [TinyShow](https://tinyshow.vercel.app/) logotype, and it was probably the fastest decision in the entire design process: I saw it, imagined it in a spinner, and that was it.

::image-slider
---
height: 750
maxWidth: 1400px
images:
  - src: https://www.atipofoundry.com/media/pages/fonts/strawford/3c088c2e7b-1620143428/strawford-font-03.jpg
    alt: Strawford family specimen
    label: STRAWFORD_EXAMPLE_01
  - src: https://www.atipofoundry.com/media/pages/fonts/strawford/5bfabf34ec-1620143428/strawford-font-12.jpg
    alt: Strawford family specimen
    label: STRAWFORD_EXAMPLE_02
  - src: https://www.atipofoundry.com/media/pages/fonts/silka-mono/f9334ad42b-1591511644/Silka-Mono-09.jpg
    alt: Silka Mono family specimen
    label: SILKA_MONO_EXAMPLE_01
  - src: https://www.atipofoundry.com/media/pages/fonts/silka-mono/7998f2ef74-1591511642/Silka-Mono-12.jpg
    alt: Silka Mono family specimen
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

## The "Pay what you want" model

Atipo has a very honest distribution model. In many families, they let you download one weight for free, and if you want the full family with all weights, italics, and web licenses, you move into a "pay what you want" model. For the quality they deliver, it feels like a very smart way to let you test before forcing a blind purchase.

They let you test the typeface in your design environment, check whether it fits, and if it works, pay afterward. As an investment in assets for my personal stack, it pays off for me.

## Atipo and great typography

I wanted to write this to leave a record and say thanks. Sometimes we get blind chasing excellence abroad, as if great design or great engineering could only come from big international hubs, and we forget to look nearby when the quality is already there.

If you are building a product, your portfolio, or you are just tired of always defaulting to Inter and Roboto, check their catalog.

:hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="2em"}[**They are at [atipofoundry.com](https://www.atipofoundry.com/)**]
