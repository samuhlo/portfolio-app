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
  modules: ['@pinia/nuxt', '@nuxt/image'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  typescript: {
    strict: true,
  },
});