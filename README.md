<div align="center">
  <br />
  <h1><code>./PORTFOLIO.sh</code></h1>

**[Ecosistema interactivo fusionando fluidez GSAP y físicas reales ]**
<br />

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-FFCA40?style=for-the-badge&logo=vercel&logoColor=black)](https://samuhlo.com)
[![Status](https://img.shields.io/badge/STATUS-PRODUCTION-0C0011?style=for-the-badge)](https://github.com/samuhlo/portfolio-app)

  <br />
</div>

---

## // 00\_ THE_MISSION

Portfolio personal construido como un ejercicio de ingeniería de animación sobre Nuxt 3. El objetivo era conseguir scroll-linked animations complejas (pinned sections, SVG draw-on-scroll, simulación de físicas 2D) manteniendo tres restricciones: SSR funcional, 60 FPS estables en móvil, y una arquitectura de composables que permita escalar sin acoplar lógica de animación a los componentes de vista.

> _Note: Toda la lógica de animación vive aislada en composables puros (`useGSAP`, `usePinnedScroll`, `usePhysicsLetters`). Los componentes `.vue` solo declaran qué animar, nunca cómo. Si se elimina un módulo, el resto no se rompe._

---

## // 01\_ THE_BLUEPRINT (ARCHITECTURE)

| LAYER      | TECH        | IMPLEMENTATION DETAIL                           |
| :--------- | :---------- | :---------------------------------------------- |
| **Core**   | `Nuxt 3`    | SSR con Vue Composition API pura.               |
| **Motion** | `GSAP`      | Instanciado solo cliente + ScrollTrigger        |
| **Smooth** | `Lenis`     | AutoRaf apagado, inyectado en el ticker de GSAP |
| **Physic** | `Matter.js` | Render loop en Canvas atado a IntersectionObs.  |
| **Styles** | `Tailwind`  | Config v4 estricta, utility-first sin CSS roto. |

---

## // 02\_ CONTROLLED_CHAOS (KEY FEATURES)

- **Simulaciones de Gravedad Laziloaded:** La sección de contacto no es CSS. Es Canvas 2D renderizando coordenadas inyectadas por Matter.js. Dinámico, calcula los cuerpos midiendo los glyphs tipográficos y solo inicia su bucle de recursos cuando entra al 20% del Viewport.
- **Scroll Animado Monolítico Unilateral:** Un header y claims (Hero/Bio) que se descomponen con Scrubbing de scroll, reteniendo el avance (completed[]) para no deshacer la animación en el scroll inverso.
- **Microinteracciones SVG Coreografiadas:** Doodles en líneas (dashArray/Offset) instanciados en un timeline central que se nutre vía el composable arquitectónico `useDoodleDraw`.

---

## // 03\_ CORE_LOGIC (SNIPPET)

El puente entre memoria, CPU y GPU. Aislando el motor de gravedad para no sangrar el `RequestAnimationFrame` general del Nuxt ni colisionar con Lenis:

```typescript
// app/composables/usePhysicsLetters.ts
// EXECUTING COMPLEX LOGIC...

const draw = (): void => {
  if (!isRunning || !engine) return;

  const canvasW = canvasRef.value!.width;
  // Clear full Canvas previo
  ctx.clearRect(0, 0, canvasW, canvasRef.value!.height);

  // Dibujando con coordenadas atadas al Physics Engine
  for (const item of letterBodies) {
    const { position, angle } = item.body;
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);
    ctx.fillText(item.char, 0, 0);
    ctx.restore();
  }
  rafId = requestAnimationFrame(draw);
};

const destroy = (): void => {
  cancelAnimationFrame(rafId);
  Runner.stop(runner); // Matar proceso lógico Matter
  World.clear(engine.world, false); // Limpiar heap
  letterBodies = [];
};
```

---

## // 04\_ ROADMAP

**001 — Blog Personal**

Sección de blog integrada en el portfolio para documentar avances semanales, decisiones técnicas y experimentos. Renderizado desde base de datos con soporte Markdown.

**002 — Pipeline de Proyectos (GitHub → AI → DB → Front)**

Ingesta automatizada de repositorios. Al subir un proyecto a GitHub, un webhook dispara un pipeline que analiza el repo con IA, valida la estructura resultante con Zod y persiste los datos en base de datos. El front los consume y renderiza dinámicamente en la sección Playground. Arquitectura similar a [TinyShow](https://github.com/samuhlo/tiny-showcase).

**003 — Automatización del Blog (Doc → AI → DB → Web)**

Al subir un `.doc` con notas, un pipeline procesa el contenido con IA, extrae estructura, genera metadata SEO y persiste el resultado parseado en DB. La web lo expone como entrada de blog sin intervención manual.

**004 — Variantes de Diseño por Post**

Cada entrada de blog recibe variables de layout aleatorias o configurables (grid, tipografía, paleta, dirección de lectura) para romper la monotonía visual. Ningún post se ve igual a otro.

---

<div align="center">
<br />

<code>DESIGNED & CODED BY <a href='https://github.com/samuhlo'>samuhlo</a></code>

<small>Lugo, Galicia</small>

</div>
