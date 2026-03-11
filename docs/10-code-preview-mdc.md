# CodePreview MDC — Demos de código en vivo

> Cómo funciona el componente `::code-preview` y por qué está hecho así.

---

## Qué es y para qué sirve

`CodePreview` es un componente que puedes usar dentro del markdown de tus posts para mostrar código **y** verlo ejecutándose en vivo, como CodePen pero integrado en el blog.

Tiene tabs: **PREVIEW** (el resultado en vivo), **HTML**, **CSS** y **JS** (el código que lo genera). Solo aparecen los tabs que tienen contenido. En los tabs de código hay un botón **copy** arriba a la derecha.

---

## Cómo usarlo en un post

```md
::code-preview
---
height: 320
html: |
  <div class="caja"></div>
css: |
  body {
    background: #0c0011;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .caja {
    width: 80px;
    height: 80px;
    background: #ffca40;
    border-radius: 4px;
  }
js: |
  gsap.to(".caja", {
    x: 200,
    rotation: 360,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
---
::
```

Los tres bloques (`html`, `css`, `js`) son todos **opcionales**. Si solo tienes HTML y CSS, no aparece el tab de JS. Si solo tienes JS, solo aparecen PREVIEW y JS.

### Props disponibles

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `html` | string | — | El HTML que va dentro del `<body>` del demo |
| `css` | string | — | El CSS del demo |
| `js` | string | — | El JavaScript del demo |
| `height` | number | 280 | Alto del panel de preview en px |

---

## GSAP se inyecta automático

Si en el `js` escribes `gsap`, el componente inyecta automáticamente la librería desde CDN. No tienes que importar nada. Lo mismo con `ScrollTrigger` y `Draggable`:

```yaml
js: |
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".box", {
    scrollTrigger: { ... },
    x: 200
  });
```

→ El componente detecta `gsap` y `ScrollTrigger` en el string y añade los dos `<script src="cdn">` solos.

Los CDN que usa (versión 3.12.5):
- `gsap` → `cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- `ScrollTrigger` → mismo path con `ScrollTrigger.min.js`
- `Draggable` → mismo path con `Draggable.min.js`

---

## Por qué un iframe y no un div

El preview corre dentro de un `<iframe>` con el atributo `sandbox="allow-scripts"`. Esto es importante por dos razones:

**1. Aislamiento total del blog**
Las animaciones GSAP del demo no interfieren con las animaciones GSAP del blog (BioSection, HeroSection, etc.). Cada uno tiene su propio contexto de GSAP, sus propios tweens, sus propios ScrollTriggers. Sin iframe, un `gsap.killAll()` en el demo mataría las animaciones del blog.

**2. CSS limpio**
El CSS del demo no se mezcla con el CSS del blog. Puedes poner `body { background: black }` en el demo sin afectar a nada fuera.

El `sandbox="allow-scripts"` permite ejecutar JavaScript pero bloquea formularios, popups, navegación, y acceso a storage. Perfecto para demos.

---

## Cómo funciona por dentro

### 1. El srcdoc

El componente construye un string HTML completo (`srcdoc`) que se inyecta en el iframe:

```
<!DOCTYPE html>
<html>
<head>
  [CSS reset mínimo]
  [Tu CSS]
  [Script tags de GSAP si se detectan]
</head>
<body>
  [Tu HTML]
  <script>[Tu JS]</script>
</body>
</html>
```

El iframe renderiza ese string como una página completa. Cada vez que cambia un prop (en dev), el iframe se reconstruye.

### 2. El syntax highlighting

El código de los tabs (HTML, CSS, JS) se pasa al componente como strings planos en el YAML frontmatter. Esos strings no pasan por el pipeline de Nuxt Content (que solo procesa los fenced code blocks ` ``` ` dentro del markdown). Para resaltarlos hay que hacerlo aparte.

La solución: un endpoint Nitro propio en `server/api/_highlight.post.ts` que usa **Shiki** (ya instalado como dependencia de `@nuxt/content`) para resaltar el código server-side.

El flujo:
1. El componente monta en el cliente
2. Llama a `POST /api/_highlight` con el código y el lenguaje
3. El servidor resalta con Shiki (tema `github-light`, igual que los code blocks del blog)
4. Devuelve el HTML con las clases de color
5. El componente lo renderiza con `v-html`

Mientras llega el highlighting (suele ser ~50-100ms), se muestra el código sin color como fallback. El usuario apenas lo nota.

### 3. El botón copy

Copia el string raw del prop activo (`props.html`, `props.css` o `props.js`). Solo aparece cuando el tab activo no es PREVIEW. Mismo patrón visual que el botón copy de `ProsePre` (el componente que renderiza los bloques de código normales del markdown).

---

## Ejemplo completo: solo CSS, sin JS

Si quieres mostrar solo una animación CSS pura:

```md
::code-preview
---
height: 200
html: |
  <div class="spinner"></div>
css: |
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f5f5f5;
  }
  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #ccc;
    border-top-color: #ffca40;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
---
::
```

No aparece el tab JS porque no hay `js` en el YAML.

---

## Dónde están los archivos

| Archivo | Qué hace |
|---|---|
| `app/components/content/CodePreview.vue` | El componente MDC completo |
| `server/api/_highlight.post.ts` | Endpoint Nitro para syntax highlighting con Shiki |

---

## Notas

- **YAML multiline strings**: usa `|` (literal block scalar) para preservar los saltos de línea. Si usas `>` (folded) los saltos de línea se convierten en espacios y el código queda en una línea.
- **Comillas en el YAML**: si tu HTML tiene atributos con comillas dobles (`class="..."`) el YAML las procesa bien dentro del bloque `|`. Si tienes problemas, escapa con `\"` o usa comillas simples en el HTML.
- **Height**: ajusta `height` según el contenido del demo. Para animaciones que se mueven horizontalmente, 200-300px suele ser suficiente. Para layouts más complejos, 400-500px.
- **El iframe no tiene acceso a Internet** excepto para cargar los CDN de GSAP. `sandbox="allow-scripts"` bloquea todo lo demás.
