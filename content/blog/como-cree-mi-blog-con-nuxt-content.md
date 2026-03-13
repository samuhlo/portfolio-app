---
title: Cómo creé mi blog con Nuxt Content 
description: Descubrí Nuxt Content haciendo el blog y me surpriseó lo personalizable que es. Acá explico cómo funciona, qué componentes creé, y por qué decidí usarlo.
date: '2026-03-13'
category: breakdown
topics: ['nuxt', 'nuxt content', 'vue', 'markdown', 'componentes']
time_to_read: 8
published: false
slug: como-cree-mi-blog-con-nuxt-content
---

## No sabía que existía

Cuando me senté a hacer el blog, tenía en mente algo straightforward: Notion como CMS, una webhook que disparara cuando escribiera algo, una IA que procesara el contenido, y que se guardara en la base de datos. Era el flujo que ya usaba para los proyectos del portfolio y funcionaba bien.

El problema es que no conocía Nuxt Content.

Investigar un poco me cambió el plan. Descubrí que Nuxt tiene un sistema de contenido integrado que lee archivos markdown, los parsea, permite validarlos con esquemas, renderizar componentes Vue dentro del markdown, y sirve todo desde el mismo servidor. Sin base de datos extra, sin webhooks, sin middlewares de por medio.

Me pareció interesante. No era "la solución definitiva a todos mis problemas" ni nada dramático — simplemente encajaba mejor con lo que necesitaba para un blog personal.

Lo que me sorprendió fue lo personalizable que es. No es solo "escribes markdown y lo renderiza". Podés crear componentes Vue que se usan directamente dentro del artículo, como si fuera HTML pero con toda la potencia de Vue. Imágenes con lazy loading, sliders de fotos, demos de código en vivo, lo que quieras.

Ahí fue donde decidí: esto es lo que quiero para el blog.

---

## Qué es Nuxt Content (en simples palabras)

Básicamente, Nuxt Content es un sistema de archivos como CMS. Vos escribís un archivo `.md` en una carpeta, y Nuxt lo transforma en una página web.

La estructura es así:

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

Ese archivo vive en `content/blog/`, y Nuxt Content automáticamente lo convierte en una ruta `/blog/mi-articulo`. No necesitás configurar rutas, ni crear páginas, ni nada. Él solo lo hace.

Lo interesante viene cuando agregás el schema. Con Nuxt Content podés definir qué campos esperás en el frontmatter y qué tipos tienen. Si alguien intenta subir un artículo sin título o con una categoría que no existe, el sistema lo rechaza. Es como tener un typescript para tus artículos.

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
        category: z.enum(['weekly_log', 'find', 'breakdown', 'outside']),
        topics: z.array(z.string()),
        time_to_read: z.number(),
        published: z.boolean(),
        slug: z.string(),
      }),
    }),
  },
});
```

Con esto, cada vez que cargás un artículo, sabés exactamente qué campos tiene y qué tipos tienen. El autocompletado en el editor, el tiposcheck en build time, nada de campos undefined cuando menos lo esperás.

Y después está el rendering. Nuxt Content viene con `<ContentRenderer>` que parsea el markdown y lo convierte en HTML. Pero también permite usar componentes Vue directamente dentro del markdown. Eso es lo que le da el poder real.

---

## La parte interesante: componentes dentro del markdown

Ahí es donde todo cambió. En lugar de limitarme a escribir texto plano, puedo usar componentes Vue como si fueran tags HTML.

La sintaxis es simple: `::nombre-componente{prop="valor"}` para bloques, y `:nombre-componente{prop="valor"}[contenido]` para elementos inline.

Por ejemplo, un post puede tener esto:

```markdown
## ::blog-media

src: blog/mi-post/portada.jpg
alt: Mi proyecto
caption: Así se veía al final

---

::

Aquí va un texto normal y luego algo inline: :hand-drawn{svg="/blog/doodles/underline.svg"}[dibujo a mano]
```

Y eso renderiza una imagen optimizada con caption, y un doodle SVG animado debajo de la palabra.

No es magia negra. Es Vue. Cada componente es un `.vue` normal con sus props, su lifecycle, lo que quieras. La diferencia es que se usa desde el markdown.

Esto abre un mundo de posibilidades. No estás limitado a lo que el markdown estándar permite. Querés un carrusel de imágenes? Lo hacés como componente Vue y lo usás en el artículo. Querés un demo de código en vivo que el usuario pueda ejecutar? Componente Vue. Lo que sea.

---

## Los componentes que creé

Para el blog hice varios componentes que se usan en los artículos. No son globales ni genéricos — están pensados para cómo yo escribo. Eso es lo lindo de esto: cada uno hace exactamente lo que necesita.

### BlogMedia — imágenes y vídeos

El más básico pero fundamental. Renderiza imágenes con Nuxt Image (lazy loading, múltiples formatos, optimizado) o vídeos si el archivo termina en `.mp4` o `.webm`. Soporta caption, alineación y ancho máximo.

```
::blog-media
---
src: blog/mi-post/demo.mp4
caption: Así funciona
maxWidth: 60%
align: center
---
::
```

El componente detecta si es vídeo o imagen, usa el tag correspondiente, y aplica las clases necesarias. Nada complejo, pero hace que escribir artículos con medios sea consistente y rápido.

### CodePreview — demos en vivo

Este me gusta mucho. Es un componente que recibe HTML, CSS y JS como props YAML, y renderiza un iframe con el resultado. El usuario puede ver el preview funcionando, o alternar a las pestañas de código para ver cómo está implementado.

```
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

auto-detecta si en el JS hay referencias a librerías externas (GSAP, Matter.js, ScrollTrigger, Draggable) y las inyecta desde CDN. Así el demo funciona sin configuración adicional.

También tiene highlighting de código via Shiki, que es lo mismo que usa Nuxt Content para el código inline. Todo queda con el mismo estilo visual.

### ImageSlider — carrusel técnico

Un slider de imágenes con estética de "asset viewer". En lugar de un carousel genérico, está diseñado para mostrar múltiples screenshots o recursos visuales de un proyecto. Cada imagen tiene un label (tipo文件名) y se navega con click, swipe, o teclado.

```
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

Tiene transiciones animadas con GSAP, cursor label que sigue al ratón, y funciona bien tanto en desktop como en touch.

### HandDrawn — doodles animados

Este es el más personal. Envuelve texto con un SVG que se anima como si se estuviera dibujando a mano. El SVG se posiciona relative al contenido (debajo, encima, alrededor, a los lados), y la animación se dispara en scroll, en load, o en hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[dibujo]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]
```

Usa el mismo técnica de stroke-dashoffset que ya usaba en el portfolio. La diferencia es que ahora puedo usarlo en cualquier artículo sin copiar código. Solo agregás el tag y listo.

### DrawHeading — headings con doodle

Igual que HandDrawn pero para headings de nivel bloque. Evita el problema de HTML inválido (un `<h2>` dentro de un `<p>`) y permite agregar decoraciones animadas a los títulos del artículo.

```
::draw-heading{svg="/blog/doodles/circle.svg" level="2"}
El título con doodle
::
```

---

## Componentes del prose

Además de los componentes "grandes", también personalicé los que Nuxt Content usa por defecto para renderizar markdown.

- **ProseH2 / ProseH3** — los headings tienen un estilo propio que va con la estética del blog
- **ProsePre** — los bloques de código tienen un diseño minimalista con el color de categoría del post como acento
- **ProseBlockquote** — las citas tienen un estilo distintivo
- **ProseA** — los links internos se ven diferentes a los externos
- **ProseCodeInline** — el código inline tiene su propio estilo

Cada uno es un componente Vue normal que overridea el default de Nuxt Content. No hace falta configuración rara, solo crear el componente en la carpeta correcta y Nuxt lo usa automáticamente.

---

## La infraestructura del blog

Todo esto vive en un par de archivos. El schema se define en `content.config.ts`, los artículos en `content/blog/`, los componentes en `app/components/content/`, y la página que renderiza todo es una Vue page normal que usa `<ContentRenderer>`.

No hay magia. Todo es Vue, todo es TypeScript, todo está en el proyecto.

Para obtener un artículo:

```typescript
const post = await queryCollection('blog').path('/blog/mi-slug').first();
```

Para el listado:

```typescript
const posts = await queryCollection('blog')
  .order('date', 'DESC')
  .where('published', '=', true)
  .all();
```

Dos queries y tenés todo. Nada de APIs, nada de fetching desde externo, nada de estados de carga complicados. El contenido está ahí, disponible como cualquier otra dato en tu app.

---

## El resultado

Todo esto se traduce en artículos como el de animated-portfolio, donde combino todo: demos de código en vivo con GSAP y Matter.js, imágenes y vídeos optimizados, carruseles, y los doodles animados integrados directamente en el texto.

Escribís el artículo en markdown, usás los componentes cuando los necesitás, y el resto es texto normal. El DX es rápido, no hay overhead de configuración, y el resultado es exactamente lo que diseñaste.

Lo que más me gusta es que el sistema es mío. No dependo de una plataforma, no hay límites de lo que puedo hacer, y si mañana quiero cambiar algo, lo cambio. El contenido vive en archivos que puedo versionar, migrar, o hacer lo que se me ocurra con ellos.

---

## Para el futuro

Tengo pensado automatizar el flujo con Notion. El plan es escribir en Notion (que es donde me resulta más cómodo), pasar el contenido por un prompt que lo formatee para mis componentes, revisar, y hacer deploy. Todo con n8n, sin intervención manual.

Pero la base va a seguir siendo Nuxt Content. El día que quiera cambiar de idea, tengo los artículos en markdown, los componentes son Vue, y la base de datos es un folder en el repo. Lo que me llevó una hora configurar, me lleva una hora deshacer.

Por ahora, esto funciona exactamente como quería: escribo, uso los componentes cuando los necesito, y el blog se actualiza solo cuando hago push.
