import { onMounted, onUnmounted, type Ref } from 'vue';
import { Engine, Runner, Bodies, World, Body } from 'matter-js';

// =============================================================================
// █ CONSTANTS: FÍSICA
// =============================================================================
const FONT_WEIGHT = 900;
const BLOCK_RESTITUTION = 0.02; // Rebote denso y pesado
const BLOCK_FRICTION = 0.9;
const BLOCK_FRICTION_AIR = 0.002; // Casi sin resistencia al aire
const BLOCK_DENSITY = 0.3; // Muy pesado
const GRAVITY_Y = 2.5; // Gravedad fuerte para sensación de peso
const WALL_THICKNESS = 200;

export function useErrorPhysics(
  containerRef: Ref<HTMLElement | null>,
  canvasRef: Ref<HTMLCanvasElement | null>,
) {
  let engine: Matter.Engine | null = null;
  let runner: Matter.Runner | null = null;
  let rafId: number | null = null;
  let textBody: Matter.Body | null = null;

  const syncCanvasSize = (): void => {
    const container = containerRef.value;
    const canvas = canvasRef.value;
    if (!container || !canvas) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };

  const initPhysics = (): void => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const isMobile = W < 768;

    const fontFamily = '"Arial Black", "Impact", sans-serif';
    const text = '404';

    ctx.font = `${FONT_WEIGHT} 100px ${fontFamily}`;
    const baseWidth = ctx.measureText(text).width;

    // En móvil ocupa el 90% del ancho, en escritorio el 60%
    const targetTextWidth = isMobile ? W * 0.9 : W * 0.6;
    const fontSize = Math.floor((targetTextWidth / baseWidth) * 100);

    ctx.font = `${FONT_WEIGHT} ${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize * 0.8;

    engine = Engine.create({ gravity: { x: 0, y: GRAVITY_Y } });
    runner = Runner.create();

    // GROUND A MITAD DE PANTALLA -> el bloque se detiene ahí
    const groundY = H / 2 + textHeight / 2;

    World.add(engine.world, [
      Bodies.rectangle(W / 2, groundY + WALL_THICKNESS / 2, W * 2, WALL_THICKNESS, {
        isStatic: true,
      }),
      Bodies.rectangle(-WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 4, { isStatic: true }),
      Bodies.rectangle(W + WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 4, { isStatic: true }),
      // Techo para evitar que salga propulsado hacia arriba
      Bodies.rectangle(W / 2, -WALL_THICKNESS / 2, W * 2, WALL_THICKNESS, { isStatic: true }),
    ]);

    // Empezamos ligeramente dentro de la pantalla para evitar colisionar en el frame 0 con el techo
    const startY = Math.max(textHeight / 2, 50);

    textBody = Bodies.rectangle(W / 2, startY, textWidth * 0.92, textHeight, {
      restitution: BLOCK_RESTITUTION,
      friction: BLOCK_FRICTION,
      frictionAir: BLOCK_FRICTION_AIR,
      frictionStatic: 0.95,
      density: BLOCK_DENSITY,
    });

    // [NOTE] Rotación inicial muy sutil para que impacte con una esquina.
    // Se aumenta masivamente la inercia para que el rebote no lo voltee por completo.
    const initialAngle = (Math.random() - 0.5) * 0.15;
    Body.setAngle(textBody, initialAngle);
    Body.setAngularVelocity(textBody, (Math.random() - 0.5) * 0.02);
    Body.setInertia(textBody, textBody.inertia * 3); // Mayor resistencia a girar

    World.add(engine.world, textBody);
    Runner.run(runner, engine);

    const draw = (): void => {
      ctx.clearRect(0, 0, W, H);
      if (!textBody) return;

      ctx.font = `${FONT_WEIGHT} ${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = getComputedStyle(canvas).color || '#faf3f0';

      ctx.save();
      ctx.translate(textBody.position.x, textBody.position.y);
      ctx.rotate(textBody.angle);
      ctx.fillText(text, 0, 0);
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  };

  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  let prevCanvasWidth = 0;
  const RESIZE_DEBOUNCE_MS = 300;

  const handleResize = (): void => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!canvasRef.value || !containerRef.value) return;

      const newWidth = containerRef.value.clientWidth;
      if (newWidth === prevCanvasWidth) return;
      prevCanvasWidth = newWidth;

      destroyPhysics();
      syncCanvasSize();
      initPhysics();
    }, RESIZE_DEBOUNCE_MS);
  };

  const destroyPhysics = (): void => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (runner) {
      Runner.stop(runner);
      runner = null;
    }
    if (engine) {
      World.clear(engine.world, false);
      Engine.clear(engine);
      engine = null;
    }
    textBody = null;
  };

  onMounted(() => {
    syncCanvasSize();
    prevCanvasWidth = canvasRef.value?.width ?? 0;

    // [NOTE] Doble rAF para asegurar layout CSS calculado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        syncCanvasSize();
        prevCanvasWidth = canvasRef.value?.width ?? 0;
        initPhysics();
      });
    });

    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimer) clearTimeout(resizeTimer);
    destroyPhysics();
  });
}
