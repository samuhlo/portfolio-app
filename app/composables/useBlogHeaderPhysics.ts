/**
 * ========================================================================
 * [COMPOSABLE] :: BLOG HEADER PHYSICS
 * ========================================================================
 * DESC:   Motor físico 2D (Matter.js) para la animación cartoon del header.
 *         La "B" sale disparada hacia la izquierda y cae con gravedad
 *         tras ser "empujada" por "logs".
 * STATUS: STABLE
 * ========================================================================
 */
import { onUnmounted } from 'vue';
import { Engine, Runner, Bodies, World, Body } from 'matter-js';
import { destroyMatterEngine } from '~/utils/matter';

// =============================================================================
// █ CONSTANTS: FÍSICA
// =============================================================================
const GRAVITY_Y = 2;
const BLOCK_RESTITUTION = 0.15;
const BLOCK_FRICTION = 0.4;
const BLOCK_FRICTION_AIR = 0.001;
const BLOCK_DENSITY = 0.2;

/** Fuerza horizontal aplicada al impacto (hacia la izquierda) */
const IMPACT_FORCE_X = -0.08;
/** Fuerza vertical (ligera elevación antes de caer) */
const IMPACT_FORCE_Y = -0.04;
/** Velocidad angular inicial tras impacto */
const IMPACT_ANGULAR_VELOCITY = -0.15;

/** Margen fuera de pantalla para dejar de renderizar */
const OFF_SCREEN_MARGIN = 200;

interface BlogHeaderPhysicsOptions {
  /** Texto a renderizar en el canvas ("B") */
  text: string;
  /** Font CSS completo (e.g. "900 120px 'Strawford', sans-serif") */
  font: string;
  /** Posición X inicial de la "B" en el canvas */
  startX: number;
  /** Posición Y inicial de la "B" en el canvas */
  startY: number;
  /** Ancho estimado del carácter */
  charWidth: number;
  /** Alto estimado del carácter */
  charHeight: number;
}

/**
 * ◼️ USE BLOG HEADER PHYSICS
 * ---------------------------------------------------------
 * Lanza la "B" con Matter.js tras el impacto de "logs".
 * Renderiza la letra en un canvas con la misma tipografía que el h1.
 * Se auto-limpia cuando la "B" sale de pantalla o al desmontar.
 */
export function useBlogHeaderPhysics() {
  let engine: Matter.Engine | null = null;
  let runner: Matter.Runner | null = null;
  let rafId: number | null = null;
  let letterBody: Matter.Body | null = null;

  /**
   * Inicia la simulación de física para la letra.
   * Se invoca desde el onComplete del tween de impacto en GSAP.
   */
  const launch = (canvas: HTMLCanvasElement, options: BlogHeaderPhysicsOptions): void => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    engine = Engine.create({ gravity: { x: 0, y: GRAVITY_Y } });
    runner = Runner.create();

    // [NOTE] Sin paredes — la "B" debe caer libremente fuera de pantalla
    letterBody = Bodies.rectangle(
      options.startX,
      options.startY,
      options.charWidth * 0.9,
      options.charHeight * 0.85,
      {
        restitution: BLOCK_RESTITUTION,
        friction: BLOCK_FRICTION,
        frictionAir: BLOCK_FRICTION_AIR,
        density: BLOCK_DENSITY,
      },
    );

    World.add(engine.world, letterBody);
    Runner.run(runner, engine);

    // IMPACTO -> Aplicar fuerza + rotación
    Body.applyForce(letterBody, letterBody.position, {
      x: IMPACT_FORCE_X,
      y: IMPACT_FORCE_Y,
    });
    Body.setAngularVelocity(letterBody, IMPACT_ANGULAR_VELOCITY);

    const draw = (): void => {
      ctx.clearRect(0, 0, W, H);
      if (!letterBody) return;

      const { x, y } = letterBody.position;

      // STOP -> La letra ha salido de pantalla completamente
      if (y > H + OFF_SCREEN_MARGIN || x < -OFF_SCREEN_MARGIN || x > W + OFF_SCREEN_MARGIN) {
        destroy();
        return;
      }

      ctx.font = options.font;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = getComputedStyle(canvas).color;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(letterBody.angle);
      // [NOTE] Offset para centrar el texto respecto al body
      ctx.fillText(options.text, -options.charWidth / 2, -options.charHeight / 2);
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  };

  const destroy = (): void => {
    const reset = destroyMatterEngine({ engine, runner, rafId });
    engine = reset.engine;
    runner = reset.runner;
    rafId = reset.rafId;
    letterBody = null;
  };

  onUnmounted(destroy);

  return { launch, destroy };
}
