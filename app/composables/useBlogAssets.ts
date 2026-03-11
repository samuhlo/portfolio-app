/**
 * █ [COMPOSABLE] :: BLOG ASSETS
 * =====================================================================
 * DESC:   Helper para construir URLs de assets del blog almacenados
 *         en Cloudflare R2 (custom domain: assets.samuhlo.dev).
 *         Estructura del bucket: blog/{slug}/{filename}
 *
 * USAGE:
 *   const { asset, cover } = useBlogAssets('anatomy-of-a-living-portfolio')
 *   cover                          → https://assets.samuhlo.dev/blog/{slug}/cover.webp
 *   asset('architecture.webp')     → https://assets.samuhlo.dev/blog/{slug}/architecture.webp
 *   shared('og-default.webp')      → https://assets.samuhlo.dev/blog/_shared/og-default.webp
 *
 * STATUS: STABLE
 * =====================================================================
 */

export const useBlogAssets = (slug: string) => {
  const { public: { assetsUrl } } = useRuntimeConfig();

  const base = `${assetsUrl}/blog`;

  return {
    /** URL de un asset específico del post */
    asset: (filename: string): string => `${base}/${slug}/${filename}`,
    /** Cover del post (convencion: cover.webp) */
    cover: `${base}/${slug}/cover.webp`,
    /** Assets compartidos entre posts (/_shared/) */
    shared: (filename: string): string => `${base}/_shared/${filename}`,
  };
};
