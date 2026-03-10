<script setup lang="ts">
/**
 * █ [PROSE] :: PROSE PRE
 * =====================================================================
 * DESC:   Override del bloque de código (triple backtick) de Nuxt Content.
 *         ProsePre es el componente correcto para fenced code blocks.
 *         El prop `code` contiene el HTML ya resaltado por Shiki.
 *         Header: lenguaje + filename + botón copy.
 * =====================================================================
 */

import { ref, onUnmounted } from 'vue';

// inheritAttrs: false — evita que `class` (con las clases shiki) caiga
// automáticamente en el div raíz. Lo pasamos manualmente al <pre>.
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  class?: string | null;
}>();

// =============================================================================
// █ COPY — `code` prop es texto raw, se copia directo
// =============================================================================
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

async function handleCopy() {
  if (!props.code) return;
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copied.value = false; }, 2000);
}

onUnmounted(() => {
  if (copyTimer) clearTimeout(copyTimer);
});
</script>

<template>
  <div class="prose-pre not-prose">

    <!-- Header: lenguaje · filename · copy -->
    <div class="pre-header">
      <div class="pre-meta">
        <span class="pre-lang">{{ language ?? 'code' }}</span>
        <span v-if="filename" class="pre-filename">{{ filename }}</span>
      </div>
      <button class="pre-copy" :class="{ copied }" @click="handleCopy">
        {{ copied ? 'copied' : 'copy' }}
      </button>
    </div>

    <!-- Code: slot contiene el HTML de Shiki con colores.
         :class="props.class" pasa "shiki shiki-themes github-light..."
         al <pre> para que el selector css "html .shiki span" funcione. -->
    <div class="pre-body">
      <pre :class="props.class"><slot /></pre>
    </div>

  </div>
</template>

<style scoped>
/* ================================================================
   CONTAINER
   ================================================================ */
.prose-pre {
  margin-bottom: 2rem;
  border: 1px solid rgba(12, 0, 17, 0.08);
  border-left: 2px solid var(--color-accent);
}

/* ================================================================
   HEADER
   ================================================================ */
.pre-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 1rem;
  background: rgba(12, 0, 17, 0.025);
  border-bottom: 1px solid rgba(12, 0, 17, 0.06);
}

.pre-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pre-lang {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  opacity: 0.35;
  user-select: none;
}

.pre-filename {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  opacity: 0.45;
  padding-left: 0.75rem;
  border-left: 1px solid rgba(12, 0, 17, 0.12);
}

/* ================================================================
   COPY BUTTON
   ================================================================ */
.pre-copy {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0.2;
  transition: opacity 0.2s ease;
  user-select: none;
}

.pre-copy:hover { opacity: 0.75; }
.pre-copy.copied { opacity: 0.55; }

/* ================================================================
   CODE BODY
   Shiki mete background-color inline — lo reseteamos para usar
   el fondo del container (transparente → cream del blog).
   Los colores de los tokens (keywords, strings, etc.) se mantienen.
   ================================================================ */
.pre-body {
  overflow-x: auto;
}

pre {
  margin: 0;
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
  background: transparent !important;
}

code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.8;
  background: transparent !important;
}

/* Líneas resaltadas — se activan con ```ts {1,3} en el markdown */
:deep(.line.highlight) {
  display: block;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
  background: rgba(255, 202, 64, 0.1);
}
</style>
