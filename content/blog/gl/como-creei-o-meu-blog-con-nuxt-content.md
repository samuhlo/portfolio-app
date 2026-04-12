---
title: Como creei o meu blog con Nuxt Content
description: Descubrín Nuxt Content facendo o blog e sorprendeume o personalizable que é. Aquí explico como funciona, que compoñentes creei e por que decidín usalo.
date: '2026-03-19'
category: breakdown
topics: ['nuxt', 'nuxt content', 'vue', 'markdown', 'componentes']
time_to_read: 8
published: true
lang: gl
translationKey: blog-with-nuxt-content
slug: como-creei-o-meu-blog-con-nuxt-content
---

## Non sabía que existía

Cando me sentei a montar o blog, tiña o plan clarísimo: Notion como CMS, un webhook ao publicar, unha IA que procesase o contido e gardalo nunha base de datos. O mesmo fluxo que xa usaba para proxectos do portfolio. Coñecido, probado e listo para copiar e pegar.

Entón cruceime con :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Nuxt Content].

Media hora de investigación despois, o plan orixinal estaba nun caixón. Nuxt ten un sistema de contido integrado que le ficheiros markdown, pársaos, valídaos con esquemas, renderiza compoñentes Vue dentro do texto e serve todo dende o mesmo servidor. Sen base de datos extra, sen webhooks, sen middleware polo medio.

Non foi amor á primeira vista. Foi máis ben pensar: "espera, isto resólveme exactamente o que necesitaba". Para un blog persoal onde o obxectivo é gardar o que aprendo e compartilo, ten moito máis sentido ca montar unha infraestrutura enteira de sincronización.

O que me acabou de convencer foi a parte dos compoñentes. Non é só escribir markdown e que o renderice. Podes usar Vue directamente no artigo, con toda a lóxica que queiras: lazy loading, sliders, demos en vivo, o que se che ocorra.

Aí decidín: isto é o que quero.

---

## Que é Nuxt Content

É basicamente un CMS baseado en ficheiros. Escribes un `.md` nun cartafol e Nuxt convérteo en páxina web. A estrutura básica é un ficheiro con frontmatter e contido:

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

Ese ficheiro vive en `content/blog/` e Nuxt Content convérteo automaticamente en `/blog/mi-articulo`. Sen configurar rutas, sen crear páxinas extra. Só o ficheiro.

O interesante empeza co schema. Defines que campos esperas no frontmatter e que tipos deben ter. Se falta o título ou pos unha categoría que non existe, o sistema rebótao en build time. É basicamente como ter TypeScript para os artigos.

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

Con iso tes autocompletado no editor, typecheck en build e cero campos `undefined` aparecendo onde non toca.

E despois está o rendering. Nuxt Content inclúe `<ContentRenderer>`, que parsea o markdown a HTML, pero tamén permite compoñentes Vue directamente dentro do texto. Aí está o poder de verdade.

---

## A parte interesante: compoñentes dentro do markdown

Podes usar compoñentes Vue case como se fosen tags HTML nativas. A sintaxe é bastante simple: `::nombre-componente{prop="valor"}` para bloques e `:nombre-componente{prop="valor"}[contenido]` para elementos inline.

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

Non é maxia. É Vue. Cada compoñente é un `.vue` normal coas súas props, o seu lifecycle e o que queiras. A única diferenza é que o invocas dende o markdown en vez de dende outro compoñente. Carrusel de imaxes, demo de código en vivo, o que che dea a gana. Todo Vue, todo dentro do artigo.

---

## Os compoñentes que creei

Para o blog fixen varios compoñentes que uso nos artigos. Non están pensados para ser xenéricos. Están pensados para como escribo eu. Cada un fai exactamente o que necesito, sen máis.

### BlogMedia (imaxes e vídeos)

É o máis básico, pero tamén o que máis uso. Renderiza imaxes con Nuxt Image ou vídeos se o ficheiro remata en `.mp4` ou `.webm`. Soporta caption, aliñamento e ancho máximo.

Pero hai algo máis por debaixo: as imaxes non están no repo nin no servidor. Viven nun bucket de Cloudflare R2 cun dominio personalizado (`assets.samuhlo.dev`).

O motivo é simple: non quero binarios en git. Un par de imaxes non pasa nada, pero se o blog medra, o repo convértese nun problema. Con R2, o contido estático vive separado do código, o repo mantense limpo e os assets sérvense dende a CDN de Cloudflare.

Para subir ficheiros hai un script (`scripts/upload-r2.ts`) que colle un ficheiro, súbeo ao bucket usando o AWS SDK (a API de R2 é compatible con S3) e devolve a URL pública. As credenciais van en variables de contorno, e o script fai o resto.

A parte máis limpa do setup, para min, é o alias en `nuxt.config.ts`:

```typescript
image: {
  domains: ['assets.samuhlo.dev'],
  alias: {
    blog: 'https://assets.samuhlo.dev/blog'
  }
}
```

Con iso podo escribir `src: blog/mi-post/imagen.webp` no canto da URL completa. Nuxt Image resolve o alias automaticamente, optimiza a imaxe e sérvea no formato correcto segundo o navegador.

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

O compoñente detecta se é vídeo ou imaxe e usa o tag correcto. Nada complexo, pero fai que todo o contido visual do blog teña consistencia sen ter que pensalo cada vez.

::blog-media
---
maxWidth: 760px
src: blog/blog-with-nuxt-content/jetpack_example_1.webp
alt: Exemplo de imaxe renderizada con BlogMedia
---
::

### CodePreview (demos en vivo)

Gústame especialmente este. Recibe HTML, CSS e JS como props YAML e renderiza un iframe co resultado. A persoa que le pode ver o demo funcionando ou cambiar ás pestanas de código para ver como está feito.

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

Detecta se no JS hai referencias a librarías externas (GSAP, Matter.js, ScrollTrigger, Draggable) e inxéctaas dende CDN automaticamente. Sen configuración adicional. Tamén usa highlighting con Shiki (o mesmo que usa Nuxt Content para código inline), así todo mantén o mesmo estilo visual. E como todo o demais, personaliceino coa estética do blog.

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

### ImageSlider (carrusel técnico)

É un slider con estética de "asset viewer". Non é un carousel xenérico. Está deseñado para mostrar múltiples screenshots ou recursos visuais dun proxecto. Cada imaxe pode ter un label, e navegas por el con click, swipe ou teclado.

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

Ten transicións animadas con GSAP, un cursor label que segue o rato, e funciona ben tanto en desktop como en touch.

::image-slider
---
maxWidth: 760px
height: 620
images:
  - src: blog/blog-with-nuxt-content/jetpack_example_1.webp
    alt: Exemplo de ImageSlider (vista 1)
  - src: blog/blog-with-nuxt-content/jetpack_example_2.webp
    alt: Exemplo de ImageSlider (vista 2)
  - src: blog/blog-with-nuxt-content/jetpack_example_3.webp
    alt: Exemplo de ImageSlider (vista 3)
---
::

> Por certo, estes debuxos están feitos por [Jetpacks & Rollerskates](https://www.instagram.com/jetpacksandrollerskates/)

### HandDrawn (doodles animados)

Este é o máis persoal. Envolve texto cun SVG que se anima como se se estivese debuxando a man. O SVG colócase relativo ao contido (debaixo, enriba, arredor, nos lados), e a animación dispárase con scroll, en load ou en hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[dibujo]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]
```

É a mesma técnica de `stroke-dashoffset` que xa usaba no portfolio. A diferenza é que agora podo usala en calquera artigo sen copiar código. Escribes o tag e listo.

---

## Compoñentes do prose

Ademais dos compoñentes grandes, tamén personalicei os que Nuxt Content usa por defecto para renderizar markdown normal: ProseH2 e ProseH3 para headings con estilo, ProsePre para bloques de código coa cor da categoría como acento, ProseBlockquote para citas, ProseA para distinguir links internos e externos, e ProseCodeInline para código inline.

Cada un é un compoñente Vue que sobrescribe o default. Sen configuración especial: creas o ficheiro no cartafol correcto e Nuxt cólleo automaticamente.

---

## O índice do artigo

Nos posts longos, ter un índice lateral que che diga onde estás marca a diferenza entre ler cómodo e perderte a metade do artigo. Eu quería un que resaltase a sección activa mentres fas scroll, sen que a persoa lectora tivese que facer nada.

O compoñente `BlogPostInfo` vive no sidebar: mostra os H2 do artigo como lista de ligazóns e vai marcando cal está en pantalla segundo avanzas. Sobre o papel era simple. Na práctica, atopeime con tres problemas que non esperaba.

**O problema dos IDs**

Nuxt Content asigna IDs aos headings de maneira asíncrona. O markdown parsease, o HTML móntase, pero os atributos `id` dos `<h2>` aparecen un momento despois, cando o renderer de Nuxt Content rematou de procesar o AST. Nunha navegación SPA, se chegas a un artigo sen recargar a páxina, o DOM xa está aí pero os IDs aínda non.

A solución é esperar cun rAF recursivo ata que os headings teñan ID:

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

Non é elegante, pero funciona. O rAF execútase cada frame ata que todos os headings teñen ID e, entón, o compoñente constrúe o índice. Na práctica son 2 ou 3 frames (a persoa usuaria nin se decata).

**O problema de Lenis e ScrollTrigger**

O blog usa Lenis para smooth scroll. Eu uso ScrollTrigger de GSAP para detectar que sección está en pantalla e actualizar o heading activo no TOC.

O problema é que Lenis e ScrollTrigger compiten polo scroll nativo. ScrollTrigger escoita o scroll do navegador, pero Lenis interceptao e emúlao co seu propio sistema. O resultado é que os `scrub` e os `pin` de ScrollTrigger perden sincronía, porque están calculando offsets sobre un scroll que Lenis xa modificou.

A solución é dicirlle a ScrollTrigger que use Lenis como fonte de scroll no canto da nativa:

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

Con iso, ScrollTrigger calcula as posicións usando as métricas de Lenis en vez do scroll nativo. Os offsets cadran e o heading activo actualízase no momento correcto.

**O problema dos offsets**

Mesmo con iso anterior, os offsets dos headings fallaban na primeira carga. O motivo é que Lenis necesita un tick completo para calcular as súas propias métricas de altura e posición. Se ScrollTrigger intenta ler as posicións antes de que Lenis remate, os números están mal.

A solución é forzar un refresh de ScrollTrigger despois de que Lenis estea listo:

```typescript
lenis.on('scroll', () => {
  ScrollTrigger.update();
});

nextTick(() => {
  ScrollTrigger.refresh();
});
```

`nextTick` asegura que Vue rematou o ciclo de renderizado, e `refresh()` recalcula todas as posicións dende cero coas métricas correctas de Lenis.

Tres problemas distintos, todos ligados ao timing (que está listo antes que que). Ese tipo de cousa non adoita aparecer na documentación de cada libraría por separado. Descóbrelo cando as xuntas.

---

## A infraestrutura do blog

Todo isto vive en poucos ficheiros. O schema en `content.config.ts`, os artigos en `content/blog/`, os compoñentes en `app/components/content/` e a páxina que renderiza todo é Vue normal con `<ContentRenderer>`. Non hai capas ocultas. Non hai servizos externos que poidan caer. Todo Vue, todo TypeScript, todo no mesmo repo.

Para obter un artigo:

```typescript
const post = await queryCollection('blog').path('/blog/mi-slug').first();
```

Para o listado:

```typescript
const posts = await queryCollection('blog')
  .order('date', 'DESC')
  .where('published', '=', true)
  .all();
```

Dúas queries e listo. Nada de APIs externas, nada de estados de carga enrevesados. O contido está aí, como calquera outro dato da app.

O que máis valoro é que non dependo de ningunha plataforma. Se mañá quero cambiar algo, cámbioo. Se Notion pecha ou cambia prezos, dáme igual: os meus artigos son ficheiros markdown versionados en git. Iso ten máis valor do que eu mesmo pensaba ata que o tiven.

---

## O resultado

O sistema permíteme escribir artigos que combinan redacción lineal con demos interactivos, vídeo, imaxes optimizadas e animacións, todo dende o mesmo ficheiro markdown e sen saír do editor. Cando o necesito, meto un compoñente. Cando non, escribo texto normal.

Se queres velo funcionando nun artigo máis completo, o de [animated-portfolio](/blog/animated-portfolio) é un bo exemplo: ten CodePreview con GSAP e Matter.js correndo en vivo, ImageSlider con capturas do proceso e vídeos, e HandDrawn integrado no texto.

O que máis valoro é que o sistema é meu. Non dependo dunha plataforma de terceiros, non hai límites arbitrarios sobre o que podo facer e, se mañá quero cambiar algo, cámbioo. O contido vive en ficheiros versionados dentro do mesmo repo. Ese nivel de control vale máis do que parece.

Si que require asumir un overhead inicial (configurar o schema, crear os compoñentes, entender o cartafol de prose). Non é unha barbaridade de traballo, pero tampouco é cero.

---

## Para o futuro

O plan orixinal con Notion non desapareceu. Está só en pausa.

A idea era poder escribir en Notion (onde estou máis cómodo para borradores longos), pasar o contido por un prompt que o formatee segundo os meus compoñentes, revisar o resultado e facer push. Todo automatizado con n8n, sen fricción manual. Segue sendo algo que me apetece montar.

De feito, xa teño parte diso funcionando: un axente de Claude Code configurado especificamente para este blog. Pásolle as miñas ideas en sucio, sen estrutura, con faltas de ortografía, notas mesturadas, e indícolle que compoñentes quero e onde. O axente devolve o artigo formateado (frontmatter correcto, compoñentes MDC colocados, headings coa xerarquía adecuada, ortografía resolta). Eu reviso, axusto o que non me convence e fago push. O traballo pesado de formatear faino el. O criterio sobre que vai e como se conta segue sendo meu.

Cando monte o fluxo con n8n, ese prompt do axente será probablemente o punto de partida.

Pero a base vai seguir sendo Nuxt Content. O día que queira migrar a unha base de datos convencional, non hai drama: o frontmatter pasa a ser campos dunha táboa, o corpo do markdown pasa a ser o contido principal e os artigos seguen sendo artigos. A estrutura xa está pensada para iso.

Por agora funciona exactamente como quería: escribo, uso os compoñentes cando os necesito e o blog actualízase cando fago push.
