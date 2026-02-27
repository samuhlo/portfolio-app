import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  ssr: true,
  future: { compatibilityVersion: 4 },
  srcDir: 'app/',
  serverDir: 'server/',
  css: ['~/assets/styles/main.css'],
  vite: {
    plugins: [tailwindcss() as any],
  },
  modules: ['@pinia/nuxt', '@nuxt/image', '@nuxt/fonts'],
  fonts: {
    families: [{ name: 'Space Mono', provider: 'google' }],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  typescript: {
    strict: true,
  },

  // =========================================================================
  // █ SEO: Global head defaults
  // =========================================================================
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: '%s // SAMUHLO',
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      meta: [
        { name: 'author', content: 'Samuel Lopez (samuhlo)' },
        { name: 'theme-color', content: '#0C0011' },
      ],
    },
  },
});
