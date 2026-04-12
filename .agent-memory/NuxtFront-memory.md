# NuxtFront — Memoria del Agente

Memoria operativa para decisiones importantes del proyecto.

---

## [2026-04-11] — Creación del agente NuxtFront

**Contexto**: Creación de agente especializado en frontend Nuxt para mejorar el workflow de desarrollo en proyectos Nuxt 4+.

**Decisión**: Crear agente `nuxt-front` que combine 12 skills: nuxt, nuxt-ui, nuxt-content, nuxt-seo, nuxt-better-auth, nuxt-modules, vue, frontend-design, motion, web-design-guidelines, accessibility, performance.

**Activación**: Trigger `nuxt-front` (automático) + skill tool para invocar skills dinámicamente.

**Modes implementados**:

1. Desarrollo nuevo
2. Auditoría técnica
3. Auditoría visual
4. Contenido/CMS
5. Auth
6. Performance

**Stack por defecto**: Nuxt 4+, TypeScript estricto, Tailwind CSS v4, @nuxt/ui v4, motion-v, Vue 3 Composition API.

---

## Notas de uso

- Leer este archivo al iniciar para recuperar contexto del proyecto
- Guardar decisiones importantes con el formato marcado
- Mantener este archivo ordenado por fecha (más reciente primero)

---

## [2026-04-12] — Decisión: Primera fase SEO blog con OG genérica

**Contexto**: El blog no estaba enviando metadatos sólidos para compartir (OG/Twitter) y el SEO por artículo caía a valores vacíos cuando no había datos resueltos en SSR.

**Decisión**: Implementar una primera fase centrada en metadatos robustos para `/blog` y `/blog/[slug]`, usando una OG genérica global (`/images/og-image.png`) y copy SEO por locale con fallback.

**Alternativas consideradas**: (1) Generar OG dinámica por artículo desde el primer cambio, (2) forzar imagen por frontmatter en todos los posts antes de desplegar.

**Impacto**: Mejora inmediata de compartición en redes y consistencia SEO sin bloquear publicación; se deja para siguiente fase OG por artículo + schema y sitemap dinámico de posts.

---

## [2026-04-12] — Decisión: Fix SSR Nuxt Content en serverless con SQLite en /tmp

**Contexto**: En producción, las peticiones `POST /__nuxt_content/*/query` devolvían 500 y el blog quedaba vacío en SSR para bots (aunque en cliente pudiera recuperarse parcialmente por `refresh()`).

**Decisión**: Forzar `content.database.filename` a ruta escribible en runtime serverless (`/tmp/contents.sqlite`) mediante `nuxt.config.ts`.

**Alternativas consideradas**: (1) Mantener configuración implícita por defecto, (2) migrar directamente a Postgres/LibSQL para Content.

**Impacto**: Nuxt Content puede inicializar y consultar su SQLite en SSR dentro del entorno serverless; mejora directa en render server-side, SEO y compartición social.
