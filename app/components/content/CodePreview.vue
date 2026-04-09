<script setup lang="ts">
/**
 * █ [MDC] :: CODE PREVIEW
 * =====================================================================
 * DESC:   Componente MDC para demos de código en vivo — al estilo CodePen.
 *         Acepta HTML, CSS y JS como props YAML. El preview corre en un
 *         <iframe srcdoc> aislado del blog. GSAP y ScrollTrigger se
 *         auto-inyectan desde CDN si se detectan en el JS.
 *         El código se resalta server-side via /api/_highlight (Shiki).
 *
 * USAGE (markdown):
 *   ::code-preview
 *   ---
 *   height: 320
 *   html: |
 *     <div class="box"></div>
 *   css: |
 *     body { display: flex; align-items: center;
 *            justify-content: center; min-height: 100vh;
 *            background: #0c0011; }
 *     .box { width: 80px; height: 80px; background: #ffca40; }
 *   js: |
 *     gsap.to(".box", { rotation: 360, x: 200, duration: 1.5,
 *                       repeat: -1, yoyo: true });
 *   ---
 *   ::
 *
 * AUTO-INJECT CDN:
 *   gsap         → GSAP core
 *   ScrollTrigger → GSAP ScrollTrigger plugin
 *   Draggable    → GSAP Draggable plugin
 *   Matter       → Matter.js Physics Engine
 *
 * TAMAÑO Y ALINEACIÓN:
 *   Sin maxWidth el componente ocupa el 100% del contenedor (por defecto).
 *   Con maxWidth se puede controlar el ancho y la posición horizontal:
 *
 *   ::code-preview        — centrado a 560px
 *   ---
 *   height: 320
 *   maxWidth: 560px
 *   align: center
 *   html: |
 *     <div class="box"></div>
 *   ---
 *   ::
 *
 *   ::code-preview        — alineado a la derecha al 70%
 *   ---
 *   height: 320
 *   maxWidth: 70%
 *   align: right
 *   html: |
 *     <div class="box"></div>
 *   ---
 *   ::
 *
 *   maxWidth acepta cualquier unidad CSS válida: px, %, rem, etc.
 *   align puede ser 'left' | 'center' | 'right' (default: 'center').
 *   Si no se pasa maxWidth, align no tiene efecto.
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

// =============================================================================
// █ CONSTANTS (CDN SCRIPTS)
// =============================================================================
const EXTERNAL_SCRIPTS: Record<string, string> = {
  // GSAP
  gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  ScrollTrigger: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
  Draggable: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js',
  // Physics
  Matter: 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js',
};

// Estilos base inyectados en el iframe — reset mínimo, sin imponer diseño.
// overflow-x: auto → si la demo tiene contenido más ancho que el iframe,
// se puede scrollear horizontalmente dentro del preview en lugar de cliparse.
const IFRAME_BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: sans-serif; overflow-x: auto; }
`.trim();

// =============================================================================
// █ PROPS
// =============================================================================
const props = withDefaults(
  defineProps<{
    html?: string;
    css?: string;
    js?: string;
    /** Altura del iframe de preview en px */
    height?: string | number;
    /**
     * Ancho máximo del componente.
     * Acepta px, %, rem, etc. (e.g. '700px', '80%')
     * Sin valor → ocupa el 100% disponible.
     */
    maxWidth?: string;
    /**
     * Alineación horizontal cuando maxWidth está definido.
     * 'left' | 'center' | 'right'  — default: 'center'
     */
    align?: 'left' | 'center' | 'right';
  }>(),
  {
    height: 280,
    align: 'center',
  },
);

const wrapperStyle = computed(() => {
  if (!props.maxWidth) return {};
  const ml = props.align === 'right' ? 'auto' : props.align === 'center' ? 'auto' : '0';
  const mr = props.align === 'left' ? 'auto' : props.align === 'center' ? 'auto' : '0';
  return { maxWidth: props.maxWidth, marginLeft: ml, marginRight: mr, width: '100%' };
});

// =============================================================================
// █ TABS
// =============================================================================
type Tab = 'preview' | 'html' | 'css' | 'js';

// [NOTE] Solo mostrar tabs con contenido real. Preview siempre visible.
const availableTabs = computed<Tab[]>(() => {
  const tabs: Tab[] = ['preview'];
  if (props.html) tabs.push('html');
  if (props.css) tabs.push('css');
  if (props.js) tabs.push('js');
  return tabs;
});

const active = ref<Tab>('preview');

// =============================================================================
// █ SRCDOC — iframe content
// =============================================================================
const srcdoc = computed(() => {
  const js = props.js ?? '';

  // Auto-detectar qué scripts externos inyectar
  const scriptTags = Object.entries(EXTERNAL_SCRIPTS)
    .filter(([key]) => js.includes(key))
    .map(([, url]) => `<script src="${url}"><\/script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${IFRAME_BASE_CSS}</style>
  <style>${props.css ?? ''}</style>
  ${scriptTags}
</head>
<body>
  ${props.html ?? ''}
  <script>${js}<\/script>
</body>
</html>`;
});

// =============================================================================
// █ SYNTAX HIGHLIGHTING
// =============================================================================
const highlighted = ref<Record<'html' | 'css' | 'js', string>>({
  html: '',
  css: '',
  js: '',
});

// [NOTE] Highlighting client-side: el servidor ya sirvió el HTML con código
// plano, onMounted enriquece con colores sin bloquear el render inicial.
onMounted(async () => {
  const tasks: Promise<void>[] = [];

  const fetch = (code: string, lang: string, key: 'html' | 'css' | 'js') =>
    $fetch<string>('/api/_highlight', { method: 'POST', body: { code, lang }, responseType: 'text' })
      .then((html) => {
        highlighted.value[key] = html;
      })
      .catch((e) => {
        console.warn(`[CodePreview] highlight failed for ${lang}:`, e?.message ?? e);
      });

  if (props.html) tasks.push(fetch(props.html, 'html', 'html'));
  if (props.css) tasks.push(fetch(props.css, 'css', 'css'));
  if (props.js) tasks.push(fetch(props.js, 'javascript', 'js'));

  await Promise.all(tasks);
});

// =============================================================================
// █ COPY BUTTON
// =============================================================================
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

const activeCode = computed(() => {
  if (active.value === 'html') return props.html ?? '';
  if (active.value === 'css') return props.css ?? '';
  if (active.value === 'js') return props.js ?? '';
  return '';
});

async function handleCopy() {
  if (!activeCode.value) return;
  await navigator.clipboard.writeText(activeCode.value.trim());
  copied.value = true;
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copied.value = false;
  }, 2000);
}

onUnmounted(() => {
  if (copyTimer) clearTimeout(copyTimer);
});

// =============================================================================
// █ HELPERS
// =============================================================================
const iframeHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
);
</script>

<template>
  <div class="code-preview not-prose my-8" :style="wrapperStyle">
    <!-- ================================================================
         TAB BAR
         ================================================================ -->
    <div class="cp-tabs">
      <button
        v-for="tab in availableTabs"
        :key="tab"
        role="tab"
        :aria-selected="active === tab"
        :aria-label="`Show ${tab} tab`"
        class="cp-tab"
        :class="{ 'cp-tab--active': active === tab }"
        @click="active = tab"
      >
        {{ tab }}
      </button>

      <!-- Copy: solo visible en tabs de código, no en preview -->
      <button
        v-if="active !== 'preview'"
        aria-label="Copy code"
        class="cp-copy"
        :class="{ 'cp-copy--copied': copied }"
        @click="handleCopy"
      >
        {{ copied ? 'copied' : 'copy' }}
      </button>
    </div>

    <!-- ================================================================
         CODE PANES — Shiki-highlighted o fallback a <pre> plano
         ================================================================ -->
    <div v-show="active === 'html' && !!html" class="cp-pane cp-pane--code">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="highlighted.html" class="cp-shiki" v-html="highlighted.html" />
      <pre v-else class="cp-pre"><code>{{ html }}</code></pre>
    </div>

    <div v-show="active === 'css' && !!css" class="cp-pane cp-pane--code">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="highlighted.css" class="cp-shiki" v-html="highlighted.css" />
      <pre v-else class="cp-pre"><code>{{ css }}</code></pre>
    </div>

    <div v-show="active === 'js' && !!js" class="cp-pane cp-pane--code">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="highlighted.js" class="cp-shiki" v-html="highlighted.js" />
      <pre v-else class="cp-pre"><code>{{ js }}</code></pre>
    </div>

    <!-- ================================================================
         PREVIEW — iframe aislado con srcdoc
         ================================================================ -->
    <div v-show="active === 'preview'" class="cp-pane cp-pane--preview">
      <iframe
        :srcdoc="srcdoc"
        sandbox="allow-scripts"
        title="Code preview"
        :style="{ height: iframeHeight }"
        class="cp-iframe"
      />
    </div>
  </div>
</template>

<style scoped>
/* ================================================================
   CONTAINER
   ================================================================ */
.code-preview {
  border: 1px solid rgba(12, 0, 17, 0.08);
  border-left: 2px solid var(--color-accent);
  overflow: hidden;
}

/* ================================================================
   TAB BAR
   ================================================================ */
.cp-tabs {
  display: flex;
  align-items: stretch;
  background: rgba(12, 0, 17, 0.025);
  border-bottom: 1px solid rgba(12, 0, 17, 0.06);
}

.cp-tab {
  position: relative;
  padding: 0.4rem 1.1rem;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s ease;
  user-select: none;
}

.cp-tab:hover {
  opacity: 0.6;
}

.cp-tab--active {
  opacity: 1;
}

.cp-tab--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1.5px;
  background: var(--color-accent);
}

/* Copy button — mismo estilo que ProsePre, empujado a la derecha */
.cp-copy {
  margin-left: auto;
  padding: 0.4rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.65;
  transition: opacity 0.2s ease;
  user-select: none;
}

.cp-copy:hover {
  opacity: 1;
}
.cp-copy--copied {
  opacity: 1;
  color: var(--color-accent);
}

/* ================================================================
   IFRAME PANE
   ================================================================ */
.cp-pane--preview {
  background: #fff;
}

.cp-iframe {
  display: block;
  width: 100%;
  border: none;
}

/* ================================================================
   CODE PANE
   ================================================================ */
.cp-pane--code {
  overflow: auto;
}

/* cp-highlight-block es la clase raíz del bloque Shiki (renombrada en el API
   para no colisionar con el CSS global de @nuxt/content que afecta a .shiki) */
.cp-shiki :deep(.cp-highlight-block) {
  background: transparent !important;
}

.cp-shiki :deep(pre) {
  margin: 0;
  padding: 1.25rem 1.5rem;
  background: transparent !important;
  font-family: 'Fira Code', var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.8;
}

/* Fallback <pre> sin highlighting */
.cp-pre {
  margin: 0;
  padding: 1.25rem 1.5rem;
  font-family: 'Fira Code', var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.8;
  overflow-x: auto;
  background: transparent;
}

.cp-pre code {
  font-family: inherit;
}
</style>
