/**
 * ========================================================================
 * [CACHE] :: NITRO STORAGE CACHE
 * ========================================================================
 * DESC:   Sistema de caché SWR con invalidación manual.
 *         Usa Nitro Storage para caching de endpoints.
 * ========================================================================
 */
export async function invalidateAllProjectCaches(): Promise<void> {
  const storage = useStorage('cache');
  const allKeys = await storage.getKeys();
  const projectKeys = allKeys.filter(
    (key) => key.includes('nitro:handlers:projects') || key.startsWith('projects:'),
  );

  console.log(`[CACHE] Found ${projectKeys.length} cache keys to invalidate`);

  for (const key of projectKeys) {
    await storage.removeItem(key);
    console.log(`[CACHE] Removed cache key: ${key}`);
  }

  console.log('[CACHE] All project caches invalidated');
}

export async function invalidateProjectCache(projectId: string): Promise<void> {
  const storage = useStorage('cache');
  const key = `projects:${projectId}`;
  await storage.removeItem(key);
  console.log(`[CACHE] Removed cache key: ${key}`);
}
