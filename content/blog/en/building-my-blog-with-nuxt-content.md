---
title: How I Built My Blog with Nuxt Content
description: I discovered Nuxt Content while building the blog, and I was surprised by how customizable it is. Here I explain how it works, which components I built, and why I chose it.
date: "2026-03-19"
category: breakdown
topics: ["nuxt", "nuxt content", "vue", "markdown", "components"]
time_to_read: 8
published: true
lang: en
translationKey: blog-with-nuxt-content
slug: building-my-blog-with-nuxt-content
---

## I did not know it existed

When I sat down to build the blog, I had a clear plan: Notion as CMS, a webhook triggered on publish, an AI step to process content, and then store everything in a database. The same pipeline I was already using for portfolio projects. Familiar, tested, ready to copy-paste.

Then I came across :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Nuxt Content].

After half an hour of research, the original plan was in a drawer. Nuxt has a built-in content system that reads markdown files, parses them, validates them with schemas, renders Vue components inside the text, and serves everything from the same server. No extra database, no webhooks, no middleware in between.

It was not love at first sight. It was more like: "wait, this solves exactly what I needed." For a personal blog where the goal is to store what I learn and share it, it makes much more sense than building a full sync infrastructure.

The part that fully convinced me was component support. It is not just writing markdown and rendering it. You can use Vue directly inside the article with all the logic you want: lazy loading, sliders, live demos, whatever you can think of.

That is where I decided: this is what I want.

---

## What Nuxt Content is

A filesystem-as-CMS approach. You write an `.md` file in a folder, and Nuxt turns it into a web page. The basic structure is frontmatter plus content:

```markdown
---
title: Mi articulo
description: Una descripcion
date: 2026-03-13
category: breakdown
---

## Mi primer titulo

Esto es un parrafo normal.
```

That file lives in `content/blog/`, and Nuxt Content automatically turns it into `/blog/mi-articulo`. No route config, no extra pages. Just the file.

The interesting part is the schema. You define which frontmatter fields you expect and what types they have. If title is missing or category is invalid, the system fails at build time. It is basically TypeScript for your articles.

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

With this, you get editor autocomplete, build-time type checks, and zero `undefined` fields showing up where they should not.

And then there is rendering. Nuxt Content includes `<ContentRenderer>` to parse markdown into HTML, but it also allows Vue components directly in the text. That is where the real power is.

---

## The interesting part: components inside markdown

You can use Vue components like native HTML tags. Syntax is simple: `::component-name{prop="value"}` for blocks, and `:component-name{prop="value"}[content]` for inline elements.

For example, a post can include this:

```markdown
::blog-media
---
src: blog/mi-post/portada.jpg
alt: Mi proyecto
caption: Asi se veia al final
---
::

Aqui va un texto normal y luego algo inline: :hand-drawn{svg="/blog/doodles/underline.svg"}[dibujo a mano]
```

That renders an optimized image with caption, plus an animated SVG doodle under a word.

It is not magic. It is Vue. Every component is a normal `.vue` file with props, lifecycle hooks, whatever you need. The only difference is you invoke it from markdown instead of another component. Image carousels, live code demos, anything you want. All Vue, all in the article.

---

## The components I built

For the blog, I built several components used across posts. They are not designed to be generic. They are designed around how I write. Each one does exactly what I need, nothing more.

### BlogMedia -- images and video

The most basic one, but the one I use most. It renders images with Nuxt Image, or video if the file ends in `.mp4` or `.webm`. It supports caption, alignment, and max width.

But there is more under the hood: images are not in the repo or on the app server. They are in a Cloudflare R2 bucket with a custom domain (`assets.samuhlo.dev`).

The reason is simple: I do not want binaries in git. A couple images are fine, but if the blog grows, the repo becomes a problem. With R2, static content lives separately from code, the repo stays clean, and assets are served from Cloudflare CDN.

To upload files, there is a script (`scripts/upload-r2.ts`) that takes a file, uploads it to the bucket through AWS SDK (R2 API is S3-compatible), and returns the public URL. Credentials are in environment variables, script handles the rest.

The cleanest part of the setup is the alias in `nuxt.config.ts`:

```typescript
image: {
  domains: ['assets.samuhlo.dev'],
  alias: {
    blog: 'https://assets.samuhlo.dev/blog'
  }
}
```

With this, I can write `src: blog/mi-post/imagen.webp` instead of the full URL. Nuxt Image resolves the alias automatically, optimizes the image, and serves the correct format for each browser.

```markdown
::blog-media
---
src: blog/mi-post/demo.mp4
caption: Asi funciona
maxWidth: 60%
align: center
---
::
```

The component detects whether it is video or image and uses the right tag. Nothing complex, but it keeps all visual blog content consistent without thinking about it each time.

::blog-media
---
maxWidth: 760px
src: blog/blog-with-nuxt-content/jetpack_example_1.webp
alt: Example of image rendered with BlogMedia
---
::

### CodePreview -- live demos

I really like this one. It receives HTML, CSS, and JS as YAML props, and renders an iframe with the result. The reader can see the demo running or switch to code tabs to inspect how it is built.

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

It detects references to external libraries in JS (GSAP, Matter.js, ScrollTrigger, Draggable) and injects them from CDN automatically. No extra setup. It also uses Shiki for highlighting, the same one Nuxt Content uses for inline code, so everything keeps the same visual language. And like everything else, I customized it with the blog style.

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

### ImageSlider -- technical carousel

A slider with an "asset viewer" feel. It is not a generic carousel: it is designed to show multiple screenshots or visual resources from a project. Each image can include a label, and navigation works with click, swipe, or keyboard.

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

It has GSAP transitions, a cursor label that follows the mouse, and works well on both desktop and touch.

::image-slider
---
maxWidth: 760px
height: 620
images:
  - src: blog/blog-with-nuxt-content/jetpack_example_1.webp
    alt: ImageSlider example -- view 1
  - src: blog/blog-with-nuxt-content/jetpack_example_2.webp
    alt: ImageSlider example -- view 2
  - src: blog/blog-with-nuxt-content/jetpack_example_3.webp
    alt: ImageSlider example -- view 3
---
::

> By the way, these illustrations are by [Jetpacks & Rollerskates](https://www.instagram.com/jetpacksandrollerskates/)

### HandDrawn -- animated doodles

The most personal component. It wraps text with an SVG that animates as if hand-drawn. The SVG is positioned relative to content (under, over, around, sides), and the animation can trigger on scroll, load, or hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[doodle]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]
```

It uses the same `stroke-dashoffset` technique I was already using in the portfolio. The difference is that now I can use it in any article without copying code. Just write the tag and done.

---

## Prose components

Besides the "big" components, I also customized the default ones Nuxt Content uses to render standard markdown: ProseH2 and ProseH3 for headings with custom styling, ProsePre for code blocks with category color accents, ProseBlockquote for quotes, ProseA to distinguish internal and external links, and ProseCodeInline for inline code.

Each one is a Vue component overriding the default. No special config needed: create the file in the right folder and Nuxt uses it automatically.

---

## The article table of contents

In long posts, a sidebar table of contents that tells you where you are is the difference between comfortable reading and getting lost halfway through. I wanted one that highlights the active section while you scroll, with zero reader effort.

The `BlogPostInfo` component lives in the sidebar: it shows H2 headings as links and highlights whichever is currently in view. Conceptually simple. In practice, three timing problems I did not expect.

**The ID problem**

Nuxt Content assigns heading IDs asynchronously. Markdown is parsed, HTML is mounted, but `<h2>` `id` attributes appear a moment later once Nuxt Content renderer finishes processing the AST. In SPA navigation, if you enter an article without full page reload, the DOM is there but IDs are not yet.

The fix is waiting with recursive rAF until headings have IDs:

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

Not elegant, but it works. rAF runs every frame until all headings have IDs, then the component builds the TOC. In practice, 2-3 frames -- users do not notice.

**The Lenis and ScrollTrigger problem**

The blog uses Lenis for smooth scroll. I use GSAP ScrollTrigger to detect which section is on screen and update active heading in the TOC.

The issue is Lenis and ScrollTrigger competing for native scroll. ScrollTrigger listens to browser scroll, but Lenis intercepts and emulates it with its own system. Result: ScrollTrigger `scrub` and `pin` lose sync because they calculate offsets on a scroll that Lenis already transformed.

The fix is telling ScrollTrigger to use Lenis as scroll source instead of native:

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

With this, ScrollTrigger calculates positions using Lenis metrics instead of native scroll. Offsets align and active heading updates at the right time.

**The offset problem**

Even with the above, heading offsets failed on first load. Reason: Lenis needs one full tick to compute its own height/position metrics. If ScrollTrigger reads positions before Lenis finishes, numbers are wrong.

The fix is forcing a ScrollTrigger refresh after Lenis is ready:

```typescript
lenis.on('scroll', () => {
  ScrollTrigger.update();
});

nextTick(() => {
  ScrollTrigger.refresh();
});
```

`nextTick` guarantees Vue has finished rendering, and `refresh()` recalculates all positions from scratch with correct Lenis metrics.

Three different issues, all timing-related: what is ready before what. This kind of thing does not show up in docs for any one library. You find it when you combine them.

---

## Blog infrastructure

All of this lives in a small set of files. Schema in `content.config.ts`, articles in `content/blog/`, components in `app/components/content/`, and rendering page is normal Vue with `<ContentRenderer>`. No hidden layers. No external services that can go down. All Vue, all TypeScript, all in the same repo.

To get one article:

```typescript
const post = await queryCollection('blog').path('/blog/mi-slug').first();
```

For listing:

```typescript
const posts = await queryCollection('blog')
  .order('date', 'DESC')
  .where('published', '=', true)
  .all();
```

Two queries and everything is there. No external APIs, no complicated loading states. Content is available like any other app data.

What I value most is platform independence. If tomorrow I want to change something, I change it. If Notion shuts down or changes pricing, it does not matter: my articles are markdown files versioned in git. I underestimated how valuable that is before having it.

---

## The result

The system lets me write articles that combine linear writing with interactive demos, video, optimized images, and animation, all from the same markdown file without leaving the editor. When needed, I add a component. When not, I write normal text.

If you want to see it in a more complete post, [animating-portfolio-with-gsap-lenis-matterjs](/blog/animating-portfolio-with-gsap-lenis-matterjs) is a good example: it includes CodePreview with live GSAP and Matter.js, ImageSlider with process screenshots and videos, and HandDrawn integrated into the text.

What I value most is that the system is mine. I do not depend on third-party platforms, there are no arbitrary limits on what I can build, and if tomorrow I want to change something, I do. Content lives in versioned files inside the same repo. I underestimated that value before having it.

What it does require is accepting the initial overhead: schema setup, component creation, understanding the prose folder. It is not a huge amount of work, but it is not zero either.

---

## Looking ahead

The original Notion plan is not gone, it is paused.

The idea was to draft in Notion (where I am more comfortable for long drafts), pass content through a prompt that formats it using my components, review result, and push. Fully automated with n8n, with no manual friction. I still want to build that.

In fact, I already have part of it working: a Claude Code agent configured specifically for this blog. I feed it rough ideas, unstructured notes, typos, mixed fragments, and specify which components I want and where. The agent returns a formatted article: correct frontmatter, MDC components in place, heading hierarchy aligned, spelling cleaned up. I review, tweak what I do not like, and push. It handles the boring formatting work. Judgment about what goes in and how it is told stays with me.

When I wire up the n8n flow, that agent prompt will likely be the starting point.

But the foundation will remain Nuxt Content. The day I want to migrate to a conventional database, no drama: frontmatter becomes table fields, markdown body becomes main content, and articles are still articles. The structure is already designed for that.

For now, it works exactly how I wanted: I write, I use components when needed, and the blog updates when I push.
