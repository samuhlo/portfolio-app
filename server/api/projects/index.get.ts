/**
 * ========================================================================
 * [API] :: GET PROJECTS LIST
 * ========================================================================
 * DESC:   Endpoint para obtener el listado de proyectos.
 *         Usa validación Zod + caché SWR.
 * ========================================================================
 */
import { db } from '../../db';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ProjectQuerySchema } from '../../validators/project.schema';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const validated = ProjectQuerySchema.parse(query);

    const primaryTech = validated.primary_tech;
    const limit = validated.limit;

    console.log(
      `[API] Fetching projects (primaryTech: ${primaryTech || 'all'}, limit: ${limit || 'all'})`,
    );

    let results;
    if (primaryTech) {
      results = await db
        .select()
        .from(projects)
        .where(eq(projects.primaryTech, primaryTech))
        .limit(limit ?? 50);
    } else {
      results = await db
        .select()
        .from(projects)
        .limit(limit ?? 50);
    }

    const mapped = results.map((p) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline,
      techStack: p.techStack,
      primaryTech: p.primaryTech,
      mainImgUrl: p.mainImgUrl,
      repoUrl: p.repoUrl,
      liveUrl: p.liveUrl,
      year: p.year,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    console.log(`[API] Returning ${mapped.length} projects`);

    return { data: mapped };
  },
  {
    maxAge: 60 * 5,
    swr: true,
    name: 'projects-list',
    getKey: (event) => {
      const query = getQuery(event);
      const tech = query.primary_tech || 'all';
      const limit = query.limit || 'all';
      return `projects:${tech}:${limit}`;
    },
  },
);
