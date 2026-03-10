import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  ssr: true,
  future: { compatibilityVersion: 4 },
  srcDir: 'app/',
  // serverDir configurado por defecto en raíz
  css: ['~/assets/styles/main.css'],
  vite: {
    plugins: [tailwindcss() as any],
  },
  modules: ['@nuxt/image', '@nuxt/fonts', '@pinia/nuxt', '@nuxt/content'],

  // =========================================================================
  // █ NUXT CONTENT: Shiki syntax highlighting
  // =========================================================================
  content: {
    highlight: {
      // github-light: colores reales (keywords, strings, funciones) sobre fondo cream
      theme: 'github-light',
      langs: [
        'typescript', 'javascript', 'vue', 'html', 'css',
        'bash', 'shell', 'json', 'markdown', 'python', 'yaml',
      ],
    },
  },
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