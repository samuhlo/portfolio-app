/**
 * █ [SCRIPT] :: UPLOAD R2
 * =====================================================================
 * DESC:   Sube imágenes/assets al bucket Cloudflare R2 via S3-compatible
 *         API. Soporta archivo individual o directorio completo.
 *         Lee credenciales desde .env automáticamente.
 *
 * USAGE:
 *   # Archivo individual (r2-key es la ruta dentro del bucket)
 *   bun run assets:upload blog/mi-post/cover.webp ./local/cover.webp
 *
 *   # Directorio completo (sube todos los archivos con el prefijo dado)
 *   bun run assets:upload blog/mi-post/ ./local-images/
 *
 * EJEMPLOS:
 *   bun run assets:upload blog/anatomy-of-a-living-portfolio/cover.webp ./cover.webp
 *   bun run assets:upload blog/_shared/ ./shared-assets/
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

// =============================================================================
// █ CONSTANTS
// =============================================================================
const MIME_TYPES: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.pdf':  'application/pdf',
};

// [NOTE] Cache-Control largo — los assets son inmutables (se versiona via nombre de archivo)
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

// =============================================================================
// █ R2 CLIENT
// =============================================================================
const {
  CF_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} = process.env;

if (!CF_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error('[R2] Faltan variables de entorno. Comprueba .env');
  console.error('  Requeridas: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// =============================================================================
// █ HELPERS
// =============================================================================
function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

async function uploadFile(r2Key: string, localPath: string): Promise<void> {
  const body = readFileSync(localPath);
  const contentType = getMimeType(localPath);

  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    Body: body,
    ContentType: contentType,
    CacheControl: CACHE_CONTROL,
  }));

  const sizeKb = (body.byteLength / 1024).toFixed(1);
  console.log(`  ✓ ${r2Key} (${sizeKb} KB, ${contentType})`);
}

/** Recorre un directorio recursivamente y devuelve todos los archivos */
function walkDir(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// =============================================================================
// █ MAIN
// =============================================================================
const [r2Target, localSource] = process.argv.slice(2);

if (!r2Target || !localSource) {
  console.error('Uso: bun run assets:upload <r2-key-o-prefijo> <archivo-o-directorio>');
  console.error('');
  console.error('Ejemplos:');
  console.error('  bun run assets:upload blog/mi-post/cover.webp ./cover.webp');
  console.error('  bun run assets:upload blog/mi-post/ ./images/');
  process.exit(1);
}

const isDir = statSync(localSource).isDirectory();

if (isDir) {
  // [NOTE] Modo directorio: sube todos los archivos con el prefijo r2Target
  const files = walkDir(localSource);
  console.log(`[R2] Subiendo ${files.length} archivo(s) → ${R2_BUCKET_NAME}/${r2Target}`);

  const prefix = r2Target.endsWith('/') ? r2Target : `${r2Target}/`;

  for (const file of files) {
    const relativePath = file.replace(localSource.endsWith('/') ? localSource : `${localSource}/`, '');
    const r2Key = `${prefix}${relativePath}`;
    await uploadFile(r2Key, file);
  }
} else {
  // Modo archivo individual
  console.log(`[R2] Subiendo → ${R2_BUCKET_NAME}/${r2Target}`);
  await uploadFile(r2Target, localSource);
}

console.log('[R2] Subida completada.');
