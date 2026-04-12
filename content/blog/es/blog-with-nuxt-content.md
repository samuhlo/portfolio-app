---
title: Cómo creé mi blog con Nuxt Content
description: Descubrí Nuxt Content haciendo el blog y me sorprendió lo personalizable que es. Aquí explico cómo funciona, qué componentes creé y por qué decidí usarlo.
date: '2026-03-19'
category: breakdown
topics: ['nuxt', 'nuxt content', 'vue', 'markdown', 'componentes']
time_to_read: 8
published: true
lang: es
translationKey: blog-with-nuxt-content
slug: como-cree-mi-blog-con-nuxt-content
---

## No sabía que existía

Cuando me senté a montar el blog, tenía el plan clarísimo: Notion como CMS, un webhook al publicar, una IA que procesara el contenido y guardarlo en base de datos. El mismo flujo que ya usaba para proyectos del portfolio. Conocido, probado y listo para copiar y pegar.

Entonces me crucé con :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Nuxt Content].

Media hora de investigación después, el plan original estaba en un cajón. Nuxt tiene un sistema de contenido integrado que lee archivos markdown, los parsea, los valida con esquemas, renderiza componentes Vue dentro del texto y sirve todo desde el mismo servidor. Sin base de datos extra, sin webhooks, sin middleware por medio.

No fue amor a primera vista. Fue más bien pensar: "espera, esto me resuelve exactamente lo que necesitaba". Para un blog personal donde el objetivo es guardar lo que aprendo y compartirlo, tiene mucho más sentido que montar una infraestructura entera de sincronización.

Lo que me terminó de convencer fue la parte de los componentes. No es solo escribir markdown y que lo renderice. Puedes usar Vue directamente en el artículo, con toda la lógica que quieras: lazy loading, sliders, demos en vivo, lo que se te ocurra.

Ahí decidí: esto es lo que quiero.

---

## Qué es Nuxt Content

CMS basado en archivos. Escribes un `.md` en una carpeta y Nuxt lo convierte en página web. La estructura básica es un archivo con frontmatter y contenido:

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

Ese archivo vive en `content/blog/` y Nuxt Content automáticamente lo convierte en `/blog/mi-articulo`. Sin configurar rutas, sin crear páginas adicionales. Solo el archivo.

Lo interesante viene con el schema. Defines qué campos esperas en el frontmatter y qué tipos tienen. Si falta el título o pones una categoría que no existe, el sistema lo rechaza en build time. Es como tener TypeScript para tus artículos, básicamente.

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

Con esto tienes autocompletado en el editor, typecheck en build y cero campos `undefined` apareciendo donde no toca.

Y después está el rendering. Nuxt Content incluye `<ContentRenderer>` que parsea el markdown a HTML, pero también permite componentes Vue directamente en el texto. Ahí está el poder real.

---

## La parte interesante: componentes dentro del markdown

Puedes usar componentes Vue como si fueran tags HTML nativos. La sintaxis es bastante simple: `::nombre-componente{prop="valor"}` para bloques y `:nombre-componente{prop="valor"}[contenido]` para elementos inline.

Por ejemplo, un post puede tener esto:

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

Eso renderiza una imagen optimizada con caption, y un doodle SVG animado debajo de la palabra.

No es magia. Es Vue. Cada componente es un `.vue` normal con sus props, su lifecycle y lo que quieras. La única diferencia es que lo invocas desde el markdown en lugar de desde otro componente. Carrusel de imágenes, demo de código en vivo, lo que te dé la gana. Todo Vue, todo dentro del artículo.

---

## Los componentes que creé

Para el blog hice varios componentes que uso en los artículos. No están pensados para ser genéricos. Están pensados para cómo escribo yo. Cada uno hace exactamente lo que necesito, sin más.

### BlogMedia (imágenes y vídeos)

Es el más básico, pero también el que más uso. Renderiza imágenes con Nuxt Image o vídeos si el archivo termina en `.mp4` o `.webm`. Soporta caption, alineación y ancho máximo.

Pero hay algo más debajo: las imágenes no están en el repo ni en el servidor. Están en un bucket de Cloudflare R2 con dominio personalizado (`assets.samuhlo.dev`).

El motivo es simple: no quiero binarios en git. Un par de imágenes no pasa nada, pero si el blog crece, el repo se convierte en un problema. Con R2, el contenido estático vive separado del código, el repo se mantiene limpio, y los assets se sirven desde la CDN de Cloudflare.

Para subir archivos hay un script (`scripts/upload-r2.ts`) que recibe el archivo, lo sube al bucket usando el AWS SDK (la API de R2 es compatible con S3), y devuelve la URL pública. Las credenciales van en variables de entorno, el script hace el trabajo.

Lo más limpio del setup, para mí, es el alias en `nuxt.config.ts`:

```typescript
image: {
  domains: ['assets.samuhlo.dev'],
  alias: {
    blog: 'https://assets.samuhlo.dev/blog'
  }
}
```

Con esto puedo escribir `src: blog/mi-post/imagen.webp` en lugar de la URL completa. Nuxt Image resuelve el alias automáticamente, optimiza la imagen, y la sirve en el formato correcto según el navegador.

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

El componente detecta si es vídeo o imagen y usa el tag correspondiente. Nada complejo, pero hace que todo el contenido visual del blog tenga consistencia sin tener que pensarlo cada vez.

::blog-media
---
maxWidth: 760px
src: blog/blog-with-nuxt-content/jetpack_example_1.webp
alt: Ejemplo de imagen renderizada con BlogMedia
---
::

### CodePreview (demos en vivo)

Este me gusta especialmente. Recibe HTML, CSS y JS como props YAML, y renderiza un iframe con el resultado. El lector puede ver el demo funcionando o cambiar a las pestañas de código para ver cómo está hecho.

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

Detecta si en el JS hay referencias a librerías externas (GSAP, Matter.js, ScrollTrigger, Draggable) y las inyecta desde CDN automáticamente. Sin configuración adicional. También tiene highlighting con Shiki (el mismo que usa Nuxt Content para código inline), así todo mantiene el mismo estilo visual. Y como todo, lo personalicé con la estética del blog.

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

Un slider con estética de "asset viewer". No es un carousel genérico: está diseñado para mostrar múltiples screenshots o recursos visuales de un proyecto. Cada imagen puede tener un label, y se navega con click, swipe o teclado.

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

Tiene transiciones animadas con GSAP, un cursor label que sigue al ratón, y funciona bien tanto en desktop como en touch.

::image-slider
---
maxWidth: 760px
height: 620
images:
  - src: blog/blog-with-nuxt-content/jetpack_example_1.webp
    alt: Ejemplo de ImageSlider (vista 1)
  - src: blog/blog-with-nuxt-content/jetpack_example_2.webp
    alt: Ejemplo de ImageSlider (vista 2)
  - src: blog/blog-with-nuxt-content/jetpack_example_3.webp
    alt: Ejemplo de ImageSlider (vista 3)
---
::

> Por cierto, estos dibujos están hechos por [Jetpacks & Rollerskates](https://www.instagram.com/jetpacksandrollerskates/) 

### HandDrawn (doodles animados)

El más personal. Envuelve texto con un SVG que se anima como si se estuviera dibujando a mano. El SVG se posiciona relativo al contenido (debajo, encima, alrededor, a los lados), y la animación se dispara en scroll, en load o en hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[dibujo]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]
```

Es la misma técnica de `stroke-dashoffset` que ya usaba en el portfolio. La diferencia es que ahora puedo usarla en cualquier artículo sin copiar código. Solo escribes el tag y listo.

---

## Componentes del prose

Además de los componentes "grandes", personalicé los que Nuxt Content usa por defecto para renderizar markdown estándar: ProseH2 y ProseH3 para headings con estilo propio, ProsePre para bloques de código con el color de categoría como acento, ProseBlockquote para citas, ProseA para distinguir links internos de externos, y ProseCodeInline para código inline.

Cada uno es un componente Vue que sobrescribe el default. No hace falta configuración especial: creas el archivo en la carpeta correcta y Nuxt lo usa automáticamente.

---

## El índice del artículo

En posts largos, un índice lateral que te diga dónde estás marca la diferencia entre leer cómodo o perderte a mitad del artículo. Quería uno que resaltara la sección activa mientras scrolleas, sin que el lector tenga que hacer nada.

El componente `BlogPostInfo` vive en el sidebar: muestra los H2 del artículo como lista de enlaces y va marcando cuál está en pantalla según avanzas. Sobre el papel era simple. En la práctica, me encontré tres problemas que no esperaba.

**El problema de los IDs**

Nuxt Content asigna IDs a los headings de forma asíncrona. El markdown se parsea, el HTML se monta, pero los atributos `id` de los `<h2>` aparecen un momento después, cuando el renderer de Nuxt Content ha terminado de procesar el AST. En una navegación SPA, si llegas a un artículo sin recargar la página, el DOM está ahí pero los IDs todavía no.

La solución es esperar con un rAF recursivo hasta que los headings tienen ID:

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

No es elegante, pero funciona. El rAF se ejecuta cada frame hasta que todos los headings tienen ID y, entonces, el componente construye el índice. En la práctica son 2-3 frames (el usuario ni se entera).

**El problema de Lenis y ScrollTrigger**

El blog usa Lenis para el smooth scroll. ScrollTrigger de GSAP lo uso para detectar qué sección está en pantalla y actualizar el heading activo en el TOC.

El problema es que Lenis y ScrollTrigger compiten por el scroll nativo. ScrollTrigger escucha el scroll del navegador, pero Lenis lo intercepta y lo emula con su propio sistema. El resultado: los `scrub` y los `pin` de ScrollTrigger pierden la sincronización porque están calculando offsets sobre un scroll que Lenis ya ha modificado.

La solución es decirle a ScrollTrigger que use Lenis como fuente de scroll en lugar del nativo:

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

Con esto, ScrollTrigger calcula sus posiciones usando las métricas de Lenis en lugar del scroll nativo. Los offsets cuadran y el heading activo se actualiza en el momento correcto.

**El problema de los offsets**

Incluso con lo anterior, los offsets de los headings fallaban en la primera carga. El motivo: Lenis necesita un tick completo para calcular sus propias métricas de altura y posición. Si ScrollTrigger intenta leer las posiciones antes de que Lenis haya terminado, los números están mal.

La solución es forzar un refresh de ScrollTrigger después de que Lenis esté listo:

```typescript
lenis.on('scroll', () => {
  ScrollTrigger.update();
});

nextTick(() => {
  ScrollTrigger.refresh();
});
```

El `nextTick` garantiza que Vue ha terminado su ciclo de renderizado, y el `refresh()` recalcula todas las posiciones desde cero con las métricas correctas de Lenis.

Tres problemas distintos, todos relacionados con timing (qué está listo antes que qué). Ese tipo de cosa no suele venir en la documentación de cada librería por separado. Lo descubres cuando las juntas.

---

## La infraestructura del blog

Todo esto vive en pocos archivos. El schema en `content.config.ts`, los artículos en `content/blog/`, los componentes en `app/components/content/` y la página que renderiza es Vue normal con `<ContentRenderer>`. No hay capas ocultas. No hay servicios externos que puedan caerse. Todo Vue, todo TypeScript, todo en el mismo repo.

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

Dos queries y ya está. Nada de APIs externas, nada de estados de carga rebuscados. El contenido está ahí, como cualquier otro dato de la app.

Lo que más valoro es que no dependo de ninguna plataforma. Si mañana quiero cambiar algo, lo cambio. Si Notion cierra o cambia precios, me da igual: mis artículos son archivos markdown versionados en git. Eso tiene un valor que subestimé hasta que lo tuve.

---

## El resultado

El sistema permite escribir artículos que combinan redacción lineal con demos interactivos, vídeo, imágenes optimizadas y animaciones, todo desde el mismo archivo markdown y sin salir del editor. Cuando lo necesitas, metes un componente. Cuando no, escribes texto normal.

Si quieres verlo funcionando en un artículo más completo, el de [animated-portfolio](/blog/animated-portfolio) es un buen ejemplo: tiene CodePreview con GSAP y Matter.js corriendo en vivo, ImageSlider con capturas del proceso y videos, y HandDrawn integrado en el texto.

Lo que más valoro es que el sistema es mío. No dependo de una plataforma de terceros, no hay límites arbitrarios sobre lo que puedo hacer y, si mañana quiero cambiar algo, lo cambio. El contenido vive en archivos versionados en el mismo repo. Ese control vale más de lo que parece.

Lo que sí requiere es asumir un overhead inicial (configurar el schema, crear componentes, entender la carpeta de prose). No es una barbaridad de trabajo, pero tampoco es cero.

---

## Para el futuro

El plan original con Notion no desapareció: está en pausa.

La idea era poder escribir en Notion (donde estoy más cómodo para borradores largos), pasar el contenido por un prompt que lo formatee según mis componentes, revisar el resultado y hacer push. Todo automatizado con n8n, sin fricción manual. Sigue siendo algo que me apetece montar.

De hecho, ya tengo parte de eso funcionando: un agente de Claude Code configurado específicamente para este blog. Le paso mis ideas en sucio, sin estructura, con faltas de ortografía y notas mezcladas, e indico qué componentes quiero y dónde. El agente devuelve el artículo formateado (frontmatter correcto, componentes MDC colocados, headings con la jerarquía adecuada, ortografía resuelta). Yo reviso, ajusto lo que no me convence y hago push. El trabajo pesado de formatear lo hace él. El criterio sobre qué va y cómo se cuenta sigue siendo mío.

Cuando monte el flujo con n8n, ese prompt del agente es probablemente el punto de partida.

Pero la base va a seguir siendo Nuxt Content. El día que quiera migrar a una base de datos convencional, no hay drama: el frontmatter pasa a ser campos de una tabla, el cuerpo del markdown pasa a ser el contenido principal y los artículos siguen siendo artículos. La estructura ya está pensada para eso.

Por ahora funciona exactamente como quería: escribo, uso los componentes cuando los necesito, y el blog se actualiza cuando hago push.
