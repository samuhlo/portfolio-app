<script setup lang="ts">
/**
 * █ [PAGE] :: INDEX
 * =====================================================================
 * DESC:   Landing page principal. Orquesta secciones (Hero, Bio, Playground).
 *         Transiciones y scroll se inicializan a nivel superior.
 *         BioSection y PlaygroundSection son client-only para performance móvil.
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
  ogType: 'website',
  ogTitle: `Samuel López _ ${title}`,
  ogDescription: description,
  ogUrl: SITE_URL,
  ogSiteName: 'SAMUHLO.sh',
  ogLocale: 'en_US',
  ogImage: `${SITE_URL}/images/og-cover.png`,
  ogImageSecureUrl: `${SITE_URL}/images/og-cover.png`,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Samuel López — Code, Design & Much More',
  twitterCard: 'summary_large_image',
  twitterTitle: `Samuel López _ ${title}`,
  twitterDescription: description,
  twitterImage: `${SITE_URL}/images/og-cover.png`,
  twitterImageAlt: 'Samuel López — Code, Design & Much More',
});
</script>

<template>
  <div>
    <LazyHeroSection />
    <ClientOnly>
      <LazyBioSection />
      <LazyPlaygroundSection />
    </ClientOnly>
  </div>
</template>
