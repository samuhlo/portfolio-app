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

function getGitHubClient(): Octokit {
  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('[INGEST] GitHub token is required (GITHUB_SEED_TOKEN)');
  }
  return new Octokit({ auth: token });
}

function parseHiddenData(content: string): HiddenData {
  const data: HiddenData = { imagesUrl: [] };

  const postUrlMatch = content.match(/<!--\s*post_url:\s*(.*?)\s*-->/i);
  if (postUrlMatch?.[1]) {
    data.postUrl = postUrlMatch[1].trim();
  }

  const blogUrlMatch = content.match(/<!--\s*blog_url:\s*(.*?)\s*-->/i);
  if (blogUrlMatch?.[1]) {
    data.blogUrl = blogUrlMatch[1].trim();
  }

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

async function fetchReadme(octokit: Octokit, owner: string, repo: string): Promise<string | null> {
  const branches = ['main', 'master'];

  for (const branch of branches) {
    try {
      const response = await octokit.rest.repos.getReadme({
        owner,
        repo,
        ref: branch,
      });
      const content = Buffer.from(response.data.content ?? '', 'base64').toString('utf-8');
      console.log(`[INGEST] README fetched from ${branch} branch`);
      return content;
    } catch (error) {
      console.log(`[INGEST] README not found in ${branch}, trying next...`);
    }
  }

  return null;
}

export async function ingestProject(
  owner: string,
  repo: string,
  octokit?: Octokit,
): Promise<IngestResult> {
  const client = octokit ?? getGitHubClient();
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const projectId = repo.toLowerCase();

  console.log(`[INGEST] Starting ingestion for ${owner}/${repo}`);

  const readmeContent = await fetchReadme(client, owner, repo);
  if (!readmeContent) {
    return { action: 'skip', projectId, reason: 'README not found' };
  }

  if (readmeContent.includes(HIDDEN_MARKER)) {
    console.log(`[INGEST] Hidden marker detected, deleting project ${projectId}`);
    await deleteProject(projectId);
    return { action: 'delete', projectId, reason: 'Hidden marker detected' };
  }

  if (readmeContent.length < MIN_README_LENGTH) {
    return {
      action: 'skip',
      projectId,
      reason: `README too short (${readmeContent.length} chars)`,
    };
  }

  const hiddenData = parseHiddenData(readmeContent);

  const strictMode = process.env.NUXT_STRICT_MODE !== 'false';

  console.log(`[INGEST] Extracting project data with IA (strictMode: ${strictMode})`);

  let project: Project;
  try {
    project = await extractProjectData({
      repoUrl,
      readmeContent,
      hiddenData,
    });
  } catch (error) {
    console.error('[INGEST] IA extraction failed:', error);
    return {
      action: 'skip',
      projectId,
      reason: `IA extraction failed: ${error}`,
    };
  }

  if (strictMode) {
    const missingFields: string[] = [];
    if (!project.mainImgUrl) missingFields.push('mainImgUrl');
    if (!project.imagesUrl || project.imagesUrl.length === 0) missingFields.push('imagesUrl');
    if (!project.liveUrl) missingFields.push('liveUrl');

    if (missingFields.length > 0) {
      console.log(
        `[INGEST] Strict mode: missing required fields [${missingFields.join(', ')}], deleting project`,
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

async function saveProject(project: Project): Promise<void> {
  console.log(`[INGEST] Saving project ${project.id}`);

  await db
    .insert(projects)
    .values({
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
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: projects.id,
      set: {
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
        updatedAt: new Date(),
      },
    });

  await invalidateAllProjectCaches();
  console.log(`[INGEST] Project ${project.id} saved and cache invalidated`);
}

export async function deleteProject(projectId: string): Promise<boolean> {
  console.log(`[INGEST] Deleting project ${projectId}`);

  const result = await db
    .delete(projects)
    .where((projects.id = projectId))
    .returning({ id: projects.id });

  await invalidateAllProjectCaches();
  console.log(`[INGEST] Project ${projectId} deleted and cache invalidated`);

  return result.length > 0;
}
