/**
 * ========================================================================
 * [UTIL] :: MATTER ENGINE CLEANUP
 * ========================================================================
 * DESC:   Utilidad compartida para destruir y limpiar motores Matter.js.
 *         Reutilizada por useErrorPhysics y usePhysicsLetters.
 * STATUS: STABLE
 * ========================================================================
 */
import { Engine, Runner, World } from 'matter-js';

interface MatterState {
  engine: Matter.Engine | null;
  runner: Matter.Runner | null;
  rafId: number | null;
}

/**
 * ◼️ DESTROY MATTER ENGINE
 * ---------------------------------------------------------
 * Limpia un motor Matter.js de forma segura:
 * 1. Cancela rAF en ejecución
 * 2. Detiene el Runner (tick loop)
 * 3. Limpia el World (bodies, constraints)
 * 4. Limpia el Engine
 * Retorna estado reseteado para reasignación.
 *
 * [CRITICAL]: Evitar memory leaks en Canvas + Physics.
 */
export function destroyMatterEngine(state: MatterState): MatterState {
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
  }
  if (state.runner) {
    Runner.stop(state.runner);
  }
  if (state.engine) {
    World.clear(state.engine.world, false);
    Engine.clear(state.engine);
  }
  return { engine: null, runner: null, rafId: null };
}
