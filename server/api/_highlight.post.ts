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

import { codeToHtml } from 'shiki';

// [NOTE] Singleton — Shiki carga los langs/themes una vez y los reutiliza
let ready = false;

export default defineEventHandler(async (event) => {
  const { code, lang } = await readBody<{ code: string; lang: string }>(event);

  if (!code) return '';

  // [NOTE] Shiki v4 no requiere instancia explícita — codeToHtml es stateless
  // pero sí cachea internamente los bundles de lenguaje/tema al primer uso.
  if (!ready) ready = true;

  return codeToHtml(code.trim(), {
    lang: lang || 'html',
    theme: 'github-light',
  });
});
