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
const title = 'Dev & Design';

const description =
  'Samuel López designs complex digital ecosystems and codes them from scratch. Building web architectures that are solid like concrete, but move like water. Clean code + Aggressive design.';

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogTitle: `${SITE.author} _ ${title}`,
  ogDescription: description,
  ogUrl: SITE.url,
  ogSiteName: SITE.name,
  ogLocale: 'en_US',
  ogImage: `${SITE.url}/images/og-image.png`,
  ogImageSecureUrl: `${SITE.url}/images/og-image.png`,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: `${SITE.author} — Code, Design & Much More`,
  twitterCard: 'summary_large_image',
  twitterTitle: `${SITE.author} _ ${title}`,
  twitterDescription: description,
  twitterImage: `${SITE.url}/images/og-image.png`,
  twitterImageAlt: `${SITE.author} — Code, Design & Much More`,
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
