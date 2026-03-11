---
title: 'Anatomy of a Living Portfolio: GitHub Webhooks + IA'
description: 'Cómo construí un sistema donde mi portfolio se actualiza solo cada vez que hago git push. Webhooks, OpenAI, Zod y la magia de no tener que mantener un CMS.'
date: '2026-03-03'
category: 'breakdown'
topics: ['github', 'webhooks', 'openai', 'zod', 'automatizacion', 'nuxt']
time_to_read: 10
published: true
slug: 'anatomy-of-a-living-portfolio'
---

# Anatomy of a Living Portfolio: GitHub Webhooks + IA

Odio mantener portfolios. Haces un proyecto, lo terminas, y luego tienes que ir a tu portfolio, crear una nueva entrada, escribir una descripción, subir screenshots, añadir tags... La fricción es tan alta que la mayoría de devs terminamos con portfolios desactualizados.

Mi solución: que el :hand-drawn{svg="/blog/doodles/underline.svg" placement="under" stroke-color="#ffca40" stroke-width=8}[portfolio] se actualice solo.

## La idea

Cada vez que hago push a uno de mis repositorios públicos, si el README ha cambiado, mi portfolio lo detecta, lee el contenido, lo pasa por IA para extraer datos estructurados, valida el resultado, y actualiza la base de datos. La próxima vez que alguien visita mi portfolio, ve la información actualizada.

Zero mantenimiento manual.

## La arquitectura

El flujo completo es:

1. Hago `git push` con un README actualizado
2. GitHub dispara un webhook hacia mi endpoint
3. Mi servidor Nitro recibe el payload y verifica la firma
4. Descarga el contenido raw del README
5. Lo envía a OpenAI con un prompt estructurado
6. Valida la respuesta con Zod
7. Hace upsert en la base de datos (Neon + Drizzle)

::blog-image
---
src: blog/anatomy-of-a-living-portfolio/prueba_blog_1.jpg
alt: Diagrama del flujo completo — webhook, IA, base de datos
width: 1200
height: 800
caption: El flujo completo desde el git push hasta la base de datos
---
::

Vamos pieza por pieza.

::hand-drawn{svg="/blog/doodles/circle.svg" placement="around"
stroke-color="#ff0000"}

El webhook

::

En GitHub, configuro un webhook a nivel de organización (para no tener que hacerlo repo por repo) que escucha el evento `push`. El payload incluye información sobre qué archivos cambiaron.

En mi servidor, lo primero es verificar que el webhook viene realmente de GitHub:

```typescript
// server/api/webhooks/github.post.ts
export default defineEventHandler(async (event) => {
  const signature = getHeader(event, 'x-hub-signature-256');
  const body = await readRawBody(event);

  const expected = `sha256=${createHmac('sha256', config.githubWebhookSecret)
    .update(body)
    .digest('hex')}`;

  if (signature !== expected) {
    throw createError({ statusCode: 401, message: 'Invalid signature' });
  }

  const payload = JSON.parse(body);

  // Solo nos interesan los pushes que modifican README.md
  const readmeChanged = payload.commits?.some(
    (commit) => commit.modified?.includes('README.md') || commit.added?.includes('README.md'),
  );

  if (!readmeChanged) {
    return { status: 'skipped', reason: 'No README changes' };
  }

  // Procesar...
});
```

La verificación de firma es crítica. Sin ella, cualquiera podría mandar payloads falsos a tu endpoint y corromperte los datos.

## La extracción con IA

Una vez que sé que el README cambió, descargo el contenido raw y se lo paso a OpenAI con un prompt muy específico:

```typescript
const prompt = `
Analiza el siguiente README de un proyecto de software y extrae 
la información en formato JSON con esta estructura exacta:
{
  "name": "nombre del proyecto",
  "summary": "resumen técnico de 2-3 frases",
  "techStack": ["array de tecnologías principales"],
  "keyFeatures": ["3-5 features principales"],
  "category": "web|mobile|cli|library|other"
}

Mantén un tono técnico y profesional. El resumen debe explicar 
el problema que resuelve y cómo lo resuelve. No inventes información 
que no esté en el README.

README:
${readmeContent}
`;
```

La clave del prompt es ser extremadamente específico con la estructura que esperas. Si le dices "extrae información", te va a dar lo que quiera. Si le das un JSON schema exacto, el output es predecible.

::blog-image
---
src: blog/anatomy-of-a-living-portfolio/prueba_blog_2.jpg
alt: Ejemplo de respuesta estructurada de la IA
width: 1200
height: 800
caption: Output del modelo después de procesar un README real
---
::

Uso GPT-4o-mini para esto porque es rápido, barato, y más que suficiente para extraer datos estructurados de un README. No necesitas GPT-4 para esto.

## La validación con Zod

Aquí es donde la cosa se pone seria. No confío en la IA. Ni en la mía, ni en la artificial. Todo lo que vuelve de OpenAI pasa por un schema de Zod antes de tocar la base de datos:

```typescript
const ProjectAIResponse = z.object({
  name: z.string().min(1).max(100),
  summary: z.string().min(10).max(500),
  techStack: z.array(z.string()).min(1).max(20),
  keyFeatures: z.array(z.string()).min(1).max(10),
  category: z.enum(['web', 'mobile', 'cli', 'library', 'other']),
});

const parsed = ProjectAIResponse.safeParse(aiResponse);

if (!parsed.success) {
  console.error('AI response validation failed:', parsed.error);
  // Log para debugging, pero no crashear
  return { status: 'error', issues: parsed.error.issues };
}
```

El `safeParse` en lugar de `parse` es importante. No quiero que un error de la IA tumbe mi webhook. Si la validación falla, lo logueo y sigo. Puedo revisar manualmente después.

## El upsert

Con los datos validados, hago un upsert en Neon usando Drizzle:

```typescript
await db
  .insert(projects)
  .values({
    id: repoFullName, // 'usuario/repo' como ID único
    name: parsed.data.name,
    summary: parsed.data.summary,
    category: parsed.data.category,
    updatedAt: new Date(),
  })
  .onConflictDoUpdate({
    target: projects.id,
    set: {
      name: parsed.data.name,
      summary: parsed.data.summary,
      category: parsed.data.category,
      updatedAt: new Date(),
    },
  });
```

El `onConflictDoUpdate` es lo que hace que esto sea idempotente. Si el proyecto ya existe, se actualiza. Si es nuevo, se crea. Puedo recibir el mismo webhook diez veces y el resultado es el mismo.

## Errores y edge cases

Los que me encontré en producción:

Los READMEs vacíos o con solo un título rompen la IA. Ahora verifico que el README tenga al menos 100 caracteres antes de procesarlo.

Los rate limits de OpenAI. Si hago muchos pushes seguidos, puedo exceder el límite. Solución: una cola simple con un delay de 2 segundos entre procesamiento.

Los repos privados que se hacen públicos disparan un evento `push` con todos los commits. Eso puede significar muchos webhooks de golpe para el mismo repo. El upsert lo maneja, pero generaba procesamiento innecesario. Ahora cacheo el último SHA procesado y comparo.

## Lo que mejoraría

El pipeline actual es síncrono dentro del webhook. Si la IA tarda, el webhook también. GitHub tiene un timeout de 10 segundos para webhooks. Idealmente debería aceptar el webhook inmediatamente (responder 200), y procesar en background con una queue.

También me gustaría añadir generación automática de screenshots. Existe la idea de usar Puppeteer o Playwright para navegar al repo desplegado, hacer un screenshot, y guardarlo. Pero eso es mucho más complejo y lo dejo para una futura iteración.

## Resultado

Mi portfolio lleva un mes con este sistema y se ha actualizado solo 14 veces sin que yo toque nada. Cada push a un README se refleja en la web en menos de 30 segundos. Es exactamente lo que quería: un portfolio que está vivo mientras yo me dedico a lo que realmente importa, que es construir cosas.

::draw-heading{svg="/blog/doodles/underline.svg" level="2" trigger="scroll"}
La extracción con IA (con doodle)
::

---

## [TEST] HandDrawn doodles

**sin stroke-color** — hereda el color de categoría del post automáticamente:

:hand-drawn{svg="/blog/doodles/underline.svg" placement="under"}[design systems]

**stroke-color="accent"** — idem, explícito:

:hand-drawn{svg="/blog/doodles/circle.svg" placement="around" stroke-color="accent"}[Zod]

**stroke-color="#hex"** — color fijo:

:hand-drawn{svg="/blog/doodles/underline.svg" placement="under" stroke-color="#e85d4a"}[webhooks]

**placement="over"**:

:hand-drawn{svg="/blog/doodles/underline.svg" placement="over"}[sobre el texto]

**placement="left"**:

:hand-drawn{svg="/blog/doodles/arrow-down.svg" placement="left"}[edge case]

**placement="right"**:

:hand-drawn{svg="/blog/doodles/arrow-down.svg" placement="right"}[upsert]

**trigger="load"** — se dibuja al montar:

:hand-drawn{svg="/blog/doodles/asterisk.svg" placement="around" trigger="load" duration="2"}[idempotente]

**trigger="hover"** — draw/erase on hover:

:hand-drawn{svg="/blog/doodles/underline.svg" placement="under" trigger="hover"}[ pasa el cursor aquí]

**trigger="scroll"** — se dibuja al montar:

:hand-drawn{svg="/blog/doodles/asterisk.svg" placement="around" trigger="scroll" duration="2"}[SCROOOOLL]

## [TEST] ImageSlider

::image-slider
---
images:
  - src: blog/anatomy-of-a-living-portfolio/prueba_blog_1.jpg
    alt: Prueba imagen 1
    label: WEBHOOK_FLOW
  - src: blog/anatomy-of-a-living-portfolio/prueba_blog_2.jpg
    alt: Prueba imagen 2
    label: AI_PIPELINE
---
::

## [TEST] CodePreview — GSAP live demo

::code-preview
---
height: 300
html: |
  <div class="scene">
    <div class="box"></div>
  </div>
css: |
  body {
    background: #0c0011;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .scene {
    position: relative;
    width: 400px;
    height: 80px;
  }
  .box {
    width: 60px;
    height: 60px;
    background: #ffca40;
    border-radius: 4px;
    position: absolute;
    top: 10px;
    left: 0;
  }
js: |
  gsap.to(".box", {
    x: 340,
    rotation: 360,
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
---
::
