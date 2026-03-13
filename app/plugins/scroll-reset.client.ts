import { useHead } from '#app';

export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.afterEach((to, from) => {
    if (from.path !== to.path && !to.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      if (typeof (window as any).lenis !== 'undefined') {
        (window as any).lenis.scrollTo(0, { immediate: true });
      }
    }
  });
});
