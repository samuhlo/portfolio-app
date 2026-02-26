<script setup lang="ts">
/**
 * █ [PAGE] :: INDEX
 * =====================================================================
 * DESC:   Landing page principal. Orquesta secciones (Hero, Bio, Playground).
 *         Transiciones y scroll se inicializan a nivel superior.
 * STATUS: STABLE
 * =====================================================================
 */

// =============================================================================
// █ SEO: Page-level meta
// =============================================================================
const SITE_URL = 'https://samuhlo.dev';

const title = 'Developer & Designer';

const description =
  'Samuel Lopez designs complex digital ecosystems and codes them from scratch. Building web architectures that are solid like concrete, but move like water. Clean code + controlled chaos.';

useSeoMeta({
  title,
  description,
  // ── Open Graph ──
  ogType: 'website',
  ogTitle: `Samuel Lopez _ ${title}`, // Variante con guion bajo para redes
  ogDescription: description,
  ogUrl: SITE_URL,
  ogSiteName: 'SamuhLo.sh', // Tu dominio conceptual
  ogLocale: 'en_US',
  ogImage: `${SITE_URL}/images/og-cover.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Samuel Lopez — Code, Design & Much More',
  // ── Twitter Card ──
  twitterCard: 'summary_large_image',
  twitterTitle: `Samuel Lopez _ ${title}`,
  twitterDescription: description,
  twitterImage: `${SITE_URL}/images/og-cover.png`,
  twitterImageAlt: 'Samuel Lopez — Code, Design & Much More',
});
</script>

<template>
  <div>
    <HeroSection />
    <BioSection />
    <PlaygroundSection />
  </div>
</template>
