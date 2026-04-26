<script setup lang="ts">
/**
 * ========================================================================
 * [UI_ATOM] :: BLOG COPY LINK
 * ========================================================================
 * DESC:   Botón aislado para copiar la URL del post con feedback visual.
 *         El check SVG se anima en el momento del click, sin preparar
 *         paths en el mount. Cada instancia tiene estado propio.
 * STATUS: STABLE
 * ========================================================================
 */

import { computed, nextTick, onUnmounted, ref } from 'vue';
import { useI18n } from '#imports';
import gsap from 'gsap';

const props = withDefaults(
  defineProps<{
    color: string;
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const { t } = useI18n();

const checkSvgRef = ref<SVGSVGElement | null>(null);
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

const rootClasses = computed(() =>
  props.compact
    ? 'flex items-center gap-1.5 mt-2 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left'
    : 'group flex items-center gap-2 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left',
);

const labelClasses = computed(() =>
  props.compact
    ? 'text-[0.55rem] font-mono uppercase tracking-[0.15em] opacity-45'
    : 'text-[0.6rem] font-mono uppercase tracking-[0.2em] opacity-45 group-hover:opacity-85 transition-opacity duration-200',
);

async function copyLink() {
  // Feedback inmediato, sin esperar al clipboard
  const svg = checkSvgRef.value;
  if (!svg) return;

  const path = svg.querySelector('path');
  if (!path) return;

  const length = path.getTotalLength();

  gsap.killTweensOf(svg);
  gsap.killTweensOf(path);
  gsap.set(svg, { opacity: 0 });
  gsap.set(path, {
    visibility: 'visible',
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  await nextTick();

  gsap
    .timeline()
    .to(svg, { opacity: 1, duration: 0.1 })
    .to(path, { strokeDashoffset: 0, duration: 0.2, ease: 'power2.out' }, '<')
    .to(svg, { opacity: 0, duration: 0.2, delay: 1.2 });

  // Clipboard después, no bloquea el feedback
  if (!import.meta.client) return;

  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {
    // NOISE KILL -> Clipboard puede fallar en algunos contextos
  }
}

onUnmounted(() => {
  if (copyTimer) clearTimeout(copyTimer);
  const svg = checkSvgRef.value;
  if (!svg) return;
  gsap.killTweensOf(svg);
  const path = svg.querySelector('path');
  if (path) gsap.killTweensOf(path);
});
</script>

<template>
  <button type="button" :class="rootClasses" :aria-label="t('blog.label_copy_link')" @click="copyLink">
    <span :class="labelClasses">
      {{ t('blog.label_copy_link') }}
    </span>
    <svg
      ref="checkSvgRef"
      viewBox="0 0 16 12"
      fill="none"
      class="w-3 h-auto opacity-0 pointer-events-none"
      :style="{ color }"
    >
      <path
        d="M1 6l4 4 9-9"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span aria-live="polite" class="sr-only">
      {{ copied ? t('blog.label_link_copied') : '' }}
    </span>
  </button>
</template>
