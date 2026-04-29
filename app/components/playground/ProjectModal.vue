<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: PROJECT MODAL
 * =====================================================================
 * DESC:   Modal superpuesto para mostrar detalles expandidos de un proyecto.
 *         Se abre/cierra en base al query ?project de la URL.
 *         Usa GSAP para animaciones y Lenis local para slider horizontal.
 *         Delega layouts a ModalDesktopLayout / ModalMobileLayout.
 * USAGE:  Se abre automáticamente al hacer click en ProjectCard (?project=slug)
 * STATUS: STABLE
 * =====================================================================
 */
import gsap from 'gsap';
import Lenis from 'lenis';
import { useWindowSize, onKeyStroke } from '@vueuse/core';
import { BREAKPOINTS } from '~/config/site';
import { storeToRefs } from 'pinia';
import { useNoisePause } from '~/composables/useNoisePause';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const { selectedProject, isLoading: projectLoading } = storeToRefs(projectsStore);
const { pause: pauseNoise, resume: resumeNoise } = useNoisePause();

const isOpen = computed(() => !!route.query.project);
const currentProjectSlug = computed(() => route.query.project as string);

onMounted(async () => {
  if (currentProjectSlug.value && isOpen.value) {
    await projectsStore.fetchProjectBySlug(currentProjectSlug.value);
  }
});

watch(currentProjectSlug, async (newSlug) => {
  if (newSlug && isOpen.value) {
    await projectsStore.fetchProjectBySlug(newSlug);
  }
});

watch(isOpen, async (open) => {
  if (!open) {
    projectsStore.clearSelectedProject();
    resumeNoise();
  } else {
    pauseNoise();
  }
});

function closeModal() {
  const query = { ...route.query };
  delete query.project;
  router.push({ query });
}

onKeyStroke('Escape', () => {
  if (isOpen.value) closeModal();
});

// =============================================================================
// █ 2. Animación GSAP (Enter / Leave)
// =============================================================================
const { $lenis } = useNuxtApp();
const bgRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

function onEnter(_el: Element, done: () => void) {
  $lenis?.stop();

  const bg = bgRef.value;
  const content = contentRef.value;

  gsap.set(bg, { opacity: 0 });
  gsap.set(content, { y: 200, opacity: 0, scale: 0.95 });

  const tl = gsap.timeline({ onComplete: done });

  tl.to(bg, {
    opacity: 1,
    duration: 0.5,
    ease: 'power3.out',
  }).to(
    content,
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'expo.out',
    },
    '<0.1',
  );
}

function onLeave(_el: Element, done: () => void) {
  const bg = bgRef.value;
  const content = contentRef.value;

  if (!bg || !content) {
    $lenis?.start();
    done();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      $lenis?.start();
      done();
    },
  });

  tl.to(content, {
    y: 60,
    opacity: 0,
    scale: 0.97,
    duration: 0.7,
    ease: 'power2.inOut',
  }).to(
    bg,
    {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    },
    '<0.25',
  );
}

// =============================================================================
// █ 3. Lenis Local para Scroll Horizontal
// =============================================================================
const { width } = useWindowSize();
const isMobile = computed(() => width.value < BREAKPOINTS.tablet);

interface ScrollExposed {
  scrollContainerRef: HTMLElement | null;
  scrollContentRef: HTMLElement | null;
}

const layoutRef = ref<ScrollExposed | null>(null);
let localLenis: Lenis | null = null;

const dragTargetRef = ref<HTMLElement | null>(null);
const { bind: bindDrag, unbind: unbindDrag } = useDragScroll(dragTargetRef);

const gsapTickerFn = (time: number) => {
  localLenis?.raf(time * 1000);
};

function destroyLenis() {
  unbindDrag();
  if (localLenis) {
    gsap.ticker.remove(gsapTickerFn);
    localLenis.destroy();
    localLenis = null;
  }
}

async function initLenis() {
  destroyLenis();
  await nextTick();

  const container = layoutRef.value?.scrollContainerRef;
  const content = layoutRef.value?.scrollContentRef;
  if (!container || !content) return;

  dragTargetRef.value = container;
  bindDrag();

  localLenis = new Lenis({
    wrapper: container,
    content: content,
    orientation: 'horizontal',
    eventsTarget: container,
    gestureOrientation: 'both',
    smoothWheel: true,
    lerp: 0.08,
    autoRaf: false,
  });

  gsap.ticker.add(gsapTickerFn);
}

// [FIX] Bug: initLenis se ejecutaba antes de que el layout se renderice porque hay estado de loading.
// El layout (ModalDesktopLayout/ModalMobileLayout) solo se monta cuando selectedProject tiene datos.
// Por eso necesitamos esperar a que projectLoading sea false antes de iniciar Lenis.
watch(isOpen, async (open) => {
  if (open) {
    if (projectLoading.value) {
      const stopWatching = watch(projectLoading, async (loading) => {
        if (!loading) {
          stopWatching();
          await nextTick();
          await initLenis();
        }
      });
    } else {
      await nextTick();
      await initLenis();
    }
  } else {
    destroyLenis();
  }
});

watch(isMobile, async () => {
  if (isOpen.value && !projectLoading.value) {
    await nextTick();
    await initLenis();
  }
});

onUnmounted(() => {
  destroyLenis();
  if (isOpen.value) $lenis?.start();
});

// =============================================================================
// █ 4. Datos del proyecto
// =============================================================================
const images = computed<string[]>(() => {
  if (!selectedProject.value?.imagesUrl || selectedProject.value.imagesUrl.length === 0) {
    if (selectedProject.value?.mainImgUrl) {
      return [selectedProject.value.mainImgUrl];
    }
    return ['/images/projects/tinyshow_main.webp'];
  }
  return selectedProject.value.imagesUrl;
});

const projectTitle = computed(
  () => selectedProject.value?.title || currentProjectSlug.value || 'Project',
);

const projectYear = computed(() => selectedProject.value?.year || new Date().getFullYear());
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition @enter="onEnter" @leave="onLeave" :css="false">
        <div v-if="isOpen" class="fixed inset-0 z-100 pointer-events-auto">
          <!-- Background Blur -->
          <div
            ref="bgRef"
            class="absolute inset-0 bg-background/50 backdrop-blur-md cursor-pointer"
            @click="closeModal"
          />

          <!-- Scrollable Wrapper for Modal Content -->
          <div
            class="absolute inset-0 w-full h-full flex justify-center"
            :class="isMobile ? 'overflow-y-auto items-start' : 'items-center'"
          >
            <div
              ref="contentRef"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-project-title"
              class="w-full bg-foreground text-background relative z-10 origin-center shadow-2xl"
              :class="isMobile ? 'min-h-dvh h-auto pb-12' : 'h-[75vh] py-16'"
            >
              <!-- Loading State -->
              <div v-if="projectLoading" class="flex items-center justify-center h-full">
                <p class="font-mono text-sm opacity-60">Loading project...</p>
              </div>

              <!-- Project Content -->
              <template v-else-if="selectedProject">
                <ModalDesktopLayout
                  v-if="!isMobile"
                  ref="layoutRef"
                  :project-name="projectTitle"
                  :project-year="projectYear"
                  :images="images"
                  @close="closeModal"
                />

                <ModalMobileLayout
                  v-else
                  ref="layoutRef"
                  :project-name="projectTitle"
                  :project-year="projectYear"
                  :images="images"
                  @close="closeModal"
                />
              </template>

              <!-- Error State -->
              <div v-else class="flex items-center justify-center h-full">
                <p class="font-mono text-sm text-red-500">Project not found</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
