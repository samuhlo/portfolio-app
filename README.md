<div align="center">
  <br />
  <h1><code>./PORTFOLIO.sh</code></h1>

**[Ecosistema interactivo fusionando fluidez GSAP, físicas reales y pipeline GitHub → AI → DB]**
<br />

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-FFCA40?style=for-the-badge&logo=vercel&logoColor=black)](https://samuhlo.dev)
[![Status](https://img.shields.io/badge/STATUS-PRODUCTION-0C0011?style=for-the-badge)](https://github.com/samuhlo/portfolio-app)

  <br />
</div>

---

## // 00\_ THE_MISSION

Portfolio personal construido como un ejercicio de ingeniería de animación y automatización sobre Nuxt 4. El objetivo inicial era conseguir scroll-linked animations complejas (pinned sections, SVG draw-on-scroll, simulación de físicas 2D) manteniendo tres restricciones: SSR funcional, 60 FPS estables en móvil, y una arquitectura de composables que permita escalar sin acoplar lógica de animación a los componentes de vista.

Desde entonces ha crecido en dos ejes: un **pipeline de ingesta automatizada** (GitHub push → Octokit → DeepSeek → Zod → Neon) que auto-gestiona los proyectos del Playground, y un **blog propio con Nuxt Content** con componentes personalizados, assets en Cloudflare R2 y físicas en el header.

> _Toda la lógica de animación vive aislada en composables puros. Los componentes `.vue` solo declaran qué animar, nunca cómo. Si se elimina un módulo, el resto no se rompe._

---

## // 01\_ THE_BLUEPRINT (ARCHITECTURE)

| LAYER         | TECH              | IMPLEMENTATION DETAIL                                          |
| :------------ | :---------------- | :------------------------------------------------------------- |
| **Core**      | `Nuxt 4`          | SSR con Vue Composition API pura. `srcDir: app/`               |
| **Motion**    | `GSAP`            | Instanciado solo cliente + ScrollTrigger                       |
| **Smooth**    | `Lenis`           | AutoRaf apagado, inyectado en el ticker de GSAP                |
| **Physics**   | `Matter.js`       | Canvas + IntersectionObs. con pause/resume                     |
| **Styles**    | `Tailwind 4`      | Config v4 estricta, utility-first sin CSS roto                 |
| **Content**   | `Nuxt Content`    | Markdown → componentes Prose personalizados                    |
| **Assets**    | `Cloudflare R2`   | Pipeline de upload para imágenes y vídeos del blog             |
| **DB**        | `Drizzle + Neon`  | PostgreSQL serverless, upsert vía webhook                      |
| **AI**        | `DeepSeek`        | Extracción de metadatos desde READMEs de GitHub                |
| **State**     | `Pinia`           | Store de proyectos con SWR cache (5 min TTL)                   |

---

## // 02\_ CONTROLLED_CHAOS (KEY FEATURES)

**Simulaciones de Gravedad Laziloaded**
La sección de contacto no es CSS. Es Canvas 2D renderizando coordenadas inyectadas por Matter.js, calculando los cuerpos midiendo los glyphs tipográficos en tiempo real. Inicia al 40% del viewport, se pausa automáticamente al salir y reanuda al volver — cero CPU fuera de pantalla. La misma arquitectura se reutiliza para el header del blog (`useBlogHeaderPhysics`) y la página de error (`useErrorPhysics`).

**Pipeline GitHub → AI → DB → Front**
Al hacer push a GitHub, un webhook dispara un pipeline completo: Octokit extrae el README, DeepSeek analiza y estructura los metadatos, Zod valida el resultado, y Drizzle hace upsert en Neon PostgreSQL. El front consume los datos via Pinia con caché SWR de 5 minutos. Modo strict elimina proyectos sin `mainImgUrl`, `imagesUrl` o `liveUrl`.

**Blog con Componentes Prose Propios**
El blog usa Nuxt Content pero con un sistema de componentes completamente custom: `ProsePre` con header, metadatos y botón de copia; `CodePreview` con iframe con scroll horizontal; `ImageSlider` con cursor label y `aspect-ratio` responsive; `BlogMedia` que soporta tanto imágenes como vídeos. Los assets viven en un bucket R2 y se sirven a través de Nuxt Image.

**Scroll Animado Monolítico Unilateral**
Hero y Bio se descomponen con scrubbing de scroll reteniendo el avance (`completed[]`) para no deshacer la animación en scroll inverso. Los doodles SVG se dibujan via `dashOffset` orquestados desde `useDoodleDraw`, con `resetPaths`/`erasePaths` reutilizables para hover, scroll indicators y estados activos de categoría.

---

## // 03\_ CORE_LOGIC (SNIPPET)

El pipeline de ingesta. Un único flujo que convierte un push de GitHub en un proyecto renderizado en el front, sin intervención manual:

```typescript
// server/utils/ingest.ts — GitHub push → DB upsert

export async function ingestRepo(repoFullName: string): Promise<void> {
  // 1. Fetch README via Octokit
  const readme = await fetchReadme(repoFullName);
  if (!readme) return;

  // 2. DeepSeek extrae metadatos estructurados
  const raw = await extractProjectData(readme, repoFullName);

  // 3. Zod valida el resultado antes de persistir
  const parsed = ProjectSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn(`[ingest] Schema validation failed for ${repoFullName}`);
    return;
  }

  // 4. Strict mode: eliminar proyectos incompletos
  if (STRICT_MODE && !isComplete(parsed.data)) {
    await deleteProject(parsed.data.slug);
    return;
  }

  // 5. Upsert en Neon vía Drizzle
  await upsertProject(parsed.data);
  await invalidateCache();
}
```

---

## // 04\_ ROADMAP

**001 — Blog Personal** `[SHIPPED]`

Sistema de blog integrado con Nuxt Content. Posts en Markdown con componentes Prose custom (`ProsePre`, `ImageSlider`, `CodePreview`, `HandDrawn`, `DrawHeading`). Assets en Cloudflare R2, física en el header, navegación entre posts, categorías con animaciones SVG.

**002 — Pipeline de Proyectos (GitHub → AI → DB → Front)** `[SHIPPED]`

Ingesta automatizada vía webhook GitHub. README analizado por DeepSeek, validado con Zod y persistido en Neon PostgreSQL. Front consume via Pinia con caché SWR. Modo strict para control de calidad de datos.

**003 — Automatización del Blog (Doc → AI → DB → Web)**

Al subir un `.doc` con notas, un pipeline procesa el contenido con IA, extrae estructura, genera metadata SEO y persiste el resultado parseado en DB. La web lo expone como entrada de blog sin intervención manual.

**004 — Variantes de Diseño por Post**

Cada entrada de blog recibe variables de layout aleatorias o configurables (grid, tipografía, paleta, dirección de lectura) para romper la monotonía visual. Ningún post se ve igual a otro.

---

<div align="center">
<br />

<code>DESIGNED & CODED BY <a href='https://github.com/samuhlo'>samuhlo</a></code>

<small>Lugo, Galicia</small>

</div>
