# Asset Pipeline — Cloudflare R2 + Nuxt Image

> Cómo funciona el sistema de imágenes del blog: bucket R2, subida de assets, optimización automática con Nuxt Image y uso en posts mediante MDC.

---

## Arquitectura general

```
Author sube JPEG/PNG   →   R2 bucket (portfolio-bucket)
                                  ↓
                        assets.samuhlo.dev (custom domain)
                            Cloudflare CDN + Cache
                                  ↓
               NuxtPicture en el post del blog
           (IPX convierte a AVIF/WebP on-the-fly + resize)
                                  ↓
                         Navegador recibe AVIF
```

Los archivos se almacenan en R2 tal cual se suben (JPEG, PNG, WebP). Nuxt Image los optimiza mediante **IPX** (Image Proxy): fetchea la imagen desde el custom domain, la convierte al formato más eficiente y la redimensiona según el breakpoint antes de enviársela al navegador. La primera request optimiza; las siguientes sirven del caché del servidor Nitro.

---

## Variables de entorno

Definidas en `.env` (gitignoreado) y documentadas en `.env.example`:

```env
# Cloudflare — solo para subida programática desde scripts (server-only)
CF_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=portfolio-bucket

# URL pública del bucket — la única var que llega al cliente
NUXT_PUBLIC_ASSETS_URL=https://assets.samuhlo.dev
```

Las credenciales R2 **nunca llegan al cliente**. Solo `NUXT_PUBLIC_ASSETS_URL` se expone via `runtimeConfig.public`.

---

## nuxt.config.ts

### runtimeConfig

```typescript
runtimeConfig: {
  // Server-only — para subida programática futura (Nitro endpoints / n8n)
  cfAccountId: process.env.CF_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME,
  public: {
    assetsUrl: process.env.NUXT_PUBLIC_ASSETS_URL ?? 'https://assets.samuhlo.dev',
  },
},
```

### image

```typescript
image: {
  domains: ['assets.samuhlo.dev'], // whitelist para que IPX pueda fetchear
  alias: {
    blog: 'https://assets.samuhlo.dev/blog', // src="blog/post/img.jpeg"
  },
  format: ['avif', 'webp'],
  quality: 80,
},
```

El **alias `blog`** permite usar rutas cortas en componentes y markdown (`src="blog/mi-post/cover.jpeg"`) sin escribir la URL completa. IPX resuelve el alias internamente al momento de optimizar.

---

## Estructura del bucket

```
portfolio-bucket/
  blog/
    anatomy-of-a-living-portfolio/
      cover.webp
      prueba_blog_1.jpeg
      prueba_blog_2.jpeg
    canvas-curtain-webgl-dom-layers/
      cover.webp
      architecture-diagram.webp
    _shared/
      og-default.webp
      author-avatar.webp
```

**Convención:** `blog/{slug}/{filename}`.

La carpeta `_shared/` agrupa assets reutilizados entre posts: OG image por defecto, avatar del autor, separadores, etc.

---

## Subir imágenes — `bun run assets:upload`

Script en `scripts/upload-r2.ts`. Usa la API S3-compatible de R2 via `@aws-sdk/client-s3`. Lee las credenciales del `.env` automáticamente.

### Uso

```bash
# Archivo individual — el primer arg es la clave (ruta) dentro del bucket
bun run assets:upload blog/mi-post/cover.webp ./cover.webp

# Directorio completo — sube todos los archivos con el prefijo dado
bun run assets:upload blog/mi-post/ ./carpeta-local/
```

### Qué hace el script

1. Valida que las variables de entorno estén presentes, si no aborta con mensaje claro
2. Detecta si la fuente es archivo o directorio
3. En modo directorio, recorre recursivamente manteniendo la estructura de subcarpetas
4. Setea `Content-Type` correcto según extensión del archivo
5. Setea `Cache-Control: public, max-age=31536000, immutable` — los assets son inmutables porque se versionan por nombre, no por URL

### Formatos recomendados

Subir en **WebP** siempre que sea posible. Si subes JPEG, IPX lo convierte a AVIF/WebP en la primera request (luego se cachea), pero ese proceso consume CPU del servidor. Subir WebP directamente evita esa conversión.

---

## Composable `useBlogAssets`

`app/composables/useBlogAssets.ts` — construye URLs de assets en componentes Vue.

```typescript
const { asset, cover, shared } = useBlogAssets('anatomy-of-a-living-portfolio')

cover
// → https://assets.samuhlo.dev/blog/anatomy-of-a-living-portfolio/cover.webp

asset('architecture-diagram.webp')
// → https://assets.samuhlo.dev/blog/anatomy-of-a-living-portfolio/architecture-diagram.webp

shared('og-default.webp')
// → https://assets.samuhlo.dev/blog/_shared/og-default.webp
```

Útil en `[slug].vue` para pasar la imagen del post al SEO:

```typescript
const { cover } = useBlogAssets(slugValue)
useSeoMeta({ ogImage: cover })
```

---

## Componente MDC — `::blog-image`

`app/components/content/BlogImage.vue` — inserta imágenes optimizadas dentro del markdown del post.

Wrappea `NuxtPicture`, que genera automáticamente las fuentes AVIF y WebP. El navegador descarga el formato más eficiente que soporte.

### Uso en markdown

```md
::blog-image
---
src: blog/mi-post/cover.jpeg
alt: Descripción de la imagen
width: 1200
height: 675
caption: Texto de pie de imagen (opcional)
---
::
```

### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `src` | `string` | Path con alias `blog/` o URL completa |
| `alt` | `string` | Texto alternativo — obligatorio |
| `width` | `number` | Ancho original del asset |
| `height` | `number` | Alto original del asset |
| `caption` | `string` | Pie de imagen, opcional |
| `sizes` | `string` | Breakpoints responsive (default: `sm:100vw md:90vw lg:800px`) |

### Lo que NuxtPicture genera en el HTML

```html
<figure>
  <picture>
    <source type="image/avif" srcset="/_ipx/f_avif&w_800/blog/mi-post/cover.jpeg 800w, ...">
    <source type="image/webp" srcset="/_ipx/f_webp&w_800/blog/mi-post/cover.jpeg 800w, ...">
    <img src="/_ipx/f_jpeg&w_800/blog/mi-post/cover.jpeg" loading="lazy" class="w-full h-auto">
  </picture>
  <figcaption>Texto de pie</figcaption> <!-- solo si se pasa caption -->
</figure>
```

---

## Verificar que funciona

Con `bun run dev` abierto en el post de prueba:

1. **DevTools → Network → Img** — las requests deben ir a `/_ipx/...` y el `Content-Type` de la respuesta debe ser `image/avif` en Chrome/Firefox modernos
2. **DevTools → Network → Size** — el AVIF debe ser notablemente más pequeño que el JPEG original
3. **DevTools → Elements** — el `<img>` debe tener `loading="lazy"`; las imágenes fuera del viewport no deben aparecer en Network hasta hacer scroll

---

## Workflow completo para un post nuevo

```bash
# 1. Preparar imágenes (recomendado: WebP, max 1600px de ancho)

# 2. Subir al bucket
bun run assets:upload blog/nuevo-post/ ./mis-imagenes/

# 3. Referenciar en el frontmatter (para OG/cover)
#    image: https://assets.samuhlo.dev/blog/nuevo-post/cover.webp

# 4. Insertar en el cuerpo del post
#    ::blog-image
#    ---
#    src: blog/nuevo-post/cover.webp
#    alt: Descripción
#    width: 1600
#    height: 900
#    ---
#    ::

# 5. Para SEO en [slug].vue (si se necesita fuera del frontmatter)
#    const { cover } = useBlogAssets(slugValue)
#    useSeoMeta({ ogImage: cover })
```

---

## Notas

- **Free tier R2:** 10 GB storage, 10M reads/mes, 1M writes/mes — más que suficiente para un blog personal.
- **Egress gratuito:** R2 no cobra por transferencia de salida a diferencia de S3. El custom domain usa la red de Cloudflare.
- **Portabilidad:** R2 es S3-compatible. Si se migra a otro proveedor, solo cambia el endpoint y las credenciales en `.env`. El código del script y del composable no cambia.
- **Deploy en VPS:** El bucket es externo al servidor Nuxt. Al desplegar, solo hay que asegurarse de que las variables de entorno incluyan las credenciales R2.
