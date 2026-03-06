/**
 * ========================================================================
 * [DB] :: DRIZZLE CLIENT
 * ========================================================================
 * DESC:   Cliente singleton de Drizzle para Neon Serverless PostgreSQL.
 *         Usa el driver neon-http ideal para entornos serverless/edge.
 * ========================================================================
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const createDb = () => {
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('[DB] NEON_DATABASE_URL or DATABASE_URL is required');
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
};

const db =
  (globalThis as unknown as { _drizzle?: ReturnType<typeof createDb> })._drizzle ??
  ((globalThis as unknown as { _drizzle?: ReturnType<typeof createDb> })._drizzle = createDb());

export { db };
export type DB = typeof db;
