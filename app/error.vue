<script setup lang="ts">
/**
 * █ [FEATURE] :: ERROR PAGE
 * =====================================================================
 * DESC:   Página de error 404. Bloque "404" cae con Matter.js hasta
 *         mitad de pantalla, se dibuja DoodleWorking404General al
 *         estabilizarse, y botón "back" con RandomDoodleHover.
 * STATUS: STABLE
 * =====================================================================
 */
import type { NuxtError } from '#app';
import { ref, onMounted, onUnmounted } from 'vue';
import { Engine, Runner, Bodies, World, Body } from 'matter-js';
import gsap from 'gsap';
import { useDoodleDraw } from '~/composables/useDoodleDraw';

const props = defineProps({
  error: Object as () => NuxtError,
});

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

/** Umbral de velocidad para considerar el body en reposo */
const SETTLE_SPEED_THRESHOLD = 0.15;
/** Frames consecutivos bajo el umbral para confirmar reposo */
const SETTLE_FRAME_COUNT = 45;

// =============================================================================
// █ CONSTANTS: POSICIONAMIENTO (ajustables en "em")
// =============================================================================
/** Offset X/Y del doodle respecto al centro del bloque (em) */
const DOODLE_OFFSET_X = 0;
const DOODLE_OFFSET_Y = 4;
/** Ancho del doodle wrapper en mobile / desktop (em) */
const DOODLE_WIDTH_MOBILE = 17.5;
const DOODLE_WIDTH_DESKTOP = 25;
/** Distancia del botón back debajo del bloque (em) */
const BACK_BUTTON_GAP = 7.5;

// =============================================================================
// █ REFS Y STATE
// =============================================================================
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const doodleRef = ref<{ svg: SVGSVGElement | null } | null>(null);
const doodleWrapperRef = ref<HTMLElement | null>(null);
const backButtonRef = ref<HTMLElement | null>(null);
const isSettled = ref(false);

const { preparePaths, addDrawAnimation } = useDoodleDraw();

let engine: Matter.Engine | null = null;
let runner: Matter.Runner | null = null;
let rafId: number | null = null;
let textBody: Matter.Body | null = null;
let settleCounter = 0;
let doodleTimeline: gsap.core.Timeline | null = null;

// =============================================================================
// █ CORE: PHYSICS
// =============================================================================

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

  const fontSize = isMobile ? Math.round(W * 0.28) : Math.round(W * 0.18);
  const fontFamily = '"Arial Black", "Impact", sans-serif';
  const text = '404';

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
  ]);

  textBody = Bodies.rectangle(W / 2, -textHeight, textWidth * 0.92, textHeight, {
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

  settleCounter = 0;

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

    // DETECCIÓN DE REPOSO -> cuando la velocidad es baja N frames seguidos
    if (!isSettled.value && textBody.speed < SETTLE_SPEED_THRESHOLD) {
      settleCounter++;
      if (settleCounter >= SETTLE_FRAME_COUNT) {
        isSettled.value = true;
        onBlockSettled();
      }
    } else if (!isSettled.value) {
      settleCounter = 0;
    }

    rafId = requestAnimationFrame(draw);
  };

  rafId = requestAnimationFrame(draw);
};

// =============================================================================
// █ DOODLE DRAW: POST-REPOSO
// =============================================================================

const onBlockSettled = (): void => {
  if (!textBody) return;

  const cx = textBody.position.x;
  const cy = textBody.position.y;
  const angle = textBody.angle;

  // POSICIONAR doodle sobre el bloque 404
  if (doodleWrapperRef.value) {
    const wrapper = doodleWrapperRef.value;
    wrapper.style.left = `calc(${cx}px + ${DOODLE_OFFSET_X}em)`;
    wrapper.style.top = `calc(${cy}px + ${DOODLE_OFFSET_Y}em)`;
    wrapper.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
  }

  // POSICIONAR botón back debajo del bloque
  if (backButtonRef.value) {
    backButtonRef.value.style.left = `${cx}px`;
    backButtonRef.value.style.top = `calc(${cy}px + ${BACK_BUTTON_GAP}em)`;
    backButtonRef.value.style.transform = 'translate(-50%, 0)';
    backButtonRef.value.style.opacity = '1';
  }

  if (doodleTimeline) {
    doodleTimeline.play();
  }
};

// =============================================================================
// █ NAVIGATION
// =============================================================================
const handleBack = (): void => {
  clearError({ redirect: '/' });
};

// =============================================================================
// █ LIFECYCLE
// =============================================================================
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
    isSettled.value = false;
    settleCounter = 0;
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

  // PREPARAR DOODLE -> paths listos antes de que caiga el bloque
  if (doodleRef.value?.svg) {
    const paths = preparePaths(doodleRef.value.svg);
    doodleTimeline = gsap.timeline({ paused: true });
    addDrawAnimation(doodleTimeline, {
      svg: doodleRef.value.svg,
      paths,
      duration: 0.8,
      stagger: 0.02,
      ease: 'power2.out',
    });
  }

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
  if (doodleTimeline) {
    doodleTimeline.kill();
    doodleTimeline = null;
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full h-screen bg-background text-foreground overflow-hidden"
  >
    <!-- Canvas: mundo físico del bloque 404 -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
      style="color: var(--color-foreground, #0c0011)"
    />

    <!-- Doodle "working" dibujado sobre el 404 al estabilizarse -->
    <div
      ref="doodleWrapperRef"
      class="absolute pointer-events-none md:w-(--w-desktop)"
      :style="{
        '--w-mobile': `${DOODLE_WIDTH_MOBILE}em`,
        '--w-desktop': `${DOODLE_WIDTH_DESKTOP}em`,
        width: 'var(--w-mobile)',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }"
    >
      <DoodleWorking404General ref="doodleRef" class="w-full opacity-0" />
    </div>

    <!-- Botón back: posicionado dinámicamente debajo del bloque 404 -->
    <div
      ref="backButtonRef"
      class="absolute z-10 opacity-0 transition-opacity duration-500"
      style="left: 50%; top: 60%; transform: translate(-50%, 0)"
    >
      <RandomDoodleHover>
        <button
          class="text-foreground font-bold tracking-widest text-xl md:text-3xl cursor-pointer"
          @click="handleBack"
        >
          back
        </button>
      </RandomDoodleHover>
    </div>
  </div>
</template>
