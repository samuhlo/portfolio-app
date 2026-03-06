/**
 * ========================================================================
 * [INGEST] :: PROJECT INGESTION PIPELINE
 * ========================================================================
 * DESC:   Pipeline completo de ingesta de proyectos:
 *         1. Fetch README desde GitHub
 *         2. Extraer hidden metadata
 *         3. Detectar marker de exclusión
 *         4. Validar longitud mínima
 *         5. IA extraction
 *         6. Strict mode filters
 *         7. Save/Delete en DB
 * ========================================================================
 */
import { Octokit } from 'octokit';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { projects } from '../db/schema';
import { extractProjectData } from './ai';
import { invalidateAllProjectCaches } from './cache';
import type { Project } from '../../shared/types';

const HIDDEN_MARKER = '<!-- portfolio:hidden -->';
const MIN_README_LENGTH = 50;

interface IngestResult {
  action: 'save' | 'delete' | 'skip';
  projectId: string;
  project?: Project;
  reason?: string;
}

interface HiddenData {
  postUrl?: string;
  blogUrl?: string;
  imagesUrl?: string[];
}

/**
 * ◼️ GET GITHUB CLIENT
 * ---------------------------------------------------------
 * Crea un cliente Octokit autenticado.
 * Intenta GITHUB_SEED_TOKEN primero (para scripts de seed).
 * Fallback a GITHUB_TOKEN (para uso general).
 *
 * [CRITICAL]: Token es requerido. Sin él, no se pueden fetchear READMEs.
 */
function getGitHubClient(): Octokit {
  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('[INGEST] GitHub token is required (GITHUB_SEED_TOKEN)');
  }
  return new Octokit({ auth: token });
}

/**
 * ◼️ PARSE HIDDEN DATA
 * ---------------------------------------------------------
 * Extrae metadatos de comentarios HTML del README.
 * Soporta: post_url, blog_url, images_url (multiline).
 * Usa regex case-insensitive para flexibilidad.
 *
 * [NOTE]: WHITESPACE HANDLING -> trim() en cada línea de URLs
 */
function parseHiddenData(content: string): HiddenData {
  const data: HiddenData = { imagesUrl: [] };

  // BUSCAR post_url -> <!-- post_url: https://... -->
  const postUrlMatch = content.match(/<!--\s*post_url:\s*(.*?)\s*-->/i);
  if (postUrlMatch?.[1]) {
    data.postUrl = postUrlMatch[1].trim();
  }

  // BUSCAR blog_url -> <!-- blog_url: https://... -->
  const blogUrlMatch = content.match(/<!--\s*blog_url:\s*(.*?)\s*-->/i);
  if (blogUrlMatch?.[1]) {
    data.blogUrl = blogUrlMatch[1].trim();
  }

  // BUSCAR images_url -> <!-- images_url: url1\nurl2\nurl3 -->
  const imagesMatch = content.match(/<!--\s*images_url:\s*([\s\S]*?)\s*-->/i);
  if (imagesMatch?.[1]) {
    const urls = imagesMatch[1]
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    data.imagesUrl = urls;
  }

  return data;
}

/**
 * ◼️ FETCH README
 * ---------------------------------------------------------
 * Intenta fetchear README.md de múltiples ramas (main, master).
 * Decodifica de base64 (formato de API de GitHub).
 * Retorna null si no se encuentra en ninguna rama.
 */
async function fetchReadme(octokit: Octokit, owner: string, repo: string): Promise<string | null> {
  const branches = ['main', 'master'];

  for (const branch of branches) {
    try {
      const response = await octokit.rest.repos.getReadme({
        owner,
        repo,
        ref: branch,
      });
      // DECODIFICAR base64 -> UTF-8
      const content = Buffer.from(response.data.content ?? '', 'base64').toString('utf-8');
      console.log(`[INGEST] >> FETCH_README :: branch: ${branch} | size: ${content.length} chars`);
      return content;
    } catch (error) {
      // NO ENCONTRADO EN ESTA RAMA -> Intentar la siguiente
      console.log(`[INGEST] :: NO_README   :: branch: ${branch} | trying next...`);
    }
  }

  return null;
}

/**
 * ◼️ INGEST PROJECT
 * ---------------------------------------------------------
 * Pipeline completo de ingesta: fetch → validate → extract → save.
 * 1. Fetch README desde GitHub (main o master)
 * 2. Detectar marcadores de exclusión
 * 3. Validar longitud mínima
 * 4. Extracción de metadata oculta (comments)
 * 5. Llamada a IA para extracción automática
 * 6. Strict mode: validar campos requeridos
 * 7. Save o delete en DB según resultados
 *
 * [NOTE]: strictMode requiere mainImgUrl, imagesUrl, liveUrl.
 */
export async function ingestProject(
  owner: string,
  repo: string,
  octokit?: Octokit,
): Promise<IngestResult> {
  const client = octokit ?? getGitHubClient();
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const projectId = repo.toLowerCase();

  console.log(`[INGEST] >> INGEST_START  :: owner: ${owner} | repo: ${repo}`);

  const readmeContent = await fetchReadme(client, owner, repo);
  if (!readmeContent) {
    console.log(`[INGEST] :: README_SKIP   :: no readme found in any branch`);
    return { action: 'skip', projectId, reason: 'README not found' };
  }

  // DETECTAR MARKER DE EXCLUSIÓN -> portfolio:hidden
  if (readmeContent.includes(HIDDEN_MARKER)) {
    console.log(`[INGEST] :: HIDDEN_MARK   :: marker detected, deleting project`);
    await deleteProject(projectId);
    return { action: 'delete', projectId, reason: 'Hidden marker detected' };
  }

  // VALIDAR LONGITUD MÍNIMA -> Evitar READMEs muy cortos
  if (readmeContent.length < MIN_README_LENGTH) {
    console.log(`[INGEST] :: TOO_SHORT     :: size: ${readmeContent.length} chars | min: ${MIN_README_LENGTH}`);
    return {
      action: 'skip',
      projectId,
      reason: `README too short (${readmeContent.length} chars)`,
    };
  }

  const hiddenData = parseHiddenData(readmeContent);

  const strictMode = process.env.NUXT_STRICT_MODE !== 'false';

  console.log(`[INGEST] >> EXTRACT_IA    :: strict_mode: ${strictMode}`);

  let project: Project;
  try {
    project = await extractProjectData({
      repoUrl,
      readmeContent,
      hiddenData,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[INGEST] !! EXTRACT_FAIL :: error: ${errMsg}`);
    return {
      action: 'skip',
      projectId,
      reason: `IA extraction failed: ${errMsg}`,
    };
  }

  // STRICT MODE CHECK -> Validar campos críticos
  if (strictMode) {
    const missingFields: string[] = [];
    if (!project.mainImgUrl) missingFields.push('mainImgUrl');
    if (!project.imagesUrl || project.imagesUrl.length === 0) missingFields.push('imagesUrl');
    if (!project.liveUrl) missingFields.push('liveUrl');

    if (missingFields.length > 0) {
      console.log(
        `[INGEST] :: STRICT_FAIL   :: missing: ${missingFields.join(' | ')} | deleting`,
      );
      await deleteProject(projectId);
      return {
        action: 'delete',
        projectId,
        reason: `Strict mode: missing required fields (${missingFields.join(', ')})`,
      };
    }
  }

  await saveProject(project);

  return { action: 'save', projectId, project };
}

/**
 * ◼️ SAVE PROJECT
 * ---------------------------------------------------------
 * Inserta o actualiza proyecto en DB (upsert).
 * Invalida caches después de cambios.
 */
async function saveProject(project: Project): Promise<void> {
  console.log(`[INGEST] >> SAVE_PROJECT  :: id: ${project.id}`);

  await db
    .insert(projects)
    .values({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      vNote: project.vNote,
      projectColor: project.projectColor,
      hoverTextCard: project.hoverTextCard,
      techStack: project.techStack,
      primaryTech: project.primaryTech,
      mainImgUrl: project.mainImgUrl,
      imagesUrl: project.imagesUrl,
      repoUrl: project.repoUrl,
      liveUrl: project.liveUrl,
      year: project.year,
      postUrl: project.postUrl,
      blogUrl: project.blogUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        vNote: project.vNote,
        projectColor: project.projectColor,
        hoverTextCard: project.hoverTextCard,
        techStack: project.techStack,
        primaryTech: project.primaryTech,
        mainImgUrl: project.mainImgUrl,
        imagesUrl: project.imagesUrl,
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        year: project.year,
        postUrl: project.postUrl,
        blogUrl: project.blogUrl,
        updatedAt: new Date(),
      },
    });

  await invalidateAllProjectCaches();
  console.log(`[INGEST] ++ PROJECT_SAVED :: id: ${project.id} | cache invalidated`);
}

/**
 * ◼️ DELETE PROJECT
 * ---------------------------------------------------------
 * Elimina proyecto de DB e invalida caches.
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  console.log(`[INGEST] >> DELETE_PROJECT :: id: ${projectId}`);

  const result = await db
    .delete(projects)
    .where(eq(projects.id, projectId))
    .returning({ id: projects.id });

  await invalidateAllProjectCaches();
  console.log(`[INGEST] ++ PROJECT_DELETED :: id: ${projectId} | cache invalidated`);

  return result.length > 0;
}
