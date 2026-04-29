<script setup lang="ts">
/**
 * [LAYOUT] :: APP MOBILE MENU
 * =====================================================================
 * DESC:   Drawer móvil mínimo. Sin ruido visual. Sin competir con la marca.
 * STATUS: STABLE
 * =====================================================================
 */

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { SITE } from '~/config/site';
import { useGSAP } from '~/composables/useGSAP';
import { useLenis } from '~/composables/useLenis';

type LenisScrollEvent = {
  scroll: number;
  direction: number;
};

type NavItem = {
  label: string;
  to?: string;
  href?: string;
};

const router = useRouter();
const localePath = useLocalePath();
const { locale } = useI18n();
const { $lenis } = useNuxtApp() as { $lenis?: { on: Function; off: Function } };
const { gsap, initGSAP } = useGSAP();
const lenis = useLenis();
const { openGate, closeGate } = useMobileMenuNavigationGate();

const isOpen = ref(false);
const isAnimating = ref(false);
const isMounted = ref(false);
const prefersReducedMotion = ref(false);
const route = useRoute();

const isProjectModalOpen = computed(() => Boolean(route.query.project));

const menuButtonRef = ref<HTMLButtonElement | null>(null);
const backdropRef = ref<HTMLElement | null>(null);
const drawerRef = ref<HTMLElement | null>(null);

const navItems = computed<NavItem[]>(() => [
  { label: 'Home', to: localePath('/') },
  { label: 'Logs', to: localePath('/blog') },
  { label: 'Contact', href: `mailto:${SITE.email}` },
]);

let openTimeline: ReturnType<typeof gsap.timeline> | null = null;
let closeTimeline: ReturnType<typeof gsap.timeline> | null = null;
let showButtonTween: ReturnType<typeof gsap.fromTo> | null = null;
let mediaQueryList: MediaQueryList | null = null;
let cleanupLenis: (() => void) | null = null;
let previousBodyOverflow = '';

// =============================================================================
// [ACCESS] FOCO SIN FUGAS
// =============================================================================

const getFocusableElements = (): HTMLElement[] => {
  if (!drawerRef.value) return [];

  return Array.from(
    drawerRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
};

const focusFirstDrawerElement = (): void => {
  const [firstElement] = getFocusableElements();
  firstElement?.focus();
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (!isOpen.value) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements();
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) return;

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

// =============================================================================
// [FLOW] APERTURA / CIERRE
// =============================================================================

const lockScroll = (): void => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  lenis?.stop();
};

const unlockScroll = (): void => {
  document.body.style.overflow = previousBodyOverflow;
  lenis?.start();
};

const finishClose = (): void => {
  isOpen.value = false;
  isAnimating.value = false;
  unlockScroll();
  closeGate();
  menuButtonRef.value?.focus();
};

const openMenu = async (): Promise<void> => {
  if (isOpen.value || isAnimating.value) return;
  if (isProjectModalOpen.value) return;

  isOpen.value = true;
  isAnimating.value = true;
  lockScroll();
  showButtonTween?.play();

  await nextTick();

  if (prefersReducedMotion.value) {
    gsap.set([backdropRef.value, drawerRef.value], { autoAlpha: 1, xPercent: 0 });
    gsap.set('.mobile-menu-hit', { y: 0, autoAlpha: 1 });
    isAnimating.value = false;
    focusFirstDrawerElement();
    return;
  }

  openTimeline?.restart();
};

const closeMenu = (): void => {
  if (!isOpen.value || isAnimating.value) return;

  isAnimating.value = true;

  if (prefersReducedMotion.value) {
    finishClose();
    return;
  }

  closeTimeline?.restart();
};

const toggleMenu = (): void => {
  if (isAnimating.value) return;
  if (isProjectModalOpen.value) return;

  if (isOpen.value) {
    closeMenu();
    return;
  }

  void openMenu();
};

const handleNavClick = (to: string): void => {
  if (!isOpen.value || isAnimating.value) return;

  openGate();
  void router.push(to);
  closeMenu();
};

const handleExternalNavClick = (): void => {
  if (!isOpen.value || isAnimating.value) return;

  closeMenu();
};

const syncReducedMotion = (): void => {
  prefersReducedMotion.value = Boolean(mediaQueryList?.matches);
};

watch(isProjectModalOpen, (open) => {
  if (!open) return;
  if (isOpen.value && !isAnimating.value) closeMenu();
  showButtonTween?.reverse();
});

// =============================================================================
// [CORE] GSAP BUNKER
// =============================================================================

const buildTimelines = (): void => {
  if (!drawerRef.value || !backdropRef.value || !menuButtonRef.value) return;

  const animatedItems = drawerRef.value.querySelectorAll<HTMLElement>('.mobile-menu-hit');

  initGSAP(() => {
    gsap.set(backdropRef.value, { autoAlpha: 0 });
    gsap.set(drawerRef.value, { xPercent: 100, autoAlpha: 1 });
    gsap.set(animatedItems, { y: 30, autoAlpha: 0 });

    showButtonTween = gsap
      .fromTo(
        menuButtonRef.value,
        { yPercent: -160, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out', paused: true },
      )
      .progress(0);

    openTimeline = gsap
      .timeline({
        paused: true,
        onStart: () => {
          // [FLOW] Reabrir empieza limpio; sin esto el stagger hereda restos.
          gsap.set(animatedItems, { y: 30, autoAlpha: 0 });
        },
        onComplete: () => {
          isAnimating.value = false;
          focusFirstDrawerElement();
        },
      })
      .to(backdropRef.value, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .to(drawerRef.value, { xPercent: 0, duration: 0.4, ease: 'power3.out' }, 0)
      .to(
        animatedItems,
        { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.05, ease: 'power3.out' },
        0.15,
      );

    closeTimeline = gsap
      .timeline({ paused: true, onComplete: finishClose })
      .to(drawerRef.value, { xPercent: 100, duration: 0.34, ease: 'power3.in' }, 0)
      .to(backdropRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0);
  }, drawerRef.value);
};

const bindLenisVisibility = (): void => {
  const handler = ({ scroll, direction }: LenisScrollEvent): void => {
    if (isOpen.value || isProjectModalOpen.value) return;

    if (direction === 1 && scroll > 80) {
      showButtonTween?.reverse();
      return;
    }

    if (direction === -1) {
      showButtonTween?.play();
    }
  };

  $lenis?.on('scroll', handler);
  cleanupLenis = () => $lenis?.off('scroll', handler);
};

onMounted(() => {
  isMounted.value = true;
  mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
  syncReducedMotion();
  mediaQueryList.addEventListener('change', syncReducedMotion);

  buildTimelines();
  bindLenisVisibility();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  mediaQueryList?.removeEventListener('change', syncReducedMotion);
  document.removeEventListener('keydown', handleKeydown);
  cleanupLenis?.();
  openTimeline?.kill();
  closeTimeline?.kill();
  showButtonTween?.kill();

  if (isOpen.value) unlockScroll();
});

defineExpose({ openMenu, closeMenu, toggleMenu, isOpen });
</script>

<template>
  <Teleport to="body">
    <button
      v-show="isMounted && !isProjectModalOpen"
      ref="menuButtonRef"
      type="button"
      class="menu-trigger md:hidden"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      aria-controls="mobile-menu-drawer"
      :aria-label="isOpen ? 'Close menu' : 'Open menu'"
      @click="toggleMenu"
    >
      <span class="hamburger-bar" />
      <span class="hamburger-bar" />
      <span class="hamburger-bar" />
    </button>

    <div
      v-show="isOpen"
      ref="backdropRef"
      class="menu-backdrop"
      aria-hidden="true"
      @click="closeMenu"
    />

    <aside
      v-show="isOpen"
      id="mobile-menu-drawer"
      ref="drawerRef"
      class="menu-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      <nav class="drawer-nav" aria-label="Main navigation">
        <ol class="link-list">
          <li v-for="(item, index) in navItems" :key="`${locale}-${item.label}`" class="link-row">
            <span class="link-number">{{ String(index + 1).padStart(2, '0') }}</span>

            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="menu-link mobile-menu-hit"
              @click.prevent="handleNavClick(item.to)"
            >
              {{ item.label }}
            </NuxtLink>

            <a v-else :href="item.href" class="menu-link mobile-menu-hit" @click="handleExternalNavClick">
              {{ item.label }}
            </a>
          </li>
        </ol>
      </nav>
    </aside>
  </Teleport>
</template>

<style scoped>
/* ========================================================================== 
   [DESIGN] MENOS, PERO MEJOR
   ========================================================================== */

.menu-trigger {
  position: fixed;
  top: 1.35rem;
  right: 1.35rem;
  z-index: 1000;
  display: grid;
  width: 1.5rem;
  height: 1.125rem;
  padding: 0;
  color: var(--color-foreground, #0c0011);
  background: transparent;
  border: 0;
  cursor: pointer;
  will-change: transform, opacity;
}

.menu-trigger:focus-visible,
.menu-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 0.35rem;
}

.hamburger-bar {
  position: absolute;
  left: 0;
  display: block;
  width: 1.5rem;
  height: 2px;
  background: currentColor;
  transform-origin: 50% 50%;
  transition:
    transform 220ms ease,
    opacity 160ms ease;
}

.hamburger-bar:nth-child(1) {
  top: 0;
}

.hamburger-bar:nth-child(2) {
  top: 0.5rem;
}

.hamburger-bar:nth-child(3) {
  top: 1rem;
}

.menu-trigger.is-open .hamburger-bar:nth-child(1) {
  transform: translateY(0.5rem) rotate(45deg);
}

.menu-trigger.is-open .hamburger-bar:nth-child(2) {
  opacity: 0;
}

.menu-trigger.is-open .hamburger-bar:nth-child(3) {
  transform: translateY(-0.5rem) rotate(-45deg);
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: rgba(12, 0, 17, 0.14);
}

.menu-drawer {
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 999;
  display: flex;
  width: min(100vw, 30rem);
  min-height: 100dvh;
  flex-direction: column;
  justify-content: center;
  overflow: hidden auto;
  padding: clamp(1.5rem, 5vw, 2.5rem);
  color: var(--color-foreground, #0c0011);
  background: var(--color-background, #faf3f0);
  border-left: 1px solid color-mix(in srgb, var(--color-foreground, #0c0011) 14%, transparent);
  will-change: transform;
}

.drawer-nav {
  width: 100%;
}

.link-list {
  display: grid;
  gap: clamp(1.15rem, 4vw, 1.75rem);
  padding: 0;
  margin: 0;
  list-style: none;
}

.link-row {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  align-items: baseline;
  column-gap: 0.8rem;
}

.link-number {
  font-family: 'Silka Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--color-foreground, #0c0011) 34%, transparent);
  letter-spacing: 0.08em;
}

.menu-link {
  width: fit-content;
  max-width: 100%;
  font-family: 'Strawford', sans-serif;
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 900;
  line-height: 0.95;
  color: var(--color-foreground, #0c0011);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: -0.045em;
  transition:
    color 160ms ease,
    opacity 160ms ease;
}

.menu-link:hover {
  color: color-mix(in srgb, var(--color-foreground, #0c0011) 68%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .hamburger-bar,
  .menu-link {
    transition: none;
  }
}

@media (min-width: 768px) {
  .menu-trigger,
  .menu-backdrop,
  .menu-drawer {
    display: none !important;
  }
}
</style>
