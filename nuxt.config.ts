import tailwindcss from '@tailwindcss/vite';
import { SITE } from './app/config/site';

const NODE_MAJOR = Number(process.versions.node.split('.')[0] ?? '0');
const SQLITE_CONNECTOR = NODE_MAJOR >= 22 ? 'native' : 'better-sqlite3';

export default defineNuxtConfig({
  compatibilityDate: '2026-03-13',
  ssr: true,
  future: { compatibilityVersion: 4 },
  srcDir: 'app/',
  css: ['~/assets/styles/main.css'],
  features: {
    inlineStyles: false,
  },

  vite: {
    plugins: [tailwindcss() as any],
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          pure_funcs: ['console.warn', 'console.error', 'console.info', 'console.debug'],
          drop_debugger: true,
        },
      },
    },
    css: {
      devSourcemap: true,
    },
  },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxt/content',
    '@nuxtjs/sitemap',
    '@vercel/analytics',
  ],

  sitemap: {
    // URLs dinámicas de posts (Nuxt Content) para incluir artículos en sitemap
    sources: ['/api/__sitemap__/blog'],
  },

  // =========================================================================
  // █ I18N: Blog locale routing
  // =========================================================================
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'es',
    baseUrl: SITE.url,
    detectBrowserLanguage: false,
    locales: [
      { code: 'es', language: 'es-ES', name: 'Castellano', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'gl', language: 'gl-ES', name: 'Galego', file: 'gl.json' },
    ],
    bundle: { compositionOnly: true },
    langDir: 'locales',
  },

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
    database: {
      type: 'sqlite',
      // [FIX SSR][SERVERLESS]
      // En runtimes serverless el filesystem del bundle es de solo lectura.
      // Nuxt Content necesita una ruta escribible para montar/actualizar su SQLite.
      // /tmp es la ruta estándar escribible en Vercel/Lambda.
      filename: process.env.CONTENT_DB_PATH ?? '/tmp/contents.sqlite',
    },
    experimental: {
      // Nuxt Content v3.6+: mejor fijar conector explícito.
      // En Node >=22 priorizamos `native` para evitar problemas de binarios nativos.
      sqliteConnector: SQLITE_CONNECTOR,
    },
    build: {
      markdown: {
        highlight: {
          // one-light: colores reales en todos los lenguajes incluido JS plano
          theme: 'snazzy-light',
          langs: [
            'typescript',
            'javascript',
            'vue',
            'html',
            'css',
            'bash',
            'shell',
            'json',
            'markdown',
            'python',
            'yaml',
          ],
        },
      },
    },
  },
  fonts: {
    families: [{ name: 'Fira Code', provider: 'google' }],
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
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: '%s // SAMUHLO',
      link: [
        { rel: 'preconnect', href: 'https://assets.samuhlo.dev', crossorigin: 'anonymous' },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: 'https://assets.samuhlo.dev/fonts/Strawford-Regular.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: 'https://assets.samuhlo.dev/fonts/Strawford-Medium.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: 'https://assets.samuhlo.dev/fonts/Strawford-Bold.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: 'https://assets.samuhlo.dev/fonts/Strawford-Black.woff2',
          crossorigin: 'anonymous',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'author', content: 'Samuel Lopez (samuhlo)' },
        { name: 'theme-color', content: '#0C0011' },
      ],
    },
  },
});
