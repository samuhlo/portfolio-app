<script setup lang="ts">
/**
 * █ [PAGE] :: INDEX
 * =====================================================================
 * DESC:   Landing page principal. Orquesta secciones (Hero, Bio, Playground).
 *         Transiciones y scroll se inicializan a nivel superior.
 * STATUS: STABLE
 * =====================================================================
 */

import { SITE } from '~/config/site';

// =============================================================================
// █ SEO: Page-level meta
// =============================================================================
const SITE_URL = SITE.url;

const title = 'Dev & Design';

const description =
  'Samuel López designs complex digital ecosystems and codes them from scratch. Building web architectures that are solid like concrete, but move like water. Clean code + Aggressive design.';

useSeoMeta({
  title,
  description,
  // ── Open Graph ──
  ogType: 'website',
  ogTitle: `Samuel López _ ${title}`, // Variante con guion bajo para redes
  ogDescription: description,
  ogUrl: SITE_URL,
  ogSiteName: 'SAMUHLO.sh', // Tu dominio conceptual
  ogLocale: 'en_US',
  ogImage: `${SITE_URL}/images/og-cover.png`,
  ogImageSecureUrl: `${SITE_URL}/images/og-cover.png`,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Samuel López — Code, Design & Much More',
  // ── Twitter Card ──
  twitterCard: 'summary_large_image',
  twitterTitle: `Samuel López _ ${title}`,
  twitterDescription: description,
  twitterImage: `${SITE_URL}/images/og-cover.png`,
  twitterImageAlt: 'Samuel López — Code, Design & Much More',
});
</script>

<template>
  <div>
    <HeroSection />
    <BioSection />
    <PlaygroundSection />
  </div>
</template>
