/**
 * ========================================================================
 * [API] :: GET PROJECT BY ID
 * ========================================================================
 * DESC:   Endpoint para obtener detalles de un proyecto específico.
 *         Usa validación Zod + caché SWR.
 * ========================================================================
 */
import { db } from '../../db';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ProjectParamsSchema } from '../../validators/project.schema';

export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, 'id');
    const validated = ProjectParamsSchema.parse({ id });

    console.log(`[API] Fetching project ${validated.id}`);

    const result = await db.select().from(projects).where(eq(projects.id, validated.id)).limit(1);

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: `Project ${validated.id} not found`,
      });
    }

    const project = result[0];

    console.log(`[API] Returning project ${validated.id}`);

    return {
      data: {
        id: project.id,
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        techStack: project.techStack,
        primaryTech: project.primaryTech,
        mainImgUrl: project.mainImgUrl,
        imagesUrl: project.imagesUrl,
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        year: project.year,
        postUrl: project.postUrl,
        blogUrl: project.blogUrl,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    };
  },
  {
    maxAge: 60 * 5,
    swr: true,
    name: 'project-detail',
    getKey: (event) => {
      const id = getRouterParam(event, 'id') || 'unknown';
      return `projects:${id}`;
    },
  },
);
