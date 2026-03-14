/**
 * █ [API] :: HIGHLIGHT
 * =====================================================================
 * DESC:   Endpoint Nitro para syntax highlighting server-side con Shiki.
 *         Usado por CodePreview para resaltar código pasado como prop
 *         (fuera del pipeline de Nuxt Content que solo procesa markdown).
 *         El highlighter se cachea en memoria entre requests.
 * STATUS: STABLE
 * =====================================================================
 */

import { createHighlighter, type Highlighter } from 'shiki';

// [NOTE] Singleton — createHighlighter carga langs/theme una vez y los mantiene
// en memoria. Necesario en serverless para que css/js/ts tengan sus gramáticas
// disponibles sin depender de dynamic imports que pueden fallar en edge.
let highlighterPromise: Promise<Highlighter> | null = null;

const LANGS = ['html', 'css', 'javascript', 'typescript', 'vue', 'bash', 'json'] as const;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['snazzy-light'],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

export default defineEventHandler(async (event) => {
  const { code, lang } = await readBody<{ code: string; lang: string }>(event);

  if (!code) return '';

  const highlighter = await getHighlighter();

  const html = await highlighter.codeToHtml(code.trim(), {
    lang: LANGS.includes(lang as (typeof LANGS)[number]) ? lang : 'html',
    theme: 'snazzy-light',
  });

  // [NOTE] Rename the Shiki root class to avoid collision with @nuxt/content's
  // global CSS that targets `.shiki span` and can override inline color styles.
  return html.replace(/class="shiki[^"]*"/, 'class="cp-highlight-block"');
});
