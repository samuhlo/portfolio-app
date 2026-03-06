/**
 * ========================================================================
 * [UTIL] :: LOGGING UTILITY
 * ========================================================================
 * DESC:   Sistema de logging unificado para backend y scripts.
 *         Tags de 6 chars, separadores estilizados.
 * ========================================================================
 */

const LOG_SEPARATOR = {
  general: '::',
  start: '>>',
  success: '++',
  fail: '!!',
  outbound: '->',
} as const;

type LogTag =
  | '[API]'
  | '[WEBHOOK]'
  | '[DB]'
  | '[IA]'
  | '[SEED]'
  | '[CACHE]'
  | '[AUTH]'
  | '[HOOK]'
  | '[VALID]';

type LogSeparator = (typeof LOG_SEPARATOR)[keyof typeof LOG_SEPARATOR];

/**
 * Imprime un log formateado
 */
function log(tag: LogTag, sep: LogSeparator, action: string, detail: string): void {
  const paddedTag = tag.padEnd(8);
  const paddedAction = action.padEnd(18);
  console.log(`${paddedTag} ${sep}  ${paddedAction} :: ${detail}`);
}

/**
 * Tags de logging predefinidos
 */
export const logger = {
  // API endpoints
  api: {
    start: (endpoint: string) => log('[API]', LOG_SEPARATOR.start, 'REQUEST', endpoint),
    success: (endpoint: string, count: number) =>
      log('[API]', LOG_SEPARATOR.success, 'RESPONSE', `${endpoint} | count: ${count}`),
    error: (endpoint: string, err: string) =>
      log('[API]', LOG_SEPARATOR.fail, 'ERROR', `${endpoint} | error: ${err}`),
  },

  // Webhooks
  webhook: {
    received: (event: string, repo: string) =>
      log('[WEBHOOK]', LOG_SEPARATOR.start, 'RECEIVED', `event: ${event} | repo: ${repo}`),
    verified: (status: boolean) =>
      log('[WEBHOOK]', LOG_SEPARATOR.success, 'VERIFY', `signature: ${status ? 'OK' : 'FAIL'}`),
    skipped: (reason: string) => log('[WEBHOOK]', LOG_SEPARATOR.general, 'SKIPPED', reason),
    error: (err: string) => log('[WEBHOOK]', LOG_SEPARATOR.fail, 'ERROR', err),
  },

  // Database operations
  db: {
    start: (operation: string) => log('[DB]', LOG_SEPARATOR.start, operation.toUpperCase(), ''),
    success: (operation: string, id?: string) =>
      log('[DB]', LOG_SEPARATOR.success, operation.toUpperCase(), id ? `id: ${id}` : 'OK'),
    error: (operation: string, err: string) =>
      log('[DB]', LOG_SEPARATOR.fail, operation.toUpperCase(), err),
  },

  // IA/AI operations
  ia: {
    start: (operation: string) => log('[IA]', LOG_SEPARATOR.start, 'EXTRACT', operation),
    success: (operation: string) => log('[IA]', LOG_SEPARATOR.success, 'EXTRACT', operation),
    error: (operation: string, err: string) =>
      log('[IA]', LOG_SEPARATOR.fail, 'EXTRACT', `${operation} | error: ${err}`),
  },

  // Seed scripts
  seed: {
    start: (repo: string) => log('[SEED]', LOG_SEPARATOR.start, 'INIT', `repo: ${repo}`),
    saving: (id: string) => log('[SEED]', LOG_SEPARATOR.general, 'SAVE', `id: ${id}`),
    saved: (id: string) => log('[SEED]', LOG_SEPARATOR.success, 'SAVED', `id: ${id}`),
    skipped: (reason: string) => log('[SEED]', LOG_SEPARATOR.general, 'SKIP', reason),
    error: (err: string) => log('[SEED]', LOG_SEPARATOR.fail, 'ERROR', err),
  },

  // Cache operations
  cache: {
    hit: (key: string) => log('[CACHE]', LOG_SEPARATOR.success, 'HIT', `key: ${key}`),
    miss: (key: string) => log('[CACHE]', LOG_SEPARATOR.start, 'MISS', `key: ${key}`),
    invalidated: (key: string) => log('[CACHE]', LOG_SEPARATOR.general, 'INVALID', `key: ${key}`),
  },

  // Validation
  validation: {
    success: (field: string) => log('[VALID]', LOG_SEPARATOR.success, 'OK', field),
    error: (field: string, err: string) =>
      log('[VALID]', LOG_SEPARATOR.fail, 'FAIL', `${field} | ${err}`),
  },

  // Generic
  info: (action: string, detail: string) => log('[API]', LOG_SEPARATOR.general, action, detail),
};
