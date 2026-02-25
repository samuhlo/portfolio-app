/**
 * █ [COMPOSABLE] :: USE DRAG SCROLL
 * =====================================================================
 * DESC:   Habilita click-and-drag para hacer scroll horizontal en un
 *         contenedor. Compatible con Lenis (opera sobre scrollLeft).
 * =====================================================================
 */

export function useDragScroll(containerRef: Ref<HTMLElement | null>) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  function onMouseDown(e: MouseEvent) {
    const el = containerRef.value;
    if (!el) return;

    isDown = true;
    el.classList.add('active:cursor-grabbing');
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDown) return;
    e.preventDefault();

    const el = containerRef.value;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // [NOTE] Multiplicador de velocidad
    el.scrollLeft = scrollLeft - walk;
  }

  function onMouseUp() {
    isDown = false;
  }

  function bind() {
    const el = containerRef.value;
    if (!el) return;

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function unbind() {
    const el = containerRef.value;
    if (el) {
      el.removeEventListener('mousedown', onMouseDown);
    }
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  return { bind, unbind };
}
