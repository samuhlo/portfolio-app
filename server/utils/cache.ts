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

  // FILTRAR KEYS DE PROYECTOS -> Matchea los nombres exactos de los handlers:
  //   "projects-list"   -> nitro:handlers:projects-list:...
  //   "project-detail"  -> nitro:handlers:project-detail:...
  const projectKeys = allKeys.filter(
    (key) => key.includes('projects-list') || key.includes('project-detail'),
  );

  console.log(`[CACHE] >> INVALIDATE_ALL :: total_keys: ${allKeys.length} | project_keys: ${projectKeys.length}`);

  for (const key of projectKeys) {
    await storage.removeItem(key);
    console.log(`[CACHE] ++ KEY_REMOVED   :: key: ${key}`);
  }

  console.log('[CACHE] ++ INVALIDATE_DONE :: all project caches cleared');
}

export async function invalidateProjectCache(projectId: string): Promise<void> {
  const storage = useStorage('cache');
  const key = `projects:${projectId}`;
  await storage.removeItem(key);
  console.log(`[CACHE] Removed cache key: ${key}`);
}
