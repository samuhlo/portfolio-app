<script setup lang="ts">
/**
 * █ [UI_MOLECULE] :: MODAL SCROLL INDICATORS
 * =====================================================================
 * DESC:   Flechas doodle que indican dirección de scroll disponible.
 *         Dibuja flecha izquierda si se puede scrollear a la izquierda,
 *         flecha derecha si se puede scrollear a la derecha.
 *         Usa useDoodleDraw para animación stroke-dash.
 * =====================================================================
 */
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

interface Props {
  scrollContainer: HTMLElement | null;
}

const props = defineProps<Props>();

// =============================================================================
// █ CORE: DOODLE DRAW SETUP
// =============================================================================
interface DoodleExposed {
  svg: SVGSVGElement | null;
}

const { preparePaths, addDrawAnimation } = useDoodleDraw();

const leftRef = ref<DoodleExposed | null>(null);
const rightRef = ref<DoodleExposed | null>(null);

let leftPaths: SVGPathElement[] = [];
let rightPaths: SVGPathElement[] = [];

const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// [NOTE] Margen en px para considerar que estás "al final"
const SCROLL_THRESHOLD = 10;

onMounted(() => {
  leftPaths = preparePaths(leftRef.value?.svg ?? null);
  rightPaths = preparePaths(rightRef.value?.svg ?? null);
});

// =============================================================================
// █ SCROLL DETECTION
// =============================================================================
function checkScroll() {
  const el = props.scrollContainer;
  if (!el) {
    canScrollLeft.value = false;
    canScrollRight.value = false;
    return;
  }

  const { scrollLeft, scrollWidth, clientWidth } = el;
  canScrollLeft.value = scrollLeft > SCROLL_THRESHOLD;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD;
}

// [NOTE] Observar scroll del container
let scrollHandler: (() => void) | null = null;

watch(
  () => props.scrollContainer,
  (el, oldEl) => {
    if (oldEl && scrollHandler) {
      oldEl.removeEventListener('scroll', scrollHandler);
    }
    if (el) {
      scrollHandler = checkScroll;
      el.addEventListener('scroll', scrollHandler, { passive: true });
      // Check inicial tras montar
      nextTick(checkScroll);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (props.scrollContainer && scrollHandler) {
    props.scrollContainer.removeEventListener('scroll', scrollHandler);
  }
});

// =============================================================================
// █ ANIMATION: DRAW / ERASE
// =============================================================================
function killAndReset(svg: SVGSVGElement | null, paths: SVGPathElement[]) {
  if (!svg || !paths.length) return;
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));
  gsap.set(svg, { opacity: 0 });
  paths.forEach((path) => {
    const length = path.getTotalLength() + 20;
    gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
  });
}

function drawArrow(svg: SVGSVGElement | null, paths: SVGPathElement[]) {
  if (!svg || !paths.length) return;
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));

  // Resetear antes de dibujar
  gsap.set(svg, { opacity: 0 });
  paths.forEach((path) => {
    const length = path.getTotalLength() + 20;
    gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
  });

  const tl = gsap.timeline();
  addDrawAnimation(tl, {
    svg,
    paths,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out',
  });
}

function eraseArrow(svg: SVGSVGElement | null, paths: SVGPathElement[]) {
  if (!svg || !paths.length) return;
  gsap.killTweensOf(svg);
  paths.forEach((p) => gsap.killTweensOf(p));

  gsap.to(svg, {
    opacity: 0,
    duration: 0.25,
    ease: 'power1.in',
    onComplete: () => {
      paths.forEach((path) => {
        const length = path.getTotalLength() + 20;
        gsap.set(path, { strokeDashoffset: length, visibility: 'hidden' });
      });
    },
  });
}

// [NOTE] Reaccionar a cambios de canScrollLeft / canScrollRight
watch(canScrollLeft, (can) => {
  const svg = leftRef.value?.svg ?? null;
  if (can) drawArrow(svg, leftPaths);
  else eraseArrow(svg, leftPaths);
});

watch(canScrollRight, (can) => {
  const svg = rightRef.value?.svg ?? null;
  if (can) drawArrow(svg, rightPaths);
  else eraseArrow(svg, rightPaths);
});

// =============================================================================
// █ INTERACTION: CLICK TO SCROLL
// =============================================================================
function doScrollLeft() {
  if (!props.scrollContainer || !canScrollLeft.value) return;
  const offset = window.innerWidth * 0.8;
  props.scrollContainer.scrollBy({ left: -offset, behavior: 'smooth' });
}

function doScrollRight() {
  if (!props.scrollContainer || !canScrollRight.value) return;
  const offset = window.innerWidth * 0.8;
  props.scrollContainer.scrollBy({ left: offset, behavior: 'smooth' });
}
</script>

<template>
  <div class="flex items-center gap-3 pointer-events-none">
    <DoodleArrowLeftGeneral
      ref="leftRef"
      class="w-20 h-auto opacity-0 transition-transform active:scale-95"
      :class="canScrollLeft ? 'pointer-events-auto cursor-pointer' : ''"
      @click="doScrollLeft"
    />
    <DoodleArrowRightGeneral
      ref="rightRef"
      class="w-20 h-auto opacity-0 transition-transform active:scale-95"
      :class="canScrollRight ? 'pointer-events-auto cursor-pointer' : ''"
      @click="doScrollRight"
    />
  </div>
</template>
