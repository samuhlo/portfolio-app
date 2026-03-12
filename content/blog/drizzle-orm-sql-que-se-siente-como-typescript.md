---
title: "Drizzle ORM: SQL que se siente como TypeScript"
description: "Después de años con Prisma, probé Drizzle ORM en un proyecto serverless y no voy a volver. Así fue mi experiencia migrando y por qué creo que es el futuro del acceso a datos en TypeScript."
date: "2026-02-10"
category: "outside"
topics: ["drizzle", "typescript", "orm", "postgres", "serverless"]
time_to_read: 8
published: true
slug: "drizzle-orm-sql-que-se-siente-como-typescript"
---

# Drizzle ORM: SQL que se siente como TypeScript

Llevo años usando Prisma. Me ha funcionado bien. Pero en mi último proyecto necesitaba algo más ligero, más rápido en cold starts, y que no me obligara a aprender un query language nuevo. Encontré Drizzle y creo que no vuelvo atrás.

## El contexto

Estoy construyendo un portfolio con un backend serverless en Nuxt Nitro + Neon (PostgreSQL serverless). El pipeline es: un webhook de GitHub llega al servidor, se procesa con IA, y los datos se guardan en la base de datos.

Con Prisma, el cold start de este flujo era de ~3 segundos. En serverless, eso es inaceptable. Cada vez que alguien visitaba mi portfolio después de un periodo de inactividad, había un lag visible.

## Por qué Drizzle

Drizzle es diferente a Prisma en un punto fundamental: no tiene un runtime pesado. No genera un cliente. No necesita un engine binario. Es una capa fina sobre SQL que se resuelve completamente en TypeScript.

Lo que significa en la práctica: mi cold start pasó de ~3s a ~400ms. Eso es un 87% de mejora solo por cambiar el ORM.

Pero la velocidad no es lo único. Lo que más me gusta de Drizzle es que si sabes SQL, ya sabes Drizzle. No hay un "Drizzle Query Language" nuevo que aprender. Los schemas se definen en TypeScript puro:

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  summary: text('summary'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

Y las queries se leen como SQL traducido a TypeScript:

```typescript
const result = await db
  .select()
  .from(projects)
  .where(eq(projects.isPublic, true))
  .orderBy(desc(projects.updatedAt))
  .limit(10)
```

No hay magia. No hay auto-completado mágico que genera queries que no entiendes. Cada línea es explícita.

## La migración desde Prisma

No voy a mentir: la migración no fue trivial. Prisma tiene un sistema de migraciones muy cómodo con `prisma migrate`. Drizzle tiene `drizzle-kit` que es funcional pero menos pulido.

Lo que más costó fue traducir las relaciones. En Prisma, las relaciones many-to-many son casi automáticas. En Drizzle, tienes que definir la tabla de unión explícitamente. Más trabajo, pero también más control.

```typescript
// Tabla de unión explícita
export const projectsToTech = pgTable('projects_to_tech', {
  projectId: text('project_id').references(() => projects.id),
  techId: text('tech_id').references(() => techStack.id),
})
```

El proceso completo me llevó unas 4 horas. La mayoría del tiempo fue reescribir queries, no el schema.

## Lo que echo de menos de Prisma

Prisma Studio. Tener una UI para explorar tus datos es increíblemente útil en desarrollo. Drizzle Studio existe pero es más limitado.

También echo de menos la generación automática de tipos. En Prisma, `prisma generate` te da tipos perfectos. En Drizzle, los tipos vienen del schema directamente (que es mejor en teoría), pero a veces necesitas hacer inferencias manuales con `InferSelectModel<typeof projects>`.

## Lo que Drizzle hace mejor

El punto más fuerte para mí: las queries complejas. En Prisma, cuando necesitas un JOIN complejo o un subquery, acabas usando `$queryRaw` y pierdes todo el type-safety. En Drizzle, puedes componer queries complejas manteniendo los tipos:

```typescript
const projectsWithTech = await db
  .select({
    project: projects,
    tech: techStack,
  })
  .from(projects)
  .leftJoin(projectsToTech, eq(projects.id, projectsToTech.projectId))
  .leftJoin(techStack, eq(projectsToTech.techId, techStack.id))
  .where(eq(projects.isPublic, true))
```

Esto en Prisma requeriría `include` anidados o un raw query. En Drizzle es una query tipada y legible.

## ¿Cuándo NO usar Drizzle?

Si tu equipo no sabe SQL, Prisma sigue siendo mejor opción. Su abstracción es más amigable para devs que vienen de frontend. Si necesitas un ecosistema maduro con plugins y herramientas de terceros, Prisma tiene más recorrido. Y si no estás en serverless, el cold start de Prisma probablemente no sea un problema real para ti.

## Veredicto

Para proyectos serverless con TypeScript, Drizzle es mi nueva primera opción. No es perfecto, pero su filosofía de "SQL-first" encaja con cómo quiero trabajar: entendiendo lo que pasa en cada capa, sin magia que me esconda la complejidad.

Si vienes de Prisma y estás cómodo con SQL, dale una oportunidad. El primer día duele un poco, pero al segundo ya no quieres volver.
