/**
 * Utilidad compartida para limpieza de recursos Matter.js.
 * Evita duplicación entre useErrorPhysics y usePhysicsLetters.
 */
import { Engine, Runner, World } from 'matter-js';

interface MatterState {
  engine: Matter.Engine | null;
  runner: Matter.Runner | null;
  rafId: number | null;
}

/**
 * Destruye un motor Matter.js y sus recursos asociados de forma segura.
 * Cancela el rAF, detiene el Runner, limpia el World y el Engine.
 * Retorna el estado reseteado para reasignación.
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
