---
title: How I Built My Blog with Nuxt Content
description: I discovered Nuxt Content while building the blog, and I was surprised by how customizable it is. Here I explain how it works, which components I built, and why I chose it.
date: '2026-03-19'
category: breakdown
topics: ['nuxt', 'nuxt content', 'vue', 'markdown', 'componentes']
time_to_read: 8
published: true
lang: en
translationKey: blog-with-nuxt-content
slug: building-my-blog-with-nuxt-content
---

## I didn't know it existed

When I sat down to build the blog, I had a very clear plan: Notion as a CMS, a webhook on publish, an AI step to process the content, and then storing it in a database. The same flow I was already using for portfolio projects. Familiar, tested, and ready to copy and paste.

Then I ran into :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Nuxt Content].

Half an hour later, the original plan was in a drawer. Nuxt has a built-in content system that reads markdown files, parses them, validates them with schemas, renders Vue components inside the text, and serves everything from the same server. No extra database, no webhooks, no middleware in the middle.

It was not love at first sight. It was more like, "wait, this solves exactly what I needed." For a personal blog where the goal is to keep track of what I learn and share it, it makes far more sense than building out a whole sync infrastructure.

What really sold me was the component side of it. It is not just about writing markdown and rendering it. You can use Vue directly inside the article, with whatever logic you want: lazy loading, sliders, live demos, whatever comes to mind.

That is when I decided: this is what I want.

---

## What Nuxt Content is

It is basically a file-based CMS. You write a `.md` file in a folder and Nuxt turns it into a web page. The basic structure is a file with frontmatter and content:

```markdown
---
title: Mi artículo
description: Una descripción
date: 2026-03-13
category: breakdown
---

## Mi primer título

Esto es un párrafo normal.
```

That file lives in `content/blog/`, and Nuxt Content automatically turns it into `/blog/mi-articulo`. No route setup, no extra pages. Just the file.

The interesting part starts with the schema. You define which frontmatter fields you expect and what types they should have. If the title is missing or you use a category that does not exist, the system rejects it at build time. It is basically like having TypeScript for your articles.

```typescript
// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.enum(['weekly_log', 'find', 'breakdown', 'roots']),
        topics: z.array(z.string()),
        time_to_read: z.number(),
        published: z.boolean(),
        slug: z.string(),
      }),
    }),
  },
});
```

With that, you get editor autocomplete, build-time type checking, and zero `undefined` fields showing up where they should not.

Then there is rendering. Nuxt Content includes `<ContentRenderer>`, which parses markdown into HTML, but it also lets you use Vue components directly inside the text. That is where the real power is.

---

## The interesting part: components inside markdown

You can use Vue components almost like native HTML tags. The syntax is pretty simple: `::nombre-componente{prop="valor"}` for block components, and `:nombre-componente{prop="valor"}[contenido]` for inline ones.

For example, a post can contain this:

```markdown
::blog-media
---
src: blog/mi-post/portada.jpg
alt: Mi proyecto
caption: Así se veía al final
---
::

Aquí va un texto normal y luego algo inline: :hand-drawn{svg="/blog/doodles/underline.svg"}[dibujo a mano]
```

That renders an optimized image with a caption, plus an animated SVG doodle under the word.

It is not magic. It is Vue. Every component is a normal `.vue` file with its props, its lifecycle, and whatever else you want. The only difference is that you call it from markdown instead of from another component. Image sliders, live code demos, whatever you want. All Vue, all inside the article.

---

## The components I built

For the blog, I made several components that I use in articles. They are not meant to be generic. They are built around how I write. Each one does exactly what I need, nothing more.

### BlogMedia (images and videos)

It is the most basic one, but also the one I use the most. It renders images with Nuxt Image or videos if the file ends in `.mp4` or `.webm`. It supports captions, alignment, and max width.

But there is more going on underneath: the images are not in the repo and not on the server. They live in a Cloudflare R2 bucket with a custom domain (`assets.samuhlo.dev`).

The reason is simple: I do not want binaries in git. A couple of images are fine, but if the blog grows, the repo becomes a problem. With R2, static content lives separately from the code, the repo stays clean, and the assets are served through Cloudflare's CDN.

To upload files, there is a script (`scripts/upload-r2.ts`) that takes a file, uploads it to the bucket using the AWS SDK (R2's API is S3-compatible), and returns the public URL. Credentials live in environment variables, and the script does the rest.

The cleanest part of the setup, for me, is the alias in `nuxt.config.ts`:

```typescript
image: {
  domains: ['assets.samuhlo.dev'],
  alias: {
    blog: 'https://assets.samuhlo.dev/blog'
  }
}
```

With that, I can write `src: blog/mi-post/imagen.webp` instead of the full URL. Nuxt Image resolves the alias automatically, optimizes the image, and serves it in the right format for the browser.

```markdown
::blog-media
---
src: blog/mi-post/demo.mp4
caption: Así funciona
maxWidth: 60%
align: center
---
::
```

The component detects whether it is a video or an image and uses the right tag. Nothing complicated, but it gives all the visual content in the blog a consistent feel without me having to think about it every time.

::blog-media
---
maxWidth: 760px
src: blog/blog-with-nuxt-content/jetpack_example_1.webp
alt: Example of an image rendered with BlogMedia
---
::

### CodePreview (live demos)

I like this one especially. It takes HTML, CSS, and JS as YAML props and renders an iframe with the result. The reader can see the demo running or switch to the code tabs to see how it works.

```markdown
::code-preview
---
height: 300
html: |
  <div class="box"></div>
css: |
  .box { width: 60px; height: 60px; background: #ffca40; }
js: |
  gsap.to(".box", { rotation: 360, duration: 1.5, repeat: -1 });
---
::
```

It detects whether the JS references external libraries (GSAP, Matter.js, ScrollTrigger, Draggable) and injects them from a CDN automatically. No extra setup. It also uses Shiki highlighting (the same one Nuxt Content uses for inline code), so everything keeps the same visual style. And like everything else, I customized it to fit the blog's aesthetic.

::code-preview
---
height: 260
maxWidth: 760px
align: center
html: |
  <div class="box"></div>
css: |
  body {
    background: #0c0011;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .box {
    width: 60px;
    height: 60px;
    background: #ffca40;
    border-radius: 4px;
  }
js: |
  gsap.to(".box", {
    rotation: 360,
    scale: 1.4,
    duration: 1.2,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
---
::
```

### ImageSlider (technical carousel)

It is a slider with an "asset viewer" aesthetic. Not a generic carousel. It is designed to show multiple screenshots or visual resources from a project. Each image can have a label, and you can navigate it with click, swipe, or keyboard.

```markdown
::image-slider
---
height: 420
images:
  - src: blog/mi-post/uno.jpg
    alt: Dashboard principal
    label: DASHBOARD_MAIN
  - src: blog/mi-post/dos.jpg
    alt: Vista mobile
    label: MOBILE_VIEW
---
::
```

It has GSAP-powered transitions, a cursor label that follows the mouse, and it works well both on desktop and on touch devices.

::image-slider
---
maxWidth: 760px
height: 620
images:
  - src: blog/blog-with-nuxt-content/jetpack_example_1.webp
    alt: ImageSlider example (view 1)
  - src: blog/blog-with-nuxt-content/jetpack_example_2.webp
    alt: ImageSlider example (view 2)
  - src: blog/blog-with-nuxt-content/jetpack_example_3.webp
    alt: ImageSlider example (view 3)
---
::

> By the way, these drawings were made by [Jetpacks & Rollerskates](https://www.instagram.com/jetpacksandrollerskates/)

### HandDrawn (animated doodles)

This one is the most personal. It wraps text with an SVG that animates as if it were being drawn by hand. The SVG is positioned relative to the content (under, over, around, on the sides), and the animation can be triggered on scroll, on load, or on hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[dibujo]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]
```

It is the same `stroke-dashoffset` technique I was already using in the portfolio. The difference is that now I can use it in any article without copying code. You just write the tag and that is it.

---

## Prose components

Besides the bigger components, I also customized the ones Nuxt Content uses by default to render normal markdown: ProseH2 and ProseH3 for styled headings, ProsePre for code blocks with the category color as an accent, ProseBlockquote for quotes, ProseA to distinguish internal and external links, and ProseCodeInline for inline code.

Each one is a Vue component that overrides the default. No special setup needed: you create the file in the right folder and Nuxt picks it up automatically.

---

## The article index

In long posts, having a side index that shows where you are makes the difference between reading comfortably and getting lost halfway through. I wanted one that would highlight the active section while you scroll, without the reader having to do anything.

The `BlogPostInfo` component lives in the sidebar: it shows the article's H2 headings as a list of links and highlights the one currently on screen as you move down. On paper, it was simple. In practice, I ran into three problems I did not expect.

**The ID problem**

Nuxt Content assigns IDs to headings asynchronously. The markdown gets parsed, the HTML gets mounted, but the `id` attributes on the `<h2>` only appear a moment later, once the Nuxt Content renderer has finished processing the AST. In an SPA navigation, if you land on an article without a full reload, the DOM is already there but the IDs are still missing.

The fix is to wait with a recursive rAF until the headings have IDs:

```typescript
const waitForHeadingIds = (resolve: () => void) => {
  const headings = document.querySelectorAll('.prose h2');
  const allHaveIds = [...headings].every(h => h.id);
  if (allHaveIds) {
    resolve();
  } else {
    requestAnimationFrame(() => waitForHeadingIds(resolve));
  }
};
```

It is not elegant, but it works. The rAF runs every frame until all the headings have IDs and, then, the component builds the index. In practice, that is 2 or 3 frames (the user does not even notice).

**The Lenis and ScrollTrigger problem**

The blog uses Lenis for smooth scrolling. I use GSAP's ScrollTrigger to detect which section is on screen and update the active heading in the TOC.

The problem is that Lenis and ScrollTrigger compete over native scroll. ScrollTrigger listens to the browser scroll, but Lenis intercepts it and emulates it with its own system. The result is that ScrollTrigger's `scrub` and `pin` lose sync, because they are calculating offsets on top of a scroll that Lenis has already modified.

The fix is to tell ScrollTrigger to use Lenis as its scroll source instead of the native one:

```typescript
lenis.on('scroll', ScrollTrigger.update);

ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    if (arguments.length && value !== undefined) {
      lenis.scrollTo(value, { immediate: true });
    }
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return {
      top: 0, left: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
});
```

With that in place, ScrollTrigger calculates positions using Lenis metrics instead of native scroll. The offsets line up and the active heading updates at the right time.

**The offset problem**

Even with the previous fix, heading offsets still failed on first load. The reason is that Lenis needs one full tick to calculate its own height and position metrics. If ScrollTrigger tries to read positions before Lenis is done, the numbers are wrong.

The solution is to force a ScrollTrigger refresh after Lenis is ready:

```typescript
lenis.on('scroll', () => {
  ScrollTrigger.update();
});

nextTick(() => {
  ScrollTrigger.refresh();
});
```

`nextTick` makes sure Vue has finished its render cycle, and `refresh()` recalculates all positions from scratch with Lenis using the right metrics.

Three different problems, all tied to timing (what is ready before what). That kind of thing usually does not show up in each library's docs on its own. You find it when you put them together.

---

## The blog infrastructure

All of this lives in just a few files. The schema is in `content.config.ts`, the articles are in `content/blog/`, the components are in `app/components/content/`, and the page that renders everything is just normal Vue with `<ContentRenderer>`. No hidden layers. No external services that can go down. All Vue, all TypeScript, all in the same repo.

To fetch one article:

```typescript
const post = await queryCollection('blog').path('/blog/mi-slug').first();
```

For the list page:

```typescript
const posts = await queryCollection('blog')
  .order('date', 'DESC')
  .where('published', '=', true)
  .all();
```

Two queries and that is it. No external APIs, no overcomplicated loading states. The content is just there, like any other piece of data in the app.

What I value most is that I do not depend on any platform. If tomorrow I want to change something, I change it. If Notion shuts down or changes its pricing, I do not care: my articles are markdown files versioned in git. That has more value than I realized until I had it.

---

## The result

The system lets me write articles that combine straight writing with interactive demos, video, optimized images, and animations, all from the same markdown file and without leaving the editor. When I need it, I drop in a component. When I do not, I just write plain text.

If you want to see it working in a fuller article, [animated-portfolio](/blog/animated-portfolio) is a good example: it has CodePreview with GSAP and Matter.js running live, ImageSlider with process screenshots and videos, and HandDrawn integrated into the text.

What I value most is that the system is mine. I do not depend on a third-party platform, there are no arbitrary limits on what I can do, and if tomorrow I want to change something, I change it. The content lives in versioned files inside the same repo. That level of control is worth more than it looks.

It does require accepting some initial overhead (setting up the schema, building the components, understanding the prose folder). It is not a massive amount of work, but it is not zero either.

---

## For the future

The original Notion plan is not gone. It is just on pause.

The idea was to be able to write in Notion (where I am more comfortable for long drafts), run the content through a prompt that formats it according to my components, review the result, and push. All automated with n8n, with no manual friction. It is still something I want to build.

In fact, I already have part of that working: a Claude Code agent configured specifically for this blog. I pass it my messy ideas, with no structure, spelling mistakes, mixed notes, and tell it which components I want and where. The agent gives back the formatted article (correct frontmatter, MDC components in place, heading hierarchy sorted out, spelling fixed). I review it, tweak what I do not like, and push. It does the boring formatting work. The judgment about what belongs in the article and how to tell it is still mine.

When I build the n8n flow, that agent prompt will probably be the starting point.

But the base is still going to be Nuxt Content. The day I want to move to a conventional database, it is not a big deal: the frontmatter becomes table fields, the markdown body becomes the main content, and the articles are still articles. The structure is already designed for that.

For now, it works exactly the way I wanted: I write, I use components when I need them, and the blog updates when I push.
