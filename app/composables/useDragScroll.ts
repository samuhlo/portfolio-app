/**
 * ========================================================================
 * [COMPOSABLE] :: DRAG SCROLL
 * ========================================================================
 * DESC:   Click-and-drag para scroll horizontal en contenedores.
 *         Compatible con Lenis (maneja scrollLeft nativo).
 * STATUS: STABLE
 * ========================================================================
 */

/**
 * ◼️ USE DRAG SCROLL
 * ---------------------------------------------------------
 * Retorna bind/unbind para habilitar drag scroll en un contenedor.
 * Rastreo de posición: startX y scrollLeft se capturan en mousedown.
 * Movimiento: la diferencia X entre frames multiplica la velocidad.
 */
export function useDragScroll(containerRef: Ref<HTMLElement | null>) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  /**
   * Captura la posición inicial y el estado del scroll en mousedown.
   */
  function onMouseDown(e: MouseEvent) {
    const el = containerRef.value;
    if (!el) return;

    isDown = true;
    el.classList.add('active:cursor-grabbing');
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  }

  /**
   * Aplica movimiento: la diferencia de X multiplica por factor de velocidad.
   * [NOTE] Factor 1.5 → movimiento más rápido que el mouse (sensación de inercia).
   */
  function onMouseMove(e: MouseEvent) {
    if (!isDown) return;
    e.preventDefault();

    const el = containerRef.value;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  }

  /**
   * Finaliza el drag: flag isDown = false.
   */
  function onMouseUp() {
    isDown = false;
  }

  /**
   * Registra listeners: mousedown en contenedor, mousemove/up en window.
   */
  function bind() {
    const el = containerRef.value;
    if (!el) return;

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Desregistra todos los listeners.
   */
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
