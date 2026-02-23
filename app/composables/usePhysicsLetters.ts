/**
 * █ [COMPOSABLE] :: PHYSICS LETTERS
 * =====================================================================
 * DESC:   Motor de físicas 2D (Matter.js) para letras interactivas (v.g. Contacto).
 * STATUS: STABLE
 * =====================================================================
 */
import { Engine, Runner, Bodies, World, Body } from 'matter-js'; // =============================================================================
// █ CONSTANTS: FÍSICA Y RENDER
// =============================================================================
const FONT_WEIGHT = 900;
const LETTER_RESTITUTION = 0.25; // -> Rebote de las letras
const LETTER_FRICTION = 0.9;
const LETTER_FRICTION_AIR = 0.015;
const WALL_THICKNESS = 200; // -> Grosor de los límites invisibles
const GROUND_BUFFER = 20; // -> Margen inferior para repeler el suelo

interface LetterMeasure {
  char: string;
  w: number;
  h: number;
}

interface LetterBody {
  body: Matter.Body;
  char: string;
}

interface PhysicsOptions {
  isMobile?: boolean;
}

const letterOpts = {
  restitution: LETTER_RESTITUTION,
  friction: LETTER_FRICTION,
  frictionAir: LETTER_FRICTION_AIR,
  frictionStatic: 0.9,
  density: 0.005,
};

export const usePhysicsLetters = () => {
  let engine: Matter.Engine | null = null;
  let runner: Matter.Runner | null = null;
  let rafId: number | null = null;
  let letterBodies: LetterBody[] = [];
  let isRunning = false;

  // =============================================================================
  // █ LÓGICA CORE: SPAWN Y RENDERING
  // =============================================================================

  /**
   * ◼️ MEASURE ROW
   * ---------------------------------------------------------
   * Mide el bounding box de cada caracter en el canvas usando el contexto actual.
   * -> Genera las dimensiones exactas para Matter.js Rectangle Bodies.
   */
  const measureRow = (
    ctx: CanvasRenderingContext2D,
    chars: string[],
    fontSize: number,
    fontFamily: string,
  ): LetterMeasure[] => {
    ctx.font = `${FONT_WEIGHT} ${fontSize}px ${fontFamily}`;
    return chars.map((char) => ({
      char,
      w: ctx.measureText(char).width,
      h: fontSize * 0.8,
    }));
  };

  /**
   * ◼️ SPAWN ROW
   * ---------------------------------------------------------
   * Genera los cuerpos físicos de una fila de letras.
   * Centra el texto calculando el totalWidth y lo distribuye.
   * -> Aplica velocidades iniciales aleatorias (rotación y traslación en X).
   */
  const spawnRow = (
    letters: LetterMeasure[],
    canvasW: number,
    baseSpawnY: number,
    staggerStep: number,
  ): LetterBody[] => {
    const totalW = letters.reduce((s, l) => s + l.w, 0);
    let cursorX = (canvasW - totalW) / 2;

    return letters.map((l, i) => {
      const x = cursorX + l.w / 2;
      cursorX += l.w;

      const spawnY = baseSpawnY - i * staggerStep;
      const body = Bodies.rectangle(x, spawnY, l.w * 0.88, l.h, letterOpts);

      Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 0 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

      World.add(engine!.world, body);
      return { body, char: l.char };
    });
  };

  const initPhysics = (
    canvas: HTMLCanvasElement,
    text: string,
    opts: PhysicsOptions = {},
  ): void => {
    if (isRunning) return;
    isRunning = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const isMobile = opts.isMobile ?? W < 768;

    // [NOTE] Móvil usa letras más grandes para llenar el ancho en 2 filas
    const fontSize = isMobile ? Math.round(W * 0.38) : Math.round(W * 0.21);
    const fontFamily = '"Arial Black", "Impact", sans-serif';
    const upperText = text.toUpperCase();

    engine = Engine.create({ gravity: { x: 0, y: 4.5 } });
    runner = Runner.create();

    const staticOpts = { isStatic: true };
    const groundY = H - GROUND_BUFFER;

    World.add(engine.world, [
      Bodies.rectangle(W / 2, groundY + WALL_THICKNESS / 2, W * 2, WALL_THICKNESS, staticOpts),
      Bodies.rectangle(-WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 4, staticOpts),
      Bodies.rectangle(W + WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 4, staticOpts),
    ]);

    if (isMobile) {
      // [NOTE] Math.floor(7/2)=3 → "CON" | "TACT"
      const splitAt = Math.floor(upperText.length / 2);
      const rowBottom = upperText.slice(splitAt).split(''); // TACT — cae primero
      const rowTop = upperText.slice(0, splitAt).split(''); // CON  — cae después

      const measBottom = measureRow(ctx, rowBottom, fontSize, fontFamily);
      const measTop = measureRow(ctx, rowTop, fontSize, fontFamily);

      // TACT: spawn justo encima del canvas — cae primero y se asienta
      const bottomBodies = spawnRow(measBottom, W, -(measBottom[0]!.h / 2), 70);

      // CON: spawn mucho más arriba para que TACT esté asentado cuando llegue
      const topSpawnY = -(measTop[0]!.h / 2 + rowBottom.length * 70 + fontSize * 2.5);
      const topBodies = spawnRow(measTop, W, topSpawnY, 70);

      letterBodies = [...bottomBodies, ...topBodies];
    } else {
      // — Desktop: fila única
      const letters = measureRow(ctx, upperText.split(''), fontSize, fontFamily);
      let cursorX = (W - letters.reduce((s, l) => s + l.w, 0)) / 2;

      letterBodies = letters.map((l, i) => {
        const x = cursorX + l.w / 2;
        cursorX += l.w;

        const body = Bodies.rectangle(x, -(l.h / 2 + i * 70), l.w * 0.88, l.h, letterOpts);
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 0 });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
        World.add(engine!.world, body);
        return { body, char: l.char };
      });
    }

    Runner.run(runner, engine);

    const draw = (): void => {
      ctx.clearRect(0, 0, W, H);
      ctx.font = `${FONT_WEIGHT} ${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = getComputedStyle(canvas).color || '#f5f0e8';

      for (const { body, char } of letterBodies) {
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  };

  const destroy = (): void => {
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
    letterBodies = [];
    isRunning = false;
  };

  return { initPhysics, destroy };
};
