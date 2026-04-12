---
title: "Atipo Foundry: High-End Type Close to Home"
description: "Sometimes we look abroad for premium assets and forget to look closer to home. This is how I found Atipo, the Asturias studio behind Silka Mono and Strawford."
date: '2026-03-25'
category: find
topics: ['tipografía', 'diseño', 'ui', 'atipo', 'recursos']
time_to_read: 5
published: true
lang: en
translationKey: atipo-foundry
slug: atipo-foundry-high-end-type-close-to-home
---

## The type sitting right next to you

A lot of the time, when you are building digital products, and even more if you are moving fast, you just rely on Google Fonts. But when you want something more personal and more distinctive, that starts to feel limited. Not because they are bad fonts, and not because there is no variety, but because you want something more special, something that is not already on three million websites.

You can search around and quickly find the most used typefaces or new trends (for example, I follow a few really good design channels that throw out great type ideas). You can jump into Behance or Dribbble for inspiration, you can browse Awwwards, find pages you like, and investigate their fonts... and from all that, build yourself a little type backlog that fits you and the kind of use cases where each one could work.

But let us be honest, that is rare unless you are really into type or the project actually matters a lot. Most of us would just open Typewolf, look at the first 20 trendy ones, and pick from there. Or FontShare, or whatever site you like most. And that is just how it goes. We do it more than we would like to admit, and it makes sense (you do not always have time, not everyone gives typography that much weight, and a lot of them start feeling the same).

But a while ago I found a design studio that changed my mindset a bit. It is a studio from Gijon that has been releasing typefaces for years with a ridiculously high technical and aesthetic level. It is not just that the letterforms look good. It is that the kerning, the screen legibility, and the geometric structure hold up beautifully when you drop them into a dense interface. And on top of that, they are two hours away by car from the place I come from.

Since I found them, they are the first place I check to see whether anything fits, and I usually do not regret it, because they always have something I end up loving.

## My three Atipo licenses

For web, at least for now (for design work I have quite a few more), I have used three. Three that each solved something specific for me, and that I was not finding anywhere else until I saw them.

**Strawford** is the base of the whole blog and portfolio. The base of the interface. I love the warmth it has, which is something a lot of pure geometric typefaces sacrifice to keep everything under control. In high-contrast environments, in headings, or in denser reading blocks, it fits everywhere without getting in the way and pulls your eye depending on the weight you use. That is a win-win in a UI typeface.

**Silka Mono** is the code-style typeface, but more human. I use it in almost every part of the site that needs to communicate precision (labels, dates, numeric data, buttons...). It does not weigh the interface down at all and it flows beautifully. Together with Strawford, I think they make a combo that gives off a warmth and a visual feeling that is just really pleasant.

**Bariol Icons** is what I used for the [TinyShow](https://tinyshow.vercel.app/) logo, and it was probably the fastest design decision of the whole process. The moment I saw it, I knew what I wanted to do with it, and that was that: a spinner in the logo. I plan to use it as a detail in more things in the future because I love it.

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

Atipo has a really honest distribution model. In many families they let you download one of the weights for free so you can test it, and in others they let you get it if you share their work (which I think is great). That way, with that one weight you can run your tests and, if it clicks, you pick up the full family or whatever you need. You also need to know what kind of license you want, whether it is just for design work or whether you want to put it on a website. They are different, and you have to buy them separately, under a "pay what you want" model.

For the quality they have, I think it is a brilliant model. Where other typefaces might cost you a kidney, here you can get them for a very reasonable minimum.

## Atipo and good typography

I felt like writing this to leave a record and to thank them. Sometimes we get blinded looking for everything outside, as if the best design or the best talent had to be thousands of miles away. And we stop seeing the talent that is right next to us, or stop committing to support what is ours. Sometimes it is not even just that, it is simply harder to find the things that are here in an ocean of references. But if you put in a little more effort, you can find talent close to home and support local projects without losing quality (hell, while actually gaining quality and originality).

If you are building a product, your portfolio, or if you are just tired of reaching for Inter and Roboto every time, go take a look at their catalog.

:hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="2em"}[**They are at [atipofoundry.com](https://www.atipofoundry.com/)**]
