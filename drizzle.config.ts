/**
 * ========================================================================
 * [CONFIG] :: DRIZZLE KIT
 * ========================================================================
 * DESC:   Configuración de drizzle-kit para migraciones y studio.
 * ========================================================================
 */
import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '',
  },
} satisfies Config;
