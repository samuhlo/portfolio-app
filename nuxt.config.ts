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
  // █ RUNTIME CONFIG
  // =========================================================================
  runtimeConfig: {
    // Server-only (subida programática de assets vía S3 SDK)
    cfAccountId: process.env.CF_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    // Public (disponible en cliente — solo la URL pública, nunca las keys)
    public: {
      assetsUrl: process.env.NUXT_PUBLIC_ASSETS_URL ?? 'https://assets.samuhlo.dev',
    },
  },

  // =========================================================================
  // █ NUXT IMAGE :: Cloudflare R2 via custom domain
  // =========================================================================
  image: {
    // [NOTE] Whitelist del dominio para que IPX pueda fetchear y optimizar
    domains: ['assets.samuhlo.dev'],
    // Alias: permite usar src="/blog/..." en lugar de la URL completa
    alias: {
      blog: 'https://assets.samuhlo.dev/blog',
    },
    format: ['avif', 'webp'],
    quality: 80,
  },

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