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
  modules: ['@pinia/nuxt'],
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
