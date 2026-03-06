/**
 * ========================================================================
 * [CONFIG] :: SITE CONSTANTS
 * ========================================================================
 * DESC:   Constantes globales centralizadas: URLs, breakpoints, colores.
 *         Fuente única de verdad para evitar duplicación en el codebase.
 * STATUS: STABLE
 * ========================================================================
 */

export const SITE = {
  url: 'https://samuhlo.dev',
  email: 'hola@samuhlo.dev',
  github: 'https://github.com/samuhlo',
  linkedin: 'https://www.linkedin.com/in/samuhlo/',
} as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export const COLORS = {
  background: '#faf3f0',
  foreground: '#0c0011',
  accent: '#ffca40',
} as const;
