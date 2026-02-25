import type { Ref } from 'vue';

/**
 * █ [COMPOSABLE] :: USE CURSOR LABEL
 * =====================================================================
 * DESC:   Lógica reutilizable para un label que sigue al cursor con
 *         retraso (lerp via requestAnimationFrame).
 *         Devuelve refs y handlers para conectar al template.
 * STATUS: STABLE
 * =====================================================================
 */

interface UseCursorLabelOptions {
  /** Factor de interpolación: 0.05 (lento) → 0.3 (rápido) */
  lerp?: number;
  /** Offset X del label respecto al cursor (px) */
  offsetX?: number;
  /** Offset Y del label respecto al cursor (px) */
  offsetY?: number;
}

export function useCursorLabel(options: UseCursorLabelOptions = {}) {
  const { lerp = 0.12, offsetX = 16, offsetY = 12 } = options;

  const containerRef = ref<HTMLElement | null>(null);
  const labelRef = ref<HTMLElement | null>(null);
  const isHovering = ref(false);

  // Posición real del cursor (target)
  let targetX = 0;
  let targetY = 0;
  // Posición interpolada actual
  let currentX = 0;
  let currentY = 0;
  let rafId: number | null = null;

  function onMouseMove(event: MouseEvent) {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    targetX = event.clientX - rect.left + offsetX;
    targetY = event.clientY - rect.top + offsetY;
  }

  function animate() {
    // [NOTE] Lerp: acerca currentX/Y al target un % cada frame → movimiento suave
    currentX += (targetX - currentX) * lerp;
    currentY += (targetY - currentY) * lerp;

    if (labelRef.value) {
      labelRef.value.style.transform = `translate(${currentX}px, ${currentY}px) scale(${isHovering.value ? 1 : 0.8})`;
    }

    rafId = requestAnimationFrame(animate);
  }

  function onMouseEnter(event: MouseEvent) {
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect();
      // [NOTE] Snap inicial al cursor para evitar animación desde (0,0)
      currentX = event.clientX - rect.left + offsetX;
      currentY = event.clientY - rect.top + offsetY;
      targetX = currentX;
      targetY = currentY;
    }
    isHovering.value = true;
    rafId = requestAnimationFrame(animate);
  }

  function onMouseLeave() {
    isHovering.value = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // [NOTE] Cleanup al desmontar el componente
  onBeforeUnmount(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  return {
    containerRef,
    labelRef,
    isHovering,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  };
}
