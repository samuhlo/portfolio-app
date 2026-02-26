<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: PROJECT MODAL
 * =====================================================================
 * DESC:   Modal superpuesto para mostrar detalles expandidos de un proyecto.
 *         Se abre/cierra en base al query ?project de la URL.
 *         Usa GSAP para animaciones y Lenis local para slider horizontal.
 *         Delega layouts a ModalDesktopLayout / ModalMobileLayout.
 * STATUS: STABLE
 * =====================================================================
 */
import gsap from 'gsap';
import Lenis from 'lenis';
import { useWindowSize, onKeyStroke } from '@vueuse/core';

// ---------------------------------------------------------------------------
// 1. Estado del Modal (source of truth: query param)
// ---------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

const isOpen = computed(() => !!route.query.project);
const currentProject = computed(() => route.query.project as string);

function closeModal() {
  const query = { ...route.query };
  delete query.project;
  router.push({ query });
}

onKeyStroke('Escape', () => {
  if (isOpen.value) closeModal();
});

// ---------------------------------------------------------------------------
// 2. Animación GSAP (Enter / Leave)
// ---------------------------------------------------------------------------
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

  // [FIX] Si los refs son null (edge case), llamar done() directamente
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

// ---------------------------------------------------------------------------
// 3. Lenis Local para Scroll Horizontal
// ---------------------------------------------------------------------------
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 1024);

interface ScrollExposed {
  scrollContainerRef: HTMLElement | null;
  scrollContentRef: HTMLElement | null;
}

const layoutRef = ref<ScrollExposed | null>(null);
let localLenis: Lenis | null = null;

// [NOTE] Ref intermedio para drag scroll — apunta al container expuesto por el layout
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

  // Vincular drag scroll al container expuesto
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

watch(isOpen, async (open) => {
  if (open) {
    await initLenis();
  } else {
    destroyLenis();
  }
});

// [NOTE] Re-init Lenis cuando cambia de layout (mobile <-> desktop) con modal abierto
watch(isMobile, async () => {
  if (isOpen.value) {
    await initLenis();
  }
});

onUnmounted(() => {
  destroyLenis();
  if (isOpen.value) $lenis?.start();
});

// ---------------------------------------------------------------------------
// 4. Datos
// ---------------------------------------------------------------------------
const images = [
  '/images/projects/tinyshow_main.webp',
  '/images/projects/tinyshowcaptures/tinyshow_1.webp',
  '/images/projects/tinyshowcaptures/tinyshow_3.webp',
  '/images/projects/tinyshowcaptures/tinyshow_4.webp',
  '/images/projects/tinyshowcaptures/tinyshow_5.webp',
];
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition @enter="onEnter" @leave="onLeave" :css="false">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-100 flex items-center justify-center pointer-events-auto"
        >
          <!-- Background Blur -->
          <div
            ref="bgRef"
            class="absolute inset-0 bg-background/50 backdrop-blur-md cursor-pointer"
            @click="closeModal"
          />

          <!--
            [FIX] Wrapper único con contentRef — GSAP siempre tiene un nodo
            real que animar, independientemente de qué layout esté montado.
          -->
          <div
            ref="contentRef"
            class="w-full bg-foreground text-background relative z-10 origin-center shadow-2xl py-16"
            :class="isMobile ? 'min-h-dvh' : 'h-[75vh]'"
          >
            <ModalDesktopLayout
              v-if="!isMobile"
              ref="layoutRef"
              :project-name="currentProject"
              :images="images"
              @close="closeModal"
            />

            <ModalMobileLayout
              v-else
              ref="layoutRef"
              :project-name="currentProject"
              :images="images"
              @close="closeModal"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
