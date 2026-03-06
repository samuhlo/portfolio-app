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
import { logger } from '../../utils/logger';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const validated = ProjectQuerySchema.parse(query);

    const primaryTech = validated.primary_tech;
    const limit = validated.limit;

    logger.api.start(`/api/projects | tech: ${primaryTech || 'all'} | limit: ${limit || 'all'}`);

    let results;
    try {
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
    } catch (err) {
      logger.db.error('SELECT_PROJECTS', err instanceof Error ? err.message : 'unknown');
      throw err;
    }

    const mapped = results.map((p) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline,
      vNote: p.vNote,
      projectColor: p.projectColor,
      hoverTextCard: p.hoverTextCard,
      techStack: p.techStack,
      primaryTech: p.primaryTech,
      mainImgUrl: p.mainImgUrl,
      repoUrl: p.repoUrl,
      liveUrl: p.liveUrl,
      year: p.year,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    logger.api.success('/api/projects', mapped.length);

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
