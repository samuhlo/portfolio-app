---
title: Como creei o meu blog con Nuxt Content
description: Descubrín Nuxt Content facendo o blog e sorprendeume o personalizable que é. Aquí explico como funciona, que compoñentes creei e por que decidín usalo.
date: '2026-03-19'
category: breakdown
topics: ['nuxt', 'nuxt content', 'vue', 'markdown', 'compoñentes']
time_to_read: 8
published: true
lang: gl
translationKey: blog-with-nuxt-content
slug: como-fixen-blog-con-nuxt-content
---

## Non sabía que existía

Cando me sentei a facer o blog, tiña o plan claro: Notion como CMS, un webhook que disparase ao publicar, unha IA que procesase o contido, gardalo en base de datos. O mesmo fluxo que xa usaba para os proxectos do portfolio. Coñecido, probado, listo para copiar e pegar.

Entón cruceime con :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Nuxt Content].

Media hora de investigación despois, o plan orixinal estaba no caixón. Nuxt ten un sistema de contido integrado que le ficheiros markdown, os parsea, permite validalos con esquemas, renderiza compoñentes Vue dentro do texto e sérveo todo desde o mesmo servidor. Sen base de datos extra, sen webhooks, sen middleware polo medio.

Non foi amor a primeira vista. Foi máis ben: "agarda, isto resolve exactamente o que precisaba". Para un blog persoal onde o obxectivo é gardar o que aprendo e compartilo, ten moito máis sentido ca montar toda unha infraestrutura de sincronización.

O que me acabou de convencer foi a parte dos compoñentes. Non é só escribir markdown e que o renderice. Podes usar Vue directamente no artigo, con toda a lóxica que queiras: lazy loading, sliders, demos en vivo, o que se che ocorra.

Aí decidín: isto é o que quero.

---

## Que é Nuxt Content

Sistema de ficheiros como CMS. Escribes un `.md` nun cartafol, Nuxt convérteo en páxina web. A estrutura básica é un ficheiro con frontmatter e contido:

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

Ese ficheiro vive en `content/blog/` e Nuxt Content convérteo automaticamente en `/blog/mi-articulo`. Sen configurar rutas, sen crear páxinas adicionais. Só o ficheiro.

O interesante vén co schema. Defines que campos esperas no frontmatter e que tipos teñen. Se falta o título ou pos unha categoría que non existe, o sistema rexéitao en build time. É como ter TypeScript para os teus artigos, basicamente.

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
        lang: z.enum(['es', 'en', 'gl']),
        translationKey: z.string(),
        image: z.string().optional(),
      }),
    }),
  },
});
```

Con isto tes autocompletado no editor, typecheck en build e cero campos `undefined` aparecendo onde non os esperas.

E despois está o rendering. Nuxt Content inclúe `<ContentRenderer>` que parsea o markdown a HTML, pero tamén permite compoñentes Vue directamente no texto. Aí está a potencia real.

---

## A parte interesante: compoñentes dentro do markdown

Podes usar compoñentes Vue coma se fosen tags HTML nativos. A sintaxe é simple: `::nombre-componente{prop="valor"}` para bloques, e `:nombre-componente{prop="valor"}[contenido]` para elementos inline.

Por exemplo, un post pode ter isto:

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

Iso renderiza unha imaxe optimizada con caption e un doodle SVG animado debaixo da palabra.

Non é maxia. É Vue. Cada compoñente é un `.vue` normal coas súas props, o seu lifecycle, o que queiras. A única diferenza é que o invocas desde o markdown no canto de facelo desde outro compoñente. Carrusel de imaxes, demo de código en vivo, o que che dea a gana. Todo Vue, todo no artigo.

---

## Os compoñentes que creei

Para o blog fixen varios compoñentes que se usan nos artigos. Non están pensados para ser xenéricos: están pensados para como eu escribo. Cada un fai exactamente o que preciso, sen máis.

### BlogMedia — imaxes e vídeos

O máis básico pero o que máis uso. Renderiza imaxes con Nuxt Image ou vídeos se o ficheiro remata en `.mp4` ou `.webm`. Soporta caption, aliñación e ancho máximo.

Pero hai algo máis por debaixo: as imaxes non están no repo nin no servidor. Están nun bucket de Cloudflare R2 con dominio personalizado (`assets.samuhlo.dev`).

O motivo é simple: non quero binarios en git. Cun par de imaxes non pasa nada, pero se o blog medra, o repo convértese nun problema. Con R2, o contido estático vive separado do código, o repo mantense limpo e os assets sérvense desde a CDN de Cloudflare.

Para subir ficheiros hai un script (`scripts/upload-r2.ts`) que recibe o ficheiro, súbeo ao bucket usando o AWS SDK (a API de R2 é compatible con S3) e devolve a URL pública. As credenciais van en variables de contorno, o script fai o traballo.

O máis limpo do setup é o alias en `nuxt.config.ts`:

```typescript
image: {
  domains: ['assets.samuhlo.dev'],
  alias: {
    blog: 'https://assets.samuhlo.dev/blog'
  }
}
```

Con isto podo escribir `src: blog/mi-post/imagen.webp` no canto da URL completa. Nuxt Image resolve o alias automaticamente, optimiza a imaxe e sérvea no formato correcto segundo o navegador.

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

O compoñente detecta se é vídeo ou imaxe e usa o tag correspondente. Nada complexo, pero fai que todo o contido visual do blog teña consistencia sen ter que pensalo cada vez.

::blog-media
---
maxWidth: 760px
src: blog/blog-with-nuxt-content/jetpack_example_1.webp
alt: Exemplo de imaxe renderizada con BlogMedia
---
::

### CodePreview — demos en vivo

Este gústame especialmente. Recibe HTML, CSS e JS como props YAML, e renderiza un iframe co resultado. O lector pode ver a demo funcionando ou cambiar ás lapelas de código para ver como está feito.

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

Detecta se no JS hai referencias a librarías externas (GSAP, Matter.js, ScrollTrigger, Draggable) e inxéctaas desde CDN automaticamente. Sen configuración adicional. Tamén ten highlighting vía Shiki, o mesmo que usa Nuxt Content para código inline, así todo queda co mesmo estilo visual. E como todo, personalizeino coa miña estética do blog.

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

### ImageSlider — carrusel técnico

Un slider con estética de "asset viewer". Non é un carousel xenérico: está deseñado para amosar múltiples screenshots ou recursos visuais dun proxecto. Cada imaxe pode ter unha label, e navegas con click, swipe ou teclado.

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

Ten transicións animadas con GSAP, un cursor label que segue o rato e funciona ben tanto en desktop como en touch.

::image-slider
---
maxWidth: 760px
height: 620
images:
  - src: blog/blog-with-nuxt-content/jetpack_example_1.webp
    alt: Exemplo de ImageSlider — vista 1
  - src: blog/blog-with-nuxt-content/jetpack_example_2.webp
    alt: Exemplo de ImageSlider — vista 2
  - src: blog/blog-with-nuxt-content/jetpack_example_3.webp
    alt: Exemplo de ImageSlider — vista 3
---
::

> Por certo, estes debuxos están feitos por [Jetpacks & Rollerskates](https://www.instagram.com/jetpacksandrollerskates/)

### HandDrawn — doodles animados

O máis persoal. Envolve texto cun SVG que se anima coma se se estivese debuxando a man. O SVG posiciónase relativo ao contido (debaixo, enriba, arredor, aos lados), e a animación dispárase en scroll, en load ou en hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[dibujo]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]
```

É a mesma técnica de `stroke-dashoffset` que xa usaba no portfolio. A diferenza é que agora podo usala en calquera artigo sen copiar código. Só escribes o tag e listo.

---

## Compoñentes do prose

Ademais dos compoñentes "grandes", personalizei os que Nuxt Content usa por defecto para renderizar markdown estándar: ProseH2 e ProseH3 para headings con estilo propio, ProsePre para bloques de código coa cor da categoría como acento, ProseBlockquote para citas, ProseA para distinguir links internos de externos e ProseCodeInline para código inline.

Cada un é un compoñente Vue que sobreescribe o default. Non fai falta configuración especial: só crear o ficheiro no cartafol correcto e Nuxt úsao automaticamente.

---

## O índice do artigo

En posts longos, un índice lateral que che diga onde estás marca a diferenza entre ler cómodo ou perderte a metade do artigo. Quería un que resaltase a sección activa mentres fas scroll, sen que o lector teña que facer nada.

O compoñente `BlogPostInfo` vive na sidebar: amosa os H2 do artigo como lista de enlaces e vai marcando cal está en pantalla segundo avanzas. Conceptualmente simple. Na práctica, tres problemas que non esperaba.

**O problema dos IDs**

Nuxt Content asigna IDs aos headings de forma asíncrona. O markdown parsease, o HTML móntase, pero os atributos `id` dos `<h2>` aparecen un intre despois, cando o renderer de Nuxt Content rematou de procesar o AST. Nunha navegación SPA, se chegas a un artigo sen recargar a páxina, o DOM está aí pero os IDs aínda non.

A solución é agardar cun rAF recursivo ata que os headings teñen ID:

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

Non é elegante, pero funciona. O rAF execútase en cada frame ata que todos os headings teñen ID, e entón o compoñente constrúe o índice. Na práctica son 2-3 frames; o usuario non nota nada.

**O problema de Lenis e ScrollTrigger**

O blog usa Lenis para o smooth scroll. ScrollTrigger de GSAP úsao para detectar que sección está en pantalla e actualizar o heading activo no TOC.

O problema é que Lenis e ScrollTrigger compiten polo scroll nativo. ScrollTrigger escoita o scroll do navegador, pero Lenis interceptrao e emúlao co seu propio sistema. O resultado: os `scrub` e os `pin` de ScrollTrigger perden sincronización porque están calculando offsets sobre un scroll que Lenis xa modificou.

A solución é dicirlle a ScrollTrigger que use Lenis como fonte de scroll no canto do nativo:

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

Con isto, ScrollTrigger calcula as súas posicións usando as métricas de Lenis no canto do scroll nativo. Os offsets cadran e o heading activo actualízase no momento correcto.

**O problema dos offsets**

Mesmo co anterior, os offsets dos headings fallaban na primeira carga. O motivo: Lenis precisa un tick completo para calcular as súas propias métricas de altura e posición. Se ScrollTrigger intenta ler as posicións antes de que Lenis remate, os números están mal.

A solución é forzar un refresh de ScrollTrigger despois de que Lenis estea listo:

```typescript
lenis.on('scroll', () => {
  ScrollTrigger.update();
});

nextTick(() => {
  ScrollTrigger.refresh();
});
```

O `nextTick` garante que Vue rematou o seu ciclo de renderizado, e o `refresh()` recalcula todas as posicións desde cero coas métricas correctas de Lenis.

Tres problemas distintos, todos relacionados con timing: con que está listo antes ca que. Ese tipo de cousas non aparece na documentación de ningunha das librarías por separado. Atópaso cando as xuntas.

---

## A infraestrutura do blog

Todo isto vive en poucos ficheiros. O schema en `content.config.ts`, os artigos en `content/blog/`, os compoñentes en `app/components/content/` e a páxina que renderiza é Vue normal con `<ContentRenderer>`. Non hai capas ocultas. Non hai servizos externos que poidan caer. Todo Vue, todo TypeScript, todo no mesmo repo.

Para obter un artigo:

```typescript
const post = await queryCollection('blog').path('/blog/mi-slug').first();
```

Para a listaxe:

```typescript
const posts = await queryCollection('blog')
  .order('date', 'DESC')
  .where('published', '=', true)
  .all();
```

Dúas queries e tes todo. Nada de APIs externas, nada de estados de carga complicados. O contido está aí, dispoñible como calquera outro dato na app.

O que máis valoro é que non dependo de ningunha plataforma. Se mañá quero cambiar algo, cámbioo. Se Notion pecha ou cambia prezos, dáme igual: os meus artigos son ficheiros markdown versionados en git. Iso ten un valor que subestimei antes de telo.

---

## O resultado

O sistema permite escribir artigos que combinan redacción lineal con demos interactivos, vídeo, imaxes optimizadas e animacións, todo desde o mesmo ficheiro markdown, sen saír do editor. Cando o precisas, metes un compoñente. Cando non, escribes texto normal.

Se queres velo funcionando nun artigo máis completo, o de [animated-portfolio](/blog/animando-portfolio-con-gsap-lenis-matterjs) é un bo exemplo: ten CodePreview con GSAP e Matter.js correndo en vivo, ImageSlider con capturas do proceso e vídeos, e HandDrawn integrado no texto.

O que máis valoro é que o sistema é meu. Non dependo dunha plataforma de terceiros, non hai límites arbitrarios sobre o que podo facer, e se mañá quero cambiar algo, cámbioo. O contido vive en ficheiros versionados no mesmo repo. Iso ten un valor que subestimei antes de telo.

O que si require é asumir o overhead inicial: configurar o schema, crear os compoñentes, entender o cartafol de prose. Non é moito traballo, pero tampouco é cero.

---

## Para o futuro

O plan orixinal con Notion non desapareceu: está en pausa.

A idea era poder escribir en Notion (onde me resulta máis cómodo para borradores longos), pasar o contido por un prompt que o formatee segundo os meus compoñentes, revisar o resultado e facer push. Todo automatizado con n8n, sen fricción manual. Segue sendo algo que me apetece montar.

De feito, xa teño parte diso funcionando: un axente de Claude Code configurado especificamente para este blog. Pásolle as miñas ideas en bruto, sen estrutura, con faltas de ortografía, notas mesturadas, e indico que compoñentes quero e onde. O axente devolve o artigo formatado: frontmatter correcto, compoñentes MDC colocados, headings coa xerarquía axeitada, ortografía resolta. Eu reviso, axusto o que non me convence e fago push. O traballo aburrido de formatar faino el. O criterio sobre que vai e como se conta segue sendo meu.

Cando monte o fluxo con n8n, ese prompt do axente é probablemente o punto de partida.

Pero a base vai seguir sendo Nuxt Content. O día que queira migrar a unha base de datos convencional, non hai drama: o frontmatter pasa a ser campos dunha táboa, o corpo do markdown pasa a ser o contido principal, e os artigos seguen sendo artigos. A estrutura xa está pensada para iso.

Por agora funciona exactamente como quería: escribo, uso os compoñentes cando os preciso e o blog actualízase cando fago push.
