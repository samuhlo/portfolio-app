---
title: Cómo creé mi blog con Nuxt Content
description: Descubrí Nuxt Content haciendo el blog y me sorprendio lo personalizable que es. Aquí explico cómo funciona, qué componentes creé, y por qué decidí usarlo.
date: '2026-03-13'
category: breakdown
topics: ['nuxt', 'nuxt content', 'vue', 'markdown', 'componentes']
time_to_read: 8
published: true
slug: blog-with-nuxt-content
---

## No sabía que existía

Cuando me senté a hacer el blog, tenía en mente algo straightforward: Notion como CMS, una webhook que disparara cuando publicara algo, una IA que procesara el contenido, y que se guardara en la base de datos. El mismo flujo que ya usaba para los proyectos del portfolio. Conocido, probado, listo para copiar y pegar.

Entonces me crucé con :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[Nuxt Content].

Media hora de investigación después, el plan original estaba en el cajón. Nuxt tiene un sistema de contenido integrado que lee archivos markdown, los parsea, permite validarlos con esquemas, renderizar componentes Vue dentro del texto, y sirve todo desde el mismo servidor. Sin base de datos extra, sin webhooks, sin middleware de por medio.

No fue amor a primera vista — fue más bien "espera, esto resuelve exactamente lo que necesitaba". Para un blog personal donde el objetivo principal es almacenar lo que aprendo (y compartirlo con quien quiera verlo), tiene mucho más sentido que montar toda una infraestructura de sincronización.

Lo que sí me sorprendió fue la parte de los componentes. No es solo "escribes markdown y lo renderiza". Puedes usar componentes Vue directamente dentro del artículo, como si fueran tags HTML pero con toda la lógica de Vue detrás. Imágenes con lazy loading, sliders, demos de código en vivo, lo que se te ocurra.

Ahí decidí: esto es lo que quiero.

---

## Qué es Nuxt Content (en simples palabras)

Nuxt Content es un sistema de archivos usado como CMS. Escribís un archivo `.md` en una carpeta, y Nuxt lo transforma en una página web.

La estructura básica es esta:

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

Ese archivo vive en `content/blog/`, y Nuxt Content automáticamente lo convierte en una ruta `/blog/mi-articulo`. Sin configurar rutas, sin crear páginas adicionales. Solo el archivo.

Lo interesante viene con el schema. Podés definir qué campos esperás en el frontmatter y qué tipos tienen. Si un artículo no tiene título, o tiene una categoría que no existe, el sistema lo rechaza en build time. Es como tener :hand-drawn{svg="/blog/doodles/blog_medium_underline.svg"}[TypeScript] para tus artículos.

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

Con esto, cada vez que cargás un artículo sabés exactamente qué campos tiene y qué tipos tienen. Autocompletado en el editor, typecheck en build time, y cero campos `undefined` apareciendo donde no los esperás.

Y después está el rendering. Nuxt Content incluye `<ContentRenderer>` que parsea el markdown y lo convierte en HTML. Pero también permite usar componentes Vue directamente en el texto. Eso es lo que le da el poder real.

---

## La parte interesante: componentes dentro del markdown

En lugar de limitarme a texto plano, puedo usar componentes Vue como si fueran tags HTML nativos.

La sintaxis es simple: `::nombre-componente{prop="valor"}` para bloques, y `:nombre-componente{prop="valor"}[contenido]` para elementos inline.

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

No es magia. Es Vue. Cada componente es un `.vue` normal con sus props, su lifecycle, lo que quieras. La única diferencia es que lo invocás desde el markdown en lugar de desde otro componente.

Querés un carrusel de imágenes? Lo hacés como componente Vue y lo usás en el artículo. Un demo de código en vivo? Componente Vue. Lo que necesites. El límite lo ponés vos.

---

## Los componentes que creé

Para el blog hice varios componentes que se usan en los artículos. No están pensados para ser genéricos — están pensados para cómo yo escribo. Eso es lo que más me gusta de este sistema: cada componente hace exactamente lo que necesito, sin más.

### BlogMedia — imágenes y vídeos

El más básico pero el que más uso. Renderiza imágenes con Nuxt Image (lazy loading, múltiples formatos, optimizado) o vídeos si el archivo termina en `.mp4` o `.webm`. Soporta caption, alineación y ancho máximo.

Pero hay algo más debajo: las imágenes y vídeos no están en el repo ni en el servidor. Están en un bucket de Cloudflare R2 con dominio personalizado (`assets.samuhlo.dev`).

El motivo es simple: no quiero meter binarios en git. Un par de imágenes no pasa nada, pero si el blog crece, el repo se convierte en un problema. Con R2, el contenido estático vive separado del código, el repo se mantiene limpio, y los assets se sirven desde la CDN de Cloudflare.

Para subir archivos hay un script (`scripts/upload-r2.ts`) que recibe el archivo, lo sube al bucket usando el AWS SDK (la API de R2 es compatible con S3), y devuelve la URL pública. Las credenciales van en variables de entorno, el script hace el trabajo. Sencillo.
Lo más limpio del setup es el alias en `nuxt.config.ts`:

```typescript
image: {
  domains: ['assets.samuhlo.dev'],
  alias: {
    blog: 'https://assets.samuhlo.dev/blog'
  }
}
```

Con esto, en cualquier componente o en el markdown puedo escribir `src: blog/mi-post/imagen.webp` en lugar de la URL completa. Nuxt Image resuelve el alias automáticamente, optimiza la imagen, y la sirve en el formato correcto según el navegador.

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

### CodePreview — demos en vivo

Este me gusta especialmente. Recibe HTML, CSS y JS como props YAML, y renderiza un iframe con el resultado. El lector puede ver el demo funcionando, o cambiar a las pestañas de código para ver cómo está hecho.

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

Detecta si en el JS hay referencias a librerías externas (GSAP, Matter.js, ScrollTrigger, Draggable) y las inyecta desde CDN automáticamente. El demo funciona sin configuración adicional.

También tiene highlighting via Shiki — el mismo que usa Nuxt Content para el código inline, así todo queda con el mismo estilo visual.

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

Un slider con estética de "asset viewer". No es un carousel genérico — está diseñado para mostrar múltiples screenshots o recursos visuales de un proyecto. Cada imagen puede tener un label, y se navega con click, swipe o teclado.

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
    alt: Ejemplo de ImageSlider — vista 1
  - src: blog/blog-with-nuxt-content/jetpack_example_2.webp
    alt: Ejemplo de ImageSlider — vista 2
  - src: blog/blog-with-nuxt-content/jetpack_example_3.webp
    alt: Ejemplo de ImageSlider — vista 3
---
::

> Por cierto, estos dibujos estan hechos por [Jetpacks & Rollerskates](https://www.instagram.com/jetpacksandrollerskates/) 

### HandDrawn — doodles animados

El más personal. Envuelve texto con un SVG que se anima como si se estuviera dibujando a mano. El SVG se posiciona relativo al contenido (debajo, encima, alrededor, a los lados), y la animación se dispara en scroll, en load o en hover.

```
:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[dibujo]

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" trigger="hover"}[hover me]

```

Es la misma técnica de `stroke-dashoffset` que ya usaba en el portfolio. La diferencia es que ahora puedo usarla en cualquier artículo sin copiar código. Solo escribís el tag y :hand-drawn{svg="/blog/doodles/blog_asterisk.svg" placement="right" trigger="scroll" duration="2" width="90%"}[listo]

---

## Componentes del prose

Además de los componentes "grandes", personalicé los que Nuxt Content usa por defecto para renderizar el markdown estándar.

- **ProseH2 / ProseH3** — los headings tienen estilo propio que va con la estética del blog
- **ProsePre** — los bloques de código usan el color de categoría del post como acento
- **ProseBlockquote** — las citas tienen un estilo distintivo
- **ProseA** — los links internos se ven distintos a los externos
- **ProseCodeInline** — el código inline tiene su propio tratamiento visual

Cada uno es un componente Vue que overridea el default de Nuxt Content. No hace falta configuración especial — solo crear el componente en la carpeta correcta y Nuxt lo usa automáticamente.

---

## El índice del artículo

En posts largos, un índice lateral que te diga dónde estás es la diferencia entre leer cómodo y perderte a mitad del artículo. Quería uno que resaltara la sección activa mientras scrolleas, sin que el lector tenga que hacer nada.

El componente `BlogPostInfo` vive en el sidebar: muestra los H2 del artículo como lista de enlaces, y va marcando cuál está en pantalla según avanzas. Conceptualmente simple. En la práctica, tres problemas que no me esperaba.

**El problema de los IDs**

Nuxt Content asigna IDs a los headings de forma asíncrona. El markdown se parsea, el HTML se monta, pero los atributos `id` de los `<h2>` aparecen un momento después — cuando el renderer de Nuxt Content ha terminado de procesar el AST. En una navegación SPA, si llegas a un artículo sin recargar la página, el DOM está ahí pero los IDs todavía no.

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

No es elegante, pero funciona. El rAF se ejecuta cada frame hasta que todos los headings tienen ID, y entonces el componente construye el índice. En la práctica son 2-3 frames — el usuario no nota nada.

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

Tres problemas distintos, todos relacionados con el timing — con qué está listo antes que qué. Ese es el tipo de cosa que no aparece en la documentación de ninguna de las librerías por separado. Lo encuentras cuando las juntas.

---

## La infraestructura del blog

Todo esto vive en pocos archivos. Y eso me parece uno de los puntos más importantes del sistema.

El schema en `content.config.ts`, los artículos en `content/blog/`, los componentes en `app/components/content/`, y la página que lo renderiza todo es una página de Vue normal con `<ContentRenderer>`. No hay capas ocultas. No hay servicios externos que puedan caerse. Todo es Vue, todo es TypeScript, todo está en el mismo repo.

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

Dos queries y tienes todo. Nada de APIs externas, nada de estados de carga complicados. El contenido está ahí, disponible como cualquier otro dato en la app.

Lo que más valoro es que no dependo de ninguna plataforma. Si mañana quiero cambiar algo, lo cambio. Si Notion cierra o cambia sus precios, me da igual — mis artículos son archivos markdown versionados en git. Eso tiene un valor que subestimé antes de tenerlo.

---

## El resultado

El sistema permite escribir artículos que combinan redacción lineal con demos interactivos, video, imágenes optimizadas y animaciones — todo desde el mismo archivo markdown, sin salir del editor. Cuando lo necesitás, metés un componente. Cuando no, escribís texto normal.

Si querés verlo funcionando en un artículo más completo, el de [animated-portfolio](/blog/animated-portfolio) es un buen ejemplo: tiene CodePreview con GSAP y Matter.js corriendo en vivo, ImageSlider con capturas del proceso y videos, y HandDrawn integrado en el texto.

Lo que más valoro es que el sistema es mío. No dependo de una plataforma de terceros, no hay límites arbitrarios sobre qué puedo hacer, y si mañana quiero cambiar algo, lo cambio. El contenido vive en archivos versionados en el mismo repo. Eso tiene un valor que subestimé antes de tenerlo.

Lo que sí requiere es que te banques el overhead inicial: configurar el schema, crear los componentes, entender la carpeta de prose. No es mucho trabajo, pero tampoco es cero.

---

## Para el futuro

El plan original con Notion no desapareció — está en pausa.

La idea era poder escribir en Notion (donde me resulta más cómodo para borradores largos), pasar el contenido por un prompt que lo formatee según mis componentes, revisar el resultado, y hacer push. Todo automatizado con n8n, sin fricción manual. Sigue siendo algo que me apetece montar.

De hecho, ya tengo parte de eso funcionando: un agente de Claude Code configurado específicamente para este blog. Le paso mis ideas en sucio — sin estructura, con faltas de ortografía, notas mezcladas — y le indico qué componentes quiero y dónde. El agente devuelve el artículo formateado: frontmatter correcto, componentes MDC colocados, headings con la jerarquía adecuada, ortografía resuelta. Yo reviso, ajusto lo que no me convence, y hago push. El trabajo aburrido de formatear lo hace él. El criterio sobre qué va y cómo se cuenta sigue siendo mío.

Cuando monte el flujo con n8n, ese prompt del agente es probablemente el punto de partida.

Pero la base va a seguir siendo Nuxt Content. El día que quiera migrar a una base de datos convencional, no hay drama: el frontmatter pasa a ser campos de una tabla, el cuerpo del markdown pasa a ser el contenido principal, y los artículos siguen siendo artículos. La estructura ya está pensada para eso.

Por ahora funciona exactamente como quería: escribo, uso los componentes cuando los necesito, y el blog se actualiza cuando hago push.
